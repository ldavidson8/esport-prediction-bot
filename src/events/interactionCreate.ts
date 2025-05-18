import { Events, MessageFlags, StringSelectMenuInteraction, type Interaction } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import type { CustomClient } from '../classes/client.js';
import { logger } from '../utils/logger.js';

const event: Event = {
	name: Events.InteractionCreate,
	execute: async (client: CustomClient, interaction: Interaction) => {
		if (!interaction.guild) {
			if (interaction.isCommand()) {
				await interaction.reply({
					content: 'This command can only be used in a server',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
		if (interaction.isAutocomplete()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				logger.warn(`No command matching ${interaction.commandName} found`);
				return;
			}

			if (!command.autocomplete) {
				logger.warn(`No autocomplete handler for command ${interaction.commandName}`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				logger.error(
					`Error in autocomplete handler for command ${interaction.commandName}:`,
					error,
				);
			}
		}
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) {
				logger.warn(`No command matching ${interaction.commandName} found`);
				return;
			}
			try {
				await command.execute(interaction);
			} catch (error) {
				logger.error(`Error executing command ${interaction.commandName}:`, error);
				if (error instanceof Error) {
					logger.error(error.stack);
				}

				if (interaction.deferred || interaction.replied) {
					interaction.followUp({
						content: 'There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				} else {
					interaction.reply({
						content: 'There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		} else if (interaction.isStringSelectMenu()) {
			const menuInteraction = interaction as StringSelectMenuInteraction;
		}
	},
};

export default event;
