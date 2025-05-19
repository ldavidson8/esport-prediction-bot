import { liquipediaAPIUrl, CACHE_DURATION_MS } from '../../constants.js';
import { env } from '../../env.js';
import { z } from 'zod';
import { createSchema, createFetch } from '@better-fetch/fetch';
import { yearMonthDayHourMinuteSecond } from '../../utils/datetime.js';
import { getDb } from '../../database/database.js';
import { logger } from '../../utils/logger.js';

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
	const db = await getDb();
	const requestKeyParts = ['getMatchesByLeague', league, limit.toString()];
	if (endDate) {
		// Normalize endDate for the cache key
		const keyEndDate = new Date(endDate.getTime()); // Clone to avoid modifying the original endDate object
		keyEndDate.setMinutes(0, 0, 0); // Round down to the start of the current hour
		requestKeyParts.push(keyEndDate.toISOString());
	}
	const requestKey = requestKeyParts.join(':');

	// 1. Check cache
	try {
		const cachedEntry = await db
			.selectFrom('apiCache')
			.selectAll()
			.where('requestKey', '=', requestKey)
			.where('expiresAt', '>', new Date().toISOString())
			.executeTakeFirst();

		if (cachedEntry) {
			logger.info(`Cache hit for key: ${requestKey}`);
			return JSON.parse(cachedEntry.responseData);
		}
		logger.info(`Cache miss for key: ${requestKey}`);
	} catch (cacheError) {
		logger.error('Cache read error:', cacheError);
	}

	// 2. Fetch from API if not in cache or expired
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

	// 3. Store in cache
	if (data) {
		try {
			const expiresAtDate = new Date(Date.now() + CACHE_DURATION_MS);
			await db
				.insertInto('apiCache')
				.values({
					requestKey: requestKey,
					responseData: JSON.stringify(data),
					expiresAt: expiresAtDate.toISOString(),
				})
				.onConflict((oc) =>
					oc.column('requestKey').doUpdateSet({
						responseData: JSON.stringify(data),
						expiresAt: expiresAtDate.toISOString(),
						createdAt: new Date().toISOString(), // Reset createdAt on update
					}),
				)
				.execute();
			logger.info(`Cached data for key: ${requestKey}`);
		} catch (cacheWriteError) {
			logger.error('Cache write error:', cacheWriteError);
		}
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
