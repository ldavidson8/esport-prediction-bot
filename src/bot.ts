import { Events } from 'discord.js';
import { CustomClient } from './classes/client.js';
import { logger } from './utils/logger.js';
import {
    checkForPredictionsChannel,
    createPredictionsChannel,
    processSchedule,
    determineWinner,
    sendMessage,
    fetchMatchData,
} from './services/scheduler.js';

const client = new CustomClient();

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

async function sendMatchResult(client: CustomClient, matchId: string) {
    try {
        const matchData = await fetchMatchData(matchId);
        if (!matchData) {
            logger.error(`No match data found for match ID: ${matchId}`);
            return;
        }

        const winner = determineWinner(matchData);
        if (!winner) {
            logger.info(`Match ${matchId} has not concluded yet.`);
            return;
        }

        const message = `Match ${matchId} has concluded. The winner is ${winner}!`;
        await sendMessage(client, 'bot-predictions', message);
    } catch (error) {
        logger.error(`Error processing match result for ${matchId}:`, error);
    }
}

client.once(Events.ClientReady, async readyClient => {
    logger.info(`Logged in as ${readyClient.user?.tag}`);
    if (!checkForPredictionsChannel(client)) createPredictionsChannel(client);

    const matchIds = ['112966697102367383', '112966697102367363', '112966697102367359'];
    for (const matchId of matchIds) {
        await sendMatchResult(client, matchId);
    }

    // schedule.scheduleJob('*/30 * * * * *', () => processSchedule(client));
    // processSchedule(client);
});

client.start();
