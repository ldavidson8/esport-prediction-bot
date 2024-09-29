import { Events, TextChannel, GuildChannel, ChannelType, Guild } from 'discord.js';
import { CustomClient } from './classes/client.js';
import fetch from 'node-fetch';
import schedule from 'node-schedule';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from './utils/teams.js';
import { logger } from './utils/logger.js';

const client = new CustomClient();

client.once(Events.ClientReady, readyClient => {
    logger.info(`Logged in as ${readyClient.user?.tag}`);
    if (!checkForPredictionsChannel()) createPredictionsChannel();
    // schedule.scheduleJob('*/10 * * * * *', () => processSchedule(client));
    sendMessage();
});

function sendMessage() {
    const guild = client.guilds.cache.first();
    if (!guild) {
        logger.error('Guild not found');
        return;
    }

    const generalChannel = guild.channels.cache.find(
        channel =>
            channel.isTextBased() && channel instanceof TextChannel && channel.name === 'general'
    ) as TextChannel;

    if (!generalChannel) {
        logger.error('General channel not found');
        return;
    }

    generalChannel.send('Hello, this is a test message!');
}

function checkForPredictionsChannel(): boolean {
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

async function createPredictionsChannel() {
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
        if (event.state !== 'unstarted') return false;
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');
        return timeDiff <= 24 && timeDiff >= 0;
    });
}

function findPredictionsChannel(guild: Guild): TextChannel | null {
    const predictionsChannel = guild.channels.cache.find(
        channel =>
            channel.isTextBased() &&
            channel instanceof GuildChannel &&
            channel.name === 'bot-predictions'
    ) as TextChannel;

    if (!predictionsChannel) {
        logger.error('Predictions channel not found');
        return null;
    }

    return predictionsChannel;
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

        if (team1Emoji || team2Emoji) {
            try {
                if (team1Emoji) await message.react(team1Emoji);
                if (team2Emoji) await message.react(team2Emoji);
            } catch (error) {
                logger.warn(`Failed to react with emojis ${team1Emoji} or ${team2Emoji}`, error);
            }
        }
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

async function processSchedule(client: CustomClient, targetGuildId?: string): Promise<void> {
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

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (interaction.isChatInputCommand()) {
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

client.start();
