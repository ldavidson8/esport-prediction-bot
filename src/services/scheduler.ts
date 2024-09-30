// @ts-nocheck

import { TextChannel, GuildChannel, ChannelType, Guild, MessageReaction, User } from 'discord.js';
import { CustomClient } from '../classes/client.js';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from '../utils/teams.js';
import Database from 'better-sqlite3';
import { logger } from '../utils/logger.js';

const db = new Database('data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS posted_matches (
    id TEXT PRIMARY KEY,
    posted_at INTEGER
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
        'INSERT INTO posted_matches (id, posted_at, message_id, channel_id, guild_id) VALUES (?, ?)'
    );
    stmt.run(matchId, Date.now(), messageId, channelId, guildId);

    const twentyFourHoursAgo = dayjs().subtract(24, 'hours').unix();
    db.prepare('DELETE FROM posted_matches WHERE posted_at < ?').run(twentyFourHoursAgo);
}

async function sendMessage(client: CustomClient, channelName: string, message: string) {
    for (const guild of client.guilds.cache.values()) {
        const channel = guild.channels.cache.find(
            ch => ch.name === channelName && ch instanceof TextChannel && ch.isTextBased()
        ) as TextChannel | undefined;

        if (channel) {
            try {
                await channel.send(message);
                logger.info(`Message sent to ${channelName} in ${guild.name}`);
            } catch (error) {
                logger.error(`Failed to send message to ${channelName} in ${guild.name}`, error);
            }
        }
    }
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

function checkForPredictionsChannel(client: CustomClient): boolean {
    for (const guild of client.guilds.cache.values()) {
        const predictionsChannel = guild.channels.cache.find(
            channel =>
                channel.isTextBased() &&
                channel instanceof GuildChannel &&
                channel.name === 'bot-predictions'
        );

        if (predictionsChannel) {
            logger.info('Predictions channel found');
            return true;
        }
    }

    logger.info('Predictions channel not found');
    return false;
}

async function createPredictionsChannel(client: CustomClient) {
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

async function fetchScheduleData(): Promise<any> {
    const url =
        'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=98767975604431411';
    const options = {
        method: 'GET',
        headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
    };
    const response = await fetch(url, options);
    return response.json();
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

        const filter = (reaction: MessageReaction, user: User) =>
            (reaction.emoji.name === team1Emoji || reaction.emoji.name === team2Emoji) && !user.bot;

        const collector = message.createReactionCollector({
            filter,
            time: startTime.diff(dayjs()),
        });

        collector.on('collect', (reaction, user) => {
            const prediction = reaction.emoji.name === team1Emoji ? team1.code : team2.code;
            const stmt = db.prepare(
                'INSERT OR REPLACE INTO user_predictions (match_id, user_id, prediction, is_correct) VALUES (?, ?, ?, ?)'
            );
            stmt.run(event.id, user.id, prediction, null);

            const otherEmoji = reaction.emoji.name === team1Emoji ? team2Emoji : team1Emoji;
            const otherReaction = message.reactions.cache.find(
                reaction => reaction.emoji.name === otherEmoji
            );
            if (otherReaction) otherReaction.users.remove(user.id);
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
    const twentyFourHoursAgo = dayjs().subtract(24, 'hours').unix();
    const matches = db
        .prepare('SELECT * FROM posted_matches WHERE posted_at < ?')
        .all(twentyFourHoursAgo);

    for (const match of matches) {
        try {
            const guild = await client.guilds.fetch(match.guild_id);
            const channel = guild.channels.cache.get(match.channel_id) as TextChannel;
            const message = await channel.messages.fetch(match.message_id);

            const matchData = await fetchMatchData(match.id);
            const winner = determineWinner(matchData);

            if (winner && message) {
                updatePredictions(match.id, matchData.winner);
                await message.edit(
                    `${message.content}\nMatch completed. Winner: ${matchData.winner}`
                );
            } else {
                await message.send(`${match.id} winner: ${winner}`);
            }
        } catch (error) {
            logger.error(`Failed to process past match ${match.id}:`, error);
        }
    }

    db.prepare('DELETE FROM posted_matches WHERE posted_at < ?').run(twentyFourHoursAgo);
}

async function fetchMatchData(matchId: string): Promise<any> {
    const url = `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${matchId}`;
    const options = {
        method: 'GET',
        headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
    };
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data.data.event.match;
    } catch (error) {
        logger.error(`Failed to fetch match data for ${matchId}`, error);
    }
}

function determineWinner(matchData: any): string | null {
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

async function processSchedule(client: CustomClient, targetGuildId?: string): Promise<void> {
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

export {
    processSchedule,
    checkForPredictionsChannel,
    createPredictionsChannel,
    sendMessage,
    fetchMatchData,
    determineWinner,
};
