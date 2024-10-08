import { Events, StringSelectMenuInteraction, type Interaction } from 'discord.js';
import type { Event } from '../interfaces/event.js';
import type { CustomClient } from '../classes/client.js';
import { logger } from '../utils/logger.js';
import { esportsData } from '../constants.js';
import { fetchScheduleData } from '../api/league/fetchScheduleData.js';
import { fetchUpcomingMatches } from '../api/vct/fetchScheduleData.js';
import { formatSchedule } from '../utils/eventUtils.js';
import dayjs from 'dayjs';

const event: Event = {
    name: Events.InteractionCreate,
    execute: async (client: CustomClient, interaction: Interaction) => {
        if (!interaction.guild) {
            if (interaction.isCommand()) {
                await interaction.reply({
                    content: 'This command can only be used in a server',
                    ephemeral: true,
                });
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
                        ephemeral: true,
                    });
                } else {
                    interaction.reply({
                        content: 'There was an error while executing this command!',
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            const menuInteraction = interaction as StringSelectMenuInteraction;
            try {
                if (menuInteraction.customId === 'schedule') {
                    const selectedValue = menuInteraction.values[0];
                    if (!selectedValue) {
                        await menuInteraction.reply({
                            content: 'You need to select an esport!',
                            ephemeral: true,
                        });
                        return;
                    }
                    await menuInteraction.deferReply({ ephemeral: true });
                    let scheduleData;
                    switch (selectedValue) {
                        case 'lol':
                            scheduleData = await fetchScheduleData();
                            break;
                        case 'valorant':
                            scheduleData = await fetchUpcomingMatches();
                            break;
                        default:
                            await menuInteraction.editReply({
                                content: 'Unsupported esport selected.',
                            });
                            return;
                    }

                    const formattedSchedule = formatSchedule(selectedValue, scheduleData, dayjs());
                    const esportInfo = esportsData[selectedValue as keyof typeof esportsData];
                    if (esportInfo) {
                        const embed = {
                            title: `${esportInfo.fullName} Schedule`,
                            description: `${esportInfo.markdown}\n${formattedSchedule}`,
                            color: 0x0099ff,
                        };
                        await menuInteraction.editReply({
                            embeds: [embed],
                        });
                    } else {
                        await menuInteraction.editReply({
                            content: `No schedule data available for ${selectedValue}`,
                        });
                    }
                }
            } catch (error) {
                logger.error(`Error handling select menu ${menuInteraction.customId}:`, error);
                await menuInteraction.editReply({
                    content:
                        'An error occurred while fetching the schedule. Please try again later.',
                });
                if (error instanceof Error) {
                    logger.error(error.stack);
                }
            }
        }
    },
};

export default event;
