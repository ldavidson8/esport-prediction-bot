import { TextChannel, Guild, MessageReaction, User, ReactionCollector } from 'discord.js';
import { CustomClient } from '../classes/client.js';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from '../utils/teams.js';
import { logger } from '../utils/logger.js';
import { scheduleJob } from 'node-schedule';
import { fetchMatchData } from '../api/fetchMatchData.js';
import { fetchScheduleData } from '../api/fetchScheduleData.js';
import { ensurePredictionsChannel } from '../utils/channelUtils.js';
import { determineWinner, filterUpcomingEvents, getBestOf } from '../utils/eventUtils.js';
import {
    addPostedMatch,
    upsertUserPrediction,
    updatePredictions,
    deleteMatchById,
    getPastMatches,
} from '../database/database.js';
import type { Event as CustomEvent } from '../interfaces/leagueEvent.js';

const messageCollectors = new Map<
    string,
    {
        collector: ReactionCollector;
        userReactions: Map<string, Set<string>>;
        validEmojiIds: string[];
        team1Emoji: string;
        team2Emoji: string;
        channel: TextChannel;
        event: CustomEvent;
    }
>();

function handleMessageReactionAdd(client: CustomClient, reaction: MessageReaction, user: User) {
    const messageData = messageCollectors.get(reaction.message.id);
    if (!messageData || user.bot) return;

    const { userReactions, validEmojiIds, team1Emoji, team2Emoji, channel, event } = messageData;

    if (reaction.emoji.id && !validEmojiIds.includes(reaction.emoji.id)) {
        reaction.users.remove(user.id);
        try {
            channel.send({
                content: `Please only use ${team1Emoji} or ${team2Emoji} to predict the match outcome.`,
                allowedMentions: { users: [user.id] },
            });
        } catch (error) {
            logger.error('Failed to send ephemeral message', error);
        }
    } else {
        if (!userReactions.has(user.id)) {
            userReactions.set(user.id, new Set());
        }
        const userReactionsSet = userReactions.get(user.id);

        if (
            userReactionsSet?.size === 1 &&
            reaction.emoji.id &&
            !userReactionsSet.has(reaction.emoji.id)
        ) {
            reaction.users.remove(user.id);
            try {
                channel.send({
                    content: ` <@${user.id}> You can only predict one outcome for this match. Please choose either ${team1Emoji} or ${team2Emoji}.`,
                    allowedMentions: { users: [user.id] },
                });
            } catch (error) {
                logger.error('Failed to send message', error);
            }
        } else {
            if (reaction.emoji.id) {
                userReactionsSet?.add(reaction.emoji.id);
            }
            const prediction =
                reaction.emoji.id === validEmojiIds[0]
                    ? (event.match.teams[0]?.code ?? 'Unknown')
                    : (event.match.teams[1]?.code ?? 'Unknown');
            upsertUserPrediction(event.match.id, user.id, prediction);
        }
    }
}

function handleMessageReactionRemove(reaction: MessageReaction, user: User) {
    const messageData = messageCollectors.get(reaction.message.id);
    if (!messageData || user.bot) return;

    const { userReactions, validEmojiIds } = messageData;

    if (reaction.emoji.id && validEmojiIds.includes(reaction.emoji.id)) {
        const userReactionSet = userReactions.get(user.id);
        if (userReactionSet) {
            userReactionSet.delete(reaction.emoji.id);
            if (userReactionSet.size === 0) {
                userReactions.delete(user.id);
            }
        }
    }
}

export function setupGlobalListeners(client: CustomClient) {
    client.on('messageReactionAdd', async (reaction, user) => {
        try {
            const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
            const fullUser = user.partial ? await user.fetch() : user;
            handleMessageReactionAdd(client, fullReaction, fullUser);
        } catch (error) {
            logger.error('Failed to fetch reaction', error);
        }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
        try {
            const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
            const fullUser = user.partial ? await user.fetch() : user;
            handleMessageReactionRemove(fullReaction, fullUser);
        } catch (error) {
            logger.error('Failed to fetch reaction', error);
        }
    });
}

