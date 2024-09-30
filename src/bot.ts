import { Events } from 'discord.js';
import { CustomClient } from './classes/client.js';
import { logger } from './utils/logger.js';
import { sendMessage } from './utils/sendMessage.js';
import {
    checkForPredictionsChannel,
    createPredictionsChannel,
    processSchedule,
    startHourlyScheduleProcessor,
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

client.once(Events.ClientReady, async readyClient => {
    logger.info(`Logged in as ${readyClient.user?.tag}`);
    if (!checkForPredictionsChannel(client)) createPredictionsChannel(client);
    // startHourlyScheduleProcessor(client);
    processSchedule(client);
});

client.start();
