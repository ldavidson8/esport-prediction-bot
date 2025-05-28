import { CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../interfaces/command.js';

export const metadata = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pong!');

async function execute(interaction: CommandInteraction): Promise<void> {
	const sent = await interaction.reply({
		content: 'Pinging...',
		flags: MessageFlags.Ephemeral,
	});
	await interaction.editReply(
		`Websocket heartbeat: ${interaction.client.ws.ping}ms\nRoundtrip latency: ${
      sent.createdTimestamp - interaction.createdTimestamp
    }ms`,
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
