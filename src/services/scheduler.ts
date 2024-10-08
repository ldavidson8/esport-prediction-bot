// @ts-nocheck

import { TextChannel, Guild, MessageReaction, User } from 'discord.js';
import { CustomClient } from '../classes/client.js';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from '../utils/teams.js';
import { logger } from '../utils/logger.js';
import { scheduleJob } from 'node-schedule';
import { fetchMatchData } from '../api/fetchMatchData.js';
import { fetchScheduleData } from '../api/fetchScheduleData.js';
import { ensurePredictionsChannel } from '../utils/channelUtils.js';
import {
    determineWinner,
    filterUpcomingEvents,
    type Event as CustomEvent,
} from '../utils/eventUtils.js';
import {
    addPostedMatch,
    upsertUserPrediction,
    updatePredictions,
    deleteMatchById,
    getPastMatches,
} from '../database/database.js';

const messageCollectors = new Map<
    string,
    { collector: any; userReactions: Map<string, Set<string>> }
>();

function handleMessageReactionAdd(client: CustomClient, reaction: MessageReaction, user: User) {
    const messageData = messageCollectors.get(reaction.message.id);
    if (!messageData || user.bot) return;

    const { userReactions, validEmojiIds, team1Emoji, team2Emoji, channel, event } = messageData;

    if (!validEmojiIds.includes(reaction.emoji.id)) {
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

        if (userReactionsSet?.size === 1 && !userReactionsSet.has(reaction.emoji.id)) {
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
            userReactionsSet?.add(reaction.emoji.id);
            const prediction =
                reaction.emoji.id === validEmojiIds[0]
                    ? event.match.teams[0].code
                    : event.match.teams[1].code;
            upsertUserPrediction(event.id, user.id, prediction);
        }
    }
}

function handleMessageReactionRemove(reaction: MessageReaction, user: User) {
    const messageData = messageCollectors.get(reaction.message.id);
    if (!messageData || user.bot) return;

    const { userReactions, validEmojiIds } = messageData;

    if (validEmojiIds.includes(reaction.emoji.id)) {
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
    client.on('messageReactionAdd', (reaction, user) =>
        handleMessageReactionAdd(client, reaction, user)
    );

    client.on('messageReactionRemove', (reaction, user) =>
        handleMessageReactionRemove(reaction, user)
    );
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

    const team1EmojiId = team1Emoji.match(/:(\d+)>/)?.[1];
    const team2EmojiId = team2Emoji.match(/:(\d+)>/)?.[1];

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
                    icon_url: 'https://lolesports.com/favicon.ico',
                },
                url: `https://lolesports.com/vod/${matchId}`,
                color: 0x2f4ff1,
                timestamp: new Date(event.startTime).toISOString(),
            },
        ],
    };

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

        messageCollectors.set(message.id, {
            collector,
            userReactions,
            validEmojiIds,
            team1Emoji,
            team2Emoji,
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
    }
}

async function hourlyScheduleProcess(client: CustomClient) {
    logger.info('Running hourly schedule processor');
    await checkPastMatches(client);
    await processSchedule(client);
}

export function startHourlyScheduleProcessor(client: CustomClient) {
    // scheduleJob('0 */1 * * *', () => hourlyScheduleProcess(client)); // every hour
    scheduleJob('*/30 * * * * *', () => hourlyScheduleProcess(client)); // every 30 seconds
}
