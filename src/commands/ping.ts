import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/command';

export const metadata = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    await interaction.editReply(
        `🏓 Pong! Latency is ${sent.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(
            interaction.client.ws.ping
        )}ms`
    );
}

const pingCommand: Command = {
    data: metadata.toJSON(),
    opt: {
        cooldown: 5,
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Utility',
    },
    execute,
};

export default pingCommand;
