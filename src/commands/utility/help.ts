import {
	CommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
	InteractionContextType,
} from 'discord.js';
import type { Command } from '../../interfaces/command.js';
import type { CustomClient } from '../../classes/client.js';

export const metadata = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Get a list of available commands')
	.setContexts(InteractionContextType.Guild);

async function execute(interaction: CommandInteraction): Promise<void> {
	// Ensure the command is used in a guild context to check member permissions
	if (!interaction.inGuild() || !interaction.member) {
		await interaction.reply({
			content: 'This command can only be used in a server.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const memberPermissions = interaction.member.permissions as PermissionsBitField;

	const client = interaction.client as CustomClient; // Cast to CustomClient

	const availableCommands = client.commands.filter((cmd: Command) => {
		// Explicitly type cmd
		if (!cmd.opt?.userPermissions || cmd.opt.userPermissions.length === 0) {
			return true; // No specific permissions required
		}
		// Ensure cmd.opt.userPermissions is an array of PermissionKey strings
		const requiredPermissions = cmd.opt
			.userPermissions as (keyof typeof PermissionsBitField.Flags)[];
		return memberPermissions.has(requiredPermissions.map((p) => PermissionsBitField.Flags[p]));
	});

	if (availableCommands.size === 0) {
		await interaction.reply({
			content: 'You do not have permission to view any commands, or no commands are available.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const commandsByCategory = new Map<string, Command[]>();
	availableCommands.forEach((cmd: Command) => {
		const category = cmd.opt?.category || 'Other';
		if (!commandsByCategory.has(category)) {
			commandsByCategory.set(category, []);
		}
		commandsByCategory.get(category)!.push(cmd);
	});

	const embed = new EmbedBuilder()
		.setTitle('Available Commands')
		.setDescription('Here is a list of commands you can use:')
		.setColor('#0099ff');

	for (const [category, commands] of commandsByCategory) {
		const value = commands
			.map((cmd) => {
				const commandData = cmd.data as { name: string; description: string };
				return `**/${commandData.name}**: ${commandData.description || 'No description'}`;
			})
			.join('\n');
		embed.addFields({
			name: `__${category}__`,
			value,
		});
	}

	await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

const commandsCommand: Command = {
	data: metadata.toJSON(),
	opt: {
		cooldown: 5,
		userPermissions: ['SendMessages'],
		botPermissions: ['SendMessages'],
		category: 'Utility',
	},
	execute,
};

export default commandsCommand;
