import { Events, TextChannel, GuildChannel, ChannelType } from 'discord.js';
import { CustomClient } from './classes/client.js';
import fetch from 'node-fetch';
import schedule from 'node-schedule';
import dayjs from 'dayjs';
import { getEmojiMarkdown } from './utils/teams.js';
import pino from 'pino';

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
});

const client = new CustomClient();

client.once(Events.ClientReady, readyClient => {
    logger.info(`Logged in as ${readyClient.user?.tag}`);
    if (!checkForPredictionsChannel()) createPredictionsChannel();
    schedule.scheduleJob('0 0 */12 * * *', processSchedule);
    processSchedule(); // Call once at startup
});

function checkForPredictionsChannel() {
    const predictionsChannel = client.channels.cache.find(
        channel =>
            channel.isTextBased() &&
            channel instanceof GuildChannel &&
            channel.name === 'bot-predictions'
    ) as TextChannel;

    if (!predictionsChannel) {
        logger.error('Channel not found');
        return null;
    }

    return predictionsChannel;
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

async function processSchedule() {
    const url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US';
    const options = {
        method: 'GET',
        headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
    };

    try {
        const response = await fetch(url, options);
        const data: any = await response.json();

        const now = dayjs();
        const predictionsChannel = client.channels.cache.find(
            channel =>
                channel.isTextBased() &&
                channel instanceof GuildChannel &&
                channel.name === 'bot-predictions'
        ) as TextChannel;

        if (!predictionsChannel) {
            logger.error('Channel not found');
            return;
        }

        for (const event of data.data.schedule.events) {
            if (event.state !== 'unstarted') continue;
            const startTime = dayjs(event.startTime);
            const timeDiff = startTime.diff(now, 'hours');

            if (timeDiff <= 24 && timeDiff >= 0) {
                const team1 = event.match.teams[0];
                const team2 = event.match.teams[1];
                const team1Emoji = getEmojiMarkdown(team1.code) || '';
                const team2Emoji = getEmojiMarkdown(team2.code) || '';

                const message = await predictionsChannel.send(
                    `Upcoming match in ${timeDiff} hours: ${team1Emoji} ${team1.name} vs ${team2Emoji} ${team2.name}` +
                        `\n${event.league.name} - ${event.blockName}` +
                        `\nStarts at <t:${Math.floor(startTime.unix())}:F>`
                );

                if (team1Emoji) await message.react(team1Emoji);
                if (team2Emoji) await message.react(team2Emoji);
            }
        }
    } catch (error) {
        logger.error('Error fetching schedule', error);
    }
}

function sendMessageToOneChannel() {
    const generalChannel = client.channels.cache.find(
        channel =>
            channel.isTextBased() && channel instanceof GuildChannel && channel.name === 'general'
    ) as TextChannel;

    if (!generalChannel) {
        console.error('Channel not found');
        return;
    }

    const currentTime = dayjs().format('HH:mm:ss');
    const timeMarkdown = `\`${currentTime}\``;
    generalChannel.send(
        `Hello, this is a scheduled message! ${getEmojiMarkdown('T1')} ${timeMarkdown}`
    );
}

function sendMessageEverywhere() {
    client.guilds.cache.forEach(guild => {
        const generalChannel = guild.channels.cache.find(
            channel =>
                channel.isTextBased() &&
                channel instanceof GuildChannel &&
                channel.name === 'general'
        ) as TextChannel;

        if (!generalChannel) {
            console.error(`General channel not found in guild: ${guild.name}`);
            return;
        }

        const currentTime = dayjs().format('HH:mm:ss');
        const timeMarkdown = `\`${currentTime}\``;
        generalChannel.send(
            `Hello, this is a scheduled message! ${getEmojiMarkdown('T1')} ${timeMarkdown}`
        );
    });
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
