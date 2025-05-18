import { liquipediaAPIUrl } from '../../constants.js';
import { env } from '../../env.js';
import { z } from 'zod';
import { createSchema, createFetch } from '@better-fetch/fetch';
import { yearMonthDayHourMinuteSecond } from '../../utils/datetime.js';

const schema = z.object({
	result: z.array(z.unknown()),
});

const $fetch = createFetch({
	baseURL: liquipediaAPIUrl,
	schema: createSchema({
		'/match': {
			query: z.object({
				wiki: z.string(),
				conditions: z.array(z.string()),
				rawstreams: z.boolean(),
				streamurls: z.boolean(),
				order: z.string().default('date ASC'),
				limit: z.number().default(100),
			}),
			output: schema,
		},
	}),
});

type League = {
	[key: string]: string;
};

const leagues: League = {
	LCK: 'LoL Champions Korea',
	LEC: 'LEC',
	LPL: 'LoL Pro League',
	LTA: 'LoL Championship of The Americas',
	LCP: 'LoL Championship Pacific',
	MSI: 'Mid-Season Invitational',
	Worlds: 'World Championships',
};

type LeagueKey = keyof typeof leagues;

export async function getMatchesByLeague(league: LeagueKey, limit: number, endDate?: Date) {
	const series = leagues[league];
	const startDate = new Date();
	let dateConditionString = `[[date::>${yearMonthDayHourMinuteSecond(startDate)}]]`;

	if (endDate) {
		dateConditionString += ` AND [[date::<${yearMonthDayHourMinuteSecond(endDate)}]]`;
	}
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
			'Accept-Encoding': 'gzip',
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [`[[series::${series}]] AND ${dateConditionString}`],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit,
		},
	});

	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}

	return data;
}

export async function getUpcomingLeagueMatches(limit: number, endDate?: Date) {
	const startDate = new Date();
	let dateConditionString = `[[date::>${yearMonthDayHourMinuteSecond(startDate)}]]`;

	if (endDate) {
		dateConditionString += ` AND [[date::<${yearMonthDayHourMinuteSecond(endDate)}]]`;
	}
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
			'Accept-Encoding': 'gzip',
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [
				`${dateConditionString} AND [[liquipediatier::1]] AND ([[liquipediatiertype::]] OR [[liquipediatiertype::General]] OR [[liquipediatiertype::Qualifier]])`,
			],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit,
		},
	});

	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}

	return data;
}
