import {
	SlashCommandBuilder,
	MessageFlags,
	ContainerBuilder,
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
	TextDisplayBuilder,
	time,
	TimestampStyles,
} from 'discord.js';
import type { Command } from '../../interfaces/command.js';
import { getUpcomingVCTMatches } from '../../api/vct/fetchScheduleData.js';
import { getMatchesByLeague } from '../../api/league/fetchScheduleData.js';
import { addDays, addHours, endOfDay } from 'date-fns';
import { logger } from '../../utils/logger.js';
import { getEmojiMarkdown } from '../../utils/teams.js';
import { purpleAccentColor } from '../../constants.js';
import { getUpcomingOWCSMatches } from '../../api/overwatch/fetchScheduleData.js';

const esportChoices = [
	{ name: 'Valorant (VCT)', value: 'VCT' },
	{ name: 'Overwatch (OWCS)', value: 'OWCS' },
	{ name: 'League of Legends (LCK)', value: 'LCK' },
	{ name: 'League of Legends (LPL)', value: 'LPL' },
	{ name: 'League of Legends (LEC)', value: 'LEC' },
	{ name: 'League of Legends (MSI)', value: 'MSI' },
	{ name: 'League of Legends (Worlds)', value: 'Worlds' },
	{ name: 'League of Legends (LTA)', value: 'LTA' },
	{ name: 'League of Legends (LCP)', value: 'LCP' },
];

const timeframeChoices = [
	{ name: 'Today', value: 'today' },
	{ name: 'Next 24 Hours', value: 'next_24_hours' },
	{ name: 'Next 7 Days', value: 'next_7_days' },
	{ name: 'Next 30 Days', value: 'next_30_days' },
	{ name: 'All Upcoming', value: 'all_upcoming' },
];

export const metadata = new SlashCommandBuilder()
	.setName('schedule')
	.setDescription('Fetches upcoming match schedules for a specified esport and timeframe.')
	.addStringOption((option) =>
		option
			.setName('esport')
			.setDescription('The esport to fetch the schedule for.')
			.setRequired(true)
			.setAutocomplete(true),
	)
	.addStringOption((option) =>
		option
			.setName('timeframe')
			.setDescription('The timeframe for the schedule.')
			.setRequired(true)
			.setAutocomplete(true),
	)
	.addIntegerOption((option) =>
		option
			.setName('limit')
			.setDescription('Number of matches to fetch (default 10, max 100).')
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(false),
	);

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const esport = interaction.options.getString('esport', true);
	const timeframe = interaction.options.getString('timeframe', true);
	const limit = interaction.options.getInteger('limit') ?? 10;

	let endDate: Date | undefined = undefined;
	const now = new Date();

	switch (timeframe) {
		case 'today':
			endDate = endOfDay(now);
			break;
		case 'next_24_hours':
			endDate = addHours(now, 24);
			break;
		case 'next_7_days':
			endDate = addDays(now, 7);
			break;
		case 'next_30_days':
			endDate = addDays(now, 30);
			break;
		case 'all_upcoming':
			break;
		default:
			await interaction.reply({
				content: 'Invalid timeframe selected.',
				flags: MessageFlags.Ephemeral,
			});
			return;
	}

	try {
		await interaction.deferReply();
		let scheduleData: { result: any[] } | undefined | null;

		if (esport === 'VCT') {
			scheduleData = await getUpcomingVCTMatches(limit, endDate);
		} else if (esport === 'OWCS') {
			scheduleData = await getUpcomingOWCSMatches(limit, endDate);
		} else {
			scheduleData = await getMatchesByLeague(esport as any, limit, endDate);
		}

		if (scheduleData && scheduleData.result && scheduleData.result.length > 0) {
			const matches = scheduleData.result;
			const heading = new TextDisplayBuilder().setContent(`Upcoming Matches for ${esport}`);

			const matchDisplays: string[] = [];
			for (const match of matches) {
				const opponent1 = match.match2opponents?.[0];
				const opponent2 = match.match2opponents?.[1];

				if (opponent1 && opponent2) {
					const team1Name = opponent1.name || 'TBD';
					const team1Identifier = opponent1.teamtemplate?.shortname || opponent1.name;
					const team1Emoji = getEmojiMarkdown(team1Identifier) || '';

					const team2Name = opponent2.name || 'TBD';
					const team2Identifier = opponent2.teamtemplate?.shortname || opponent2.name;
					const team2Emoji = getEmojiMarkdown(team2Identifier) || '';

					let relativeTime = 'Unknown time';
					let matchDate: Date | undefined;

					// Prefer extradata.timestamp if available, otherwise fallback to match.date
					if (match.extradata?.timestamp) {
						const unixTimestamp = Number(match.extradata.timestamp);
						if (!isNaN(unixTimestamp)) {
							matchDate = new Date(unixTimestamp * 1000);
						}
					}
					if (!matchDate && match.date) {
						const parsedDate = new Date(match.date);
						if (!isNaN(parsedDate.getTime())) {
							matchDate = parsedDate;
						}
					}

					if (matchDate) {
						relativeTime = time(matchDate, TimestampStyles.RelativeTime);
					} else if (match.date) {
						logger.warn(`Invalid date format for match: ${match.date}`);
						relativeTime = `(Date: ${match.date})`;
					}

					matchDisplays.push(
						`${team1Emoji} ${team1Name} vs ${team2Name} ${team2Emoji} - ${relativeTime}`,
					);
				}
			}

			const scheduleText = matchDisplays.join('\n');
			const scheduleDisplay = new TextDisplayBuilder().setContent(
				scheduleText || 'No match details could be formatted.',
			);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [
					new ContainerBuilder()
						.addTextDisplayComponents(heading, scheduleDisplay)
						.setAccentColor(purpleAccentColor),
				],
			});
		} else if (scheduleData && scheduleData.result) {
			await interaction.editReply({
				content: 'No upcoming matches found for the selected criteria.',
				components: [],
			});
		} else {
			logger.warn(
				`No schedule data or unexpected data structure for ${esport} with limit ${limit} and endDate ${endDate}`,
			);
			await interaction.editReply(
				'Could not retrieve schedule data or the structure was unexpected.',
			);
		}
	} catch (error) {
		logger.error(
			`Error executing schedule command for ${esport} with timeframe ${timeframe}:`,
			error,
		);
		const errorMessage = 'There was an error while fetching the schedule.';
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
		}
	}
}

async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedOption = interaction.options.getFocused(true);

	if (focusedOption.name === 'esport') {
		const filtered = esportChoices.filter((choice) =>
			choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()),
		);
		await interaction.respond(filtered.slice(0, 25));
	} else if (focusedOption.name === 'timeframe') {
		const filtered = timeframeChoices.filter((choice) =>
			choice.name.toLowerCase().includes(focusedOption.value.toLowerCase()),
		);
		await interaction.respond(filtered.slice(0, 25));
	} else {
		await interaction.respond([]);
	}
}

const scheduleCommand: Command = {
	data: metadata.toJSON(),
	opt: {
		category: 'Utility',
		cooldown: 10,
		userPermissions: ['SendMessages'],
		botPermissions: ['SendMessages'],
	},
	execute,
	autocomplete,
};

export default scheduleCommand;
