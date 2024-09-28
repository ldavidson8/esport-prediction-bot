import {
    CommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from 'discord.js';
import { Command } from '../interfaces/command';

export const metadata = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Show schedule for an esport');

async function execute(interaction: CommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
        .setCustomId('esport')
        .setPlaceholder('Select an esport')
        .addOptions([
            new StringSelectMenuOptionBuilder()
                .setLabel('League of Legends')
                .setValue('lol')
                .setDescription('League of Legends schedule')
                .setEmoji('🎮'),
            // new StringSelectMenuOptionBuilder()
            //     .setLabel('Valorant')
            //     .setValue('valorant')
            //     .setDescription('Valorant schedule')
            //     .setEmoji('🔫'),
            // new StringSelectMenuOptionBuilder()
            //     .setLabel('Rainbow Six Siege')
            //     .setValue('r6')
            //     .setDescription('Rainbow Six Siege schedule')
            //     .setEmoji('🔫'),
        ]);

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
