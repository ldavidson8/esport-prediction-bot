import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../interfaces/command.js';

export const metadata = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction): Promise<void> {
	await interaction.reply({
		content: 'Pinging...',
	});
	await interaction.editReply(
		`🏓 Pong! Latency is ${
			Date.now() - interaction.createdTimestamp
		}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`,
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
