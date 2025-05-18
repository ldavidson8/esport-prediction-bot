import { getDb } from '../../database/database.js';
import {
	CommandInteraction,
	GuildMember,
	MessageFlags,
	ChannelType,
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ComponentType,
	channelMention,
	ChannelSelectMenuInteraction,
	PermissionFlagsBits,
	InteractionContextType,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../interfaces/command.js';
import { logger } from '../../utils/logger.js';

export const metadata = new SlashCommandBuilder()
	.setName('set-prediction-channel')
	.setDescription('Sets the prediction channel for the current guild.')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setContexts(InteractionContextType.Guild);

async function execute(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guild) {
		await interaction.reply({
			content: 'This command can only be used in a server.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const owner = await interaction.guild.fetchOwner();
	if (interaction.user.id !== owner.id) {
		// Additional check, though default member permissions should handle most cases
		// Also, ensure the member executing is a GuildMember
		if (
			interaction.member instanceof GuildMember &&
			!interaction.member.permissions.has('Administrator')
		) {
			await interaction.reply({
				content: 'You must be the server owner or an administrator to use this command.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}

	const selectMenu = new ChannelSelectMenuBuilder()
		.setCustomId('prediction_channel_select')
		.setPlaceholder('Select the channel for predictions')
		.addChannelTypes(ChannelType.GuildText)
		.setMaxValues(1)
		.setMinValues(1);

	const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(selectMenu);

	const message = await interaction.reply({
		content: 'Please select the channel you want to set for predictions:',
		components: [row],
		flags: MessageFlags.Ephemeral,
	});

	try {
		const collectorFilter = (i: ChannelSelectMenuInteraction) => {
			i.deferUpdate();
			return i.user.id === interaction.user.id && i.customId === 'prediction_channel_select';
		};

		const confirmation = await message.awaitMessageComponent({
			filter: collectorFilter,
			componentType: ComponentType.ChannelSelect,
			time: 60_000, // 60 seconds
		});

		if (confirmation && confirmation.values.length > 0) {
			const selectedChannelId = confirmation.values[0];
			const db = await getDb();

			try {
				await db
					.insertInto('guilds')
					.values({
						guildId: interaction.guildId!,
						predictionChannelId: selectedChannelId,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					})
					.onConflict((oc) =>
						oc.column('guildId').doUpdateSet({
							predictionChannelId: selectedChannelId,
							updatedAt: new Date().toISOString(),
						}),
					)
					.execute();

				await interaction.editReply({
					content: `Prediction channel has been set to ${channelMention(selectedChannelId!)}.`,
					components: [],
				});
				logger.info(
					`Prediction channel set to ${selectedChannelId} for guild ${interaction.guildId} by ${interaction.user.tag}`,
				);
			} catch (dbError: any) {
				// Explicitly type dbError as any for easier access to potential properties
				let errorMessage = 'No additional error information available.';
				if (dbError instanceof Error) {
					errorMessage = `Message: ${dbError.message}${dbError.stack ? `\nStack: ${dbError.stack}` : ''}`;
				} else if (dbError && typeof dbError === 'object') {
					// Attempt to stringify if it's an object but not an Error instance
					try {
						errorMessage = JSON.stringify(dbError);
					} catch (e) {
						errorMessage = 'Could not stringify error object.';
					}
				} else if (dbError !== undefined && dbError !== null) {
					errorMessage = String(dbError);
				}

				logger.error(
					`Database error setting prediction channel for guild ${interaction.guildId}: ${errorMessage}`,
				);
				await interaction.editReply({
					content:
						'An error occurred while setting the prediction channel in the database. Please try again later.',
					components: [],
				});
			}
		}
	} catch (e) {
		logger.warn(
			`Prediction channel selection timed out for ${interaction.user.tag} in guild ${interaction.guildId}`,
			e,
		);
		await interaction.editReply({
			content: 'Channel selection timed out. Please try the command again.',
			components: [],
		});
	}
}

const setPredictionChannelCommand: Command = {
	data: metadata.toJSON(),
	opt: {
		cooldown: 30,
		userPermissions: ['ManageGuild'],
		botPermissions: ['SendMessages'],
		category: 'Admin',
	},
	execute,
};

export default setPredictionChannelCommand;