export async function sendEventMessage(channel: TextChannel, event: CustomEvent, timeDiff: number) {
    const team1 = event.match.teams[0];
    const team2 = event.match.teams[1];

    if (!team1 || !team2 || team1.name === 'TBD' || team2.name === 'TBD') {
        logger.info('TBD team found, skipping');
        return;
    }

    const team1Emoji = getEmojiMarkdown(team1.code);
    const team2Emoji = getEmojiMarkdown(team2.code);

    const team1EmojiId = team1Emoji ? team1Emoji.match(/:(\d+)>/)?.[1] : undefined;
    const team2EmojiId = team2Emoji ? team2Emoji.match(/:(\d+)>/)?.[1] : undefined;

    const bestOf = getBestOf(event);
    const matchId = event.match.id;

    const startTime = dayjs(event.startTime);
    const messageContent = {
        embeds: [
            {
                title: `Upcoming match in ${timeDiff} hours`,
                description: `${team1Emoji} ${team1.name} vs ${team2Emoji} ${team2.name}`,
                fields: [
                    { name: 'League', value: event.league.name, inline: true },
                    { name: 'Block', value: event.blockName, inline: true },
                    {
                        name: 'Start Time',
                        value: `<t:${Math.floor(startTime.unix())}:F>`,
                        inline: false,
                    },
                    ...(bestOf
                        ? [{ name: 'Best Of', value: `Best of ${bestOf}`, inline: true }]
                        : []),
                ],
                footer: {
                    text: `Match ID: ${matchId}`,
                    icon_url: 'http://static.lolesports.com/leagues/1592594612171_WorldsDarkBG.png',
                },
                url: `https://lolesports.com/vod/${matchId}`,
                color: 0x2f4ff1,
                timestamp: startTime.toISOString(),
            },
        ],
    };

    try {
        const message = await channel.send(messageContent);

        if (team1Emoji) await message.react(team1Emoji);
        if (team2Emoji) await message.react(team2Emoji);

        addPostedMatch(matchId, message.id, channel.id, channel.guild.id);

        const validEmojiIds: string[] = [team1EmojiId, team2EmojiId].filter(
            (id): id is string => !!id
        );

        const userReactions = new Map<string, Set<string>>();

        const filter = (reaction: MessageReaction, user: User) => !user.bot;

        const collector: ReactionCollector = message.createReactionCollector({
            filter,
            time: startTime.diff(dayjs()),
        });

        messageCollectors.set(message.id, {
            collector,
            userReactions,
            validEmojiIds,
            team1Emoji: team1Emoji!,
            team2Emoji: team2Emoji!,
            channel,
            event,
        });

        collector.on('end', async () => {
            // Add logic later to determine if users' predictions were correct
            // messageCollectors.delete(message.id);
        });
    } catch (error) {
        logger.error('Failed to send message or add reactions', error);
    }
}

async function processGuild(guild: Guild, events: CustomEvent[], now: dayjs.Dayjs) {
    if (!guild) {
        logger.warn('No guild found');
        return;
    }

    const channel = await ensurePredictionsChannel(guild);
    if (!channel) {
        logger.warn(`No predictions channel found in guild ${guild.name}`);
        return;
    }

    for (const event of events) {
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');

        await sendEventMessage(channel, event, timeDiff);
    }
}

async function checkPastMatches(client: CustomClient) {
    const twentyFourHoursAgo = dayjs().subtract(24, 'hours').unix();
    const matches = getPastMatches(twentyFourHoursAgo);

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

                deleteMatchById(match.id);
            }
        } catch (error) {
            logger.error(`Failed to process past match ${match.id}:`, error);
        }
    }
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
        if (error instanceof Error) {
            logger.error(error.stack);
            logger.error(error.message);
        }
    }
}

async function scheduleProcess(client: CustomClient) {
    logger.info('Running schedule processor');
    await checkPastMatches(client);
    await processSchedule(client);
}

export function startScheduleProcessor(client: CustomClient) {
    scheduleJob('*/5 * * * *', () => scheduleProcess(client)); // run every 5 minutes

    /** Test script for running in seconds */
    // scheduleJob('*/10 * * * * *', () => scheduleProcess(client));
}
