import { Events } from 'discord.js';
import { CustomClient } from './classes/client.js';

const client = new CustomClient();

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user?.tag}`);
});

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
