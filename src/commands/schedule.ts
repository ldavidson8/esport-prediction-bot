import {
    CommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from 'discord.js';
import type { Command } from '../interfaces/command.js';
import { esportsData } from '../constants.js';

export const metadata = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Show schedule for an esport');

async function execute(interaction: CommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
        .setCustomId('schedule')
        .setPlaceholder('Select an esport')
        .addOptions(
            Object.entries(esportsData).map(([value, data]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(data.fullName)
                    .setValue(value)
                    .setDescription(`${data.fullName} schedule`)
                    .setEmoji(data.markdown)
            )
        );

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select);

    await interaction.reply({
        content: 'Select an esport to view the schedule',
        components: [row],
    });
}

const scheduleCommand: Command = {
    data: metadata.toJSON(),
    opt: {
        cooldown: 5,
        userPermissions: ['SendMessages'],
        botPermissions: ['SendMessages'],
        category: 'Esports',
    },
    execute,
};

export default scheduleCommand;
