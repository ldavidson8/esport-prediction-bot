// @ts-nocheck

import { TextChannel, GuildChannel, ChannelType, Guild, MessageReaction, User } from 'discord.js';
import { CustomClient } from '../classes/client.js';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from '../utils/teams.js';
import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';
import { scheduleJob } from 'node-schedule';
import { fetchMatchData } from '../api/fetchMatchData.js';
import { fetchScheduleData } from '../api/fetchScheduleData.js';

const db = new Database('data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS posted_matches (
    id TEXT PRIMARY KEY,
    posted_at INTEGER,
    message_id TEXT,
    channel_id TEXT,
    guild_id TEXT
    );
    CREATE TABLE IF NOT EXISTS user_predictions (
    match_id TEXT,
    user_id TEXT,
    prediction TEXT,
    is_correct INTEGER,
    PRIMARY KEY (match_id, user_id)
    );
`);

function isMatchPosted(matchId: string): boolean {
    const match = db.prepare('SELECT * FROM posted_matches WHERE id = ?').get(matchId);
    return !!match;
}

function addPostedMatch(
    matchId: string,
    messageId: string,
    channelId: string,
    guildId: string
): void {
    const stmt = db.prepare(
        'INSERT OR REPLACE INTO posted_matches (id, posted_at, message_id, channel_id, guild_id) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(matchId, Date.now(), messageId, channelId, guildId);
    logger.info(`Added match ${matchId} to posted_matches`);
}

function findPredictionsChannel(guild: Guild): TextChannel | null {
    const predictionsChannel = guild.channels.cache.find(
        channel =>
            channel.isTextBased() &&
            channel instanceof GuildChannel &&
            channel.name === 'bot-predictions'
    ) as TextChannel;

    if (!predictionsChannel) {
        logger.error(`Predictions channel not found in guild ${guild.name}`);
        return null;
    }

    return predictionsChannel;
}

export function checkForPredictionsChannel(client: CustomClient): boolean {
    for (const guild of client.guilds.cache.values()) {
        const predictionsChannel = findPredictionsChannel(guild);

        if (predictionsChannel) {
            logger.info('Predictions channel found');
            return true;
        }
    }

    logger.info('Predictions channel not found');
    return false;
}

export async function createPredictionsChannel(client: CustomClient) {
    const guild = client.guilds.cache.first();
    if (!guild) {
        logger.error('Guild not found');
        return null;
    }

    const predictionsChannel = await guild.channels.create({
        name: 'bot-predictions',
        type: ChannelType.GuildText,
    });

    return predictionsChannel;
}

interface Event {
    id: string;
    state: string;
    startTime: string;
    match: {
        teams: { name: string; code: string }[];
    };
    league: {
        name: string;
    };
    blockName: string;
}

function filterUpcomingEvents(events: Event[], now: dayjs.Dayjs): Event[] {
    return events.filter(event => {
        if (event.state !== 'unstarted' || isMatchPosted(event.id)) return false;
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');
        return timeDiff <= 79 && timeDiff >= 0;
    });
}

async function sendEventMessage(channel: TextChannel, event: Event, timeDiff: number) {
    const team1 = event.match.teams[0];
    const team2 = event.match.teams[1];

    if (!team1 || !team2 || team1.name === 'TBD' || team2.name === 'TBD') {
        logger.info('TBD team found, skipping');
        return;
    }

    const team1Emoji = getEmojiMarkdown(team1.code);
    const team2Emoji = getEmojiMarkdown(team2.code);

    const team1EmojiId = team1Emoji.match(/:(\d+)>/)?.[1];
    const team2EmojiId = team2Emoji.match(/:(\d+)>/)?.[1];

    const startTime = dayjs(event.startTime);
    const messageContent =
        `Upcoming match in ${timeDiff} hours: ${team1Emoji} ${team1.name} vs ${team2Emoji} ${team2.name}` +
        `\n${event.league.name} - ${event.blockName}` +
        `\nStarts at <t:${Math.floor(startTime.unix())}:F>`;

    try {
        const message = await channel.send(messageContent);

        if (team1Emoji) await message.react(team1Emoji);
        if (team2Emoji) await message.react(team2Emoji);

        addPostedMatch(event.id, message.id, channel.id, channel.guild.id);

        const validEmojiIds = [team1EmojiId, team2EmojiId].filter(Boolean);

        const userReactions = new Map<string, Set<string>>();

        const filter = (reaction: MessageReaction, user: User) => !user.bot;

        const collector = message.createReactionCollector({
            filter,
            time: startTime.diff(dayjs()),
        });

        collector.on('collect', async (reaction, user) => {
            const prediction = reaction.emoji.id === team1EmojiId ? team1.code : team2.code;
            const stmt = db.prepare(
                'INSERT OR REPLACE INTO user_predictions (match_id, user_id, prediction, is_correct) VALUES (?, ?, ?, ?)'
            );
            stmt.run(event.id, user.id, prediction, null);
        });

        message.client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.message.id !== message.id || user.bot) return;

            if (!validEmojiIds.includes(reaction.emoji.id)) {
                await reaction.users.remove(user.id);
                try {
                    await channel.send({
                        content: `Please only use ${team1Emoji} or ${team2Emoji} to predict the match outcome.`,
                        ephemeral: true,
                        target: user.id,
                    });
                } catch (error) {
                    logger.error('Failed to send ephemeral message', error);
                }
            } else {
                if (!userReactions.has(user.id)) {
                    userReactions.set(user.id, new Set());
                }
                const userReactionsSet = userReactions.get(user.id);

                if (userReactionsSet?.size === 1 && !userReactionsSet.has(reaction.emoji.id)) {
                    await reaction.users.remove(user.id);
                    try {
                        await channel.send({
                            content: ` <@${user.id}> You can only predict one outcome for this match. Please choose either ${team1Emoji} or ${team2Emoji}.`,
                            ephemeral: true,
                        });
                    } catch (error) {
                        logger.error('Failed to send ephemeral message', error);
                    }
                } else {
                    userReactionsSet?.add(reaction.emoji.id);
                }
            }
        });

        message.client.on('messageReactionRemove', (reaction, user) => {
            if (reaction.message.id !== message.id || user.bot) return;

            if (validEmojiIds.includes(reaction.emoji.id)) {
                const userReactionSet = userReactions.get(user.id);
                if (userReactionSet) {
                    userReactionSet.delete(reaction.emoji.id);
                    if (userReactionSet.size === 0) {
                        userReactions.delete(user.id);
                    }
                }
            }
        });

        collector.on('end', async () => {
            // add logic later to determine if users' predictions were correct
        });
    } catch (error) {
        logger.error('Failed to send message or add reactions', error);
    }
}

async function processGuild(guild: Guild, events: Event[], now: dayjs.Dayjs) {
    const predictionsChannel = findPredictionsChannel(guild);
    if (!predictionsChannel) return;

    for (const event of events) {
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');

        await sendEventMessage(predictionsChannel, event, timeDiff);
    }
}

async function checkPastMatches(client: CustomClient) {
    const twelveHoursAgo = dayjs().subtract(12, 'hours').unix();
    const matches = db
        .prepare('SELECT * FROM posted_matches WHERE posted_at < ?')
        .all(twelveHoursAgo);

    for (const match of matches) {
        try {
            const matchData = await fetchMatchData(match.id);
            const winner = determineWinner(matchData);

            if (winner) {
                updatePredictions(match.id, winner);

                try {
                    const guild = await client.guilds.fetch(match.guild_id);
                    const channel = guild.channels.cache.get(match.channel_id) as TextChannel;
                    const message = await channel.messages.fetch(match.message_id);
                    await message.edit(`${message.content}\nMatch completed. Winner: ${winner}`);
                } catch (error) {
                    logger.error(`Failed to update message for match ${match.id}:`, error);
                }

                db.prepare('DELETE FROM posted_matches WHERE id = ?').run(match.id);
            }
        } catch (error) {
            logger.error(`Failed to process past match ${match.id}:`, error);
        }
    }
}

export function determineWinner(matchData: any): string | null {
    const { strategy, teams } = matchData;
    const winThreshold = Math.ceil(strategy.count / 2);

    const team1 = teams[0];
    const team2 = teams[1];

    if (team1.result.gameWins >= winThreshold) {
        return team1.code;
    } else if (team2.result.gameWins >= winThreshold) {
        return team2.code;
    }

    return null;
}

function updatePredictions(matchId: string, winner: string) {
    const stmt = db.prepare(
        'UPDATE user_predictions SET is_correct = CASE WHEN prediction = ? THEN 1 ELSE 0 END WHERE match_id = ?'
    );
    stmt.run(winner, matchId);
}

export async function processSchedule(client: CustomClient, targetGuildId?: string): Promise<void> {
    await checkPastMatches(client);
    try {
        const data = await fetchScheduleData();
        const now = dayjs();
        const upcomingEvents = filterUpcomingEvents(data.data.schedule.events, now);

        const guildsToProcess: Guild[] = targetGuildId
            ? [client.guilds.cache.get(targetGuildId)].filter(
                  (guild): guild is Guild => guild !== undefined
              )
            : Array.from(client.guilds.cache.values());

        for (const guild of guildsToProcess) {
            await processGuild(guild, upcomingEvents, now);
        }
    } catch (error) {
        logger.error('Error fetching schedule', error);
    }
}

async function hourlyScheduleProcess(client: CustomClient) {
    logger.info('Running hourly schedule processor');
    await checkPastMatches(client);
    await processSchedule(client);
}

export function startHourlyScheduleProcessor(client: CustomClient) {
    // scheduleJob('0 */1 * * *', () => hourlyScheduleProcess(client));
    scheduleJob('*/30 * * * * *', () => hourlyScheduleProcess(client));
}
