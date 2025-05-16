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

export async function getUpcomingLCKMatches(limit: number) {
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [
				`[[series::LoL Champions Korea]] AND [[date::>${yearMonthDayHourMinuteSecond(
					new Date(),
				)}]]`,
			],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit: limit,
		},
	});

	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}

	return data;
}

export async function getUpcomingLPLMatches(limit: number) {
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [
				`[[series::LoL Pro League]] AND [[date::>${yearMonthDayHourMinuteSecond(new Date())}]]`,
			],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit: limit,
		},
	});
	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}
	return data;
}

export async function getUpcomingLTAMatches(limit: number) {
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [
				`[[series::LoL Championship of The Americas]] AND [[date::>${yearMonthDayHourMinuteSecond(
					new Date(),
				)}]]`,
			],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit: limit,
		},
	});
	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}
	return data;
}

export async function getUpcomingLECMatches(limit: number) {
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [`[[series::LEC]] AND [[date::>${yearMonthDayHourMinuteSecond(new Date())}]]`],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit: limit,
		},
	});
	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}
	return data;
}

export async function getUpcomingLCPMatches(limit: number) {
	const { data, error } = await $fetch('/match', {
		headers: {
			Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
		},
		query: {
			wiki: 'leagueoflegends',
			conditions: [
				`[[series::LoL Championship Pacific]] AND [[date::>${yearMonthDayHourMinuteSecond(
					new Date(),
				)}]]`,
			],
			rawstreams: false,
			streamurls: false,
			order: 'date ASC',
			limit: limit,
		},
	});
	if (error) {
		console.error('Fetch error:', error);
		throw new Error(`Failed to fetch data: ${error}`);
	}
	return data;
}
