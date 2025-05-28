import { getDb } from '../database/database.js';
import { logger } from '../utils/logger.js';
import { getUpcomingLeagueMatches } from '../api/league/fetchScheduleData.js';
import { getUpcomingVCTMatches } from '../api/vct/fetchScheduleData.js';

interface LiquipediaMatch {
	match2id: string;
	pageid: number;
	pagename: string;
	match2bracketid: string;
	status: string;
	winner: string;
	walkover: string;
	resulttype: string;
	finished: number;
	mode: string;
	type: string;
	section: string;
	game: string;
	patch: string;
	date: string;
	dateexact: number;
	bestof: number;
	vod: string;
	stream: Record<string, string>;
	links: Record<string, string>;
	tournament: string;
	parent: string;
	tickername: string;
	shortname: string;
	series: string;
	icon: string;
	iconurl: string;
	icondark: string;
	icondarkurl: string;
	liquipediatier: string;
	liquipediatiertype?: string;
	publishertier: string;
	extradata: any;
	match2bracketdata: any;
	match2opponents: any[];
	match2games: any[];
}

export class LiquipediaSyncService {
	async fetchAndSyncMatches(): Promise<void> {
		try {
			logger.info('Starting Liquipedia data sync...');

			let allMatches: LiquipediaMatch[] = [];
			let syncedCount = 0;
			let updatedCount = 0;

			// Fetch League of Legends matches
			try {
				const lolData = await getUpcomingLeagueMatches(500);
				if (lolData.result && Array.isArray(lolData.result)) {
					allMatches.push(...(lolData.result as LiquipediaMatch[]));
					logger.info(`Fetched ${lolData.result.length} League of Legends matches`);
				}
			} catch (error) {
				logger.error('Failed to fetch League of Legends matches:', error);
			}

			// Fetch Valorant matches
			try {
				const vctData = await getUpcomingVCTMatches(500);
				if (vctData.result && Array.isArray(vctData.result)) {
					allMatches.push(...(vctData.result as LiquipediaMatch[]));
					logger.info(`Fetched ${vctData.result.length} Valorant matches`);
				}
			} catch (error) {
				logger.error('Failed to fetch Valorant matches:', error);
			}

			if (allMatches.length === 0) {
				logger.warn('No matches fetched from any source');
				return;
			}

			// Process all matches
			for (const match of allMatches) {
				try {
					const isUpdated = await this.upsertMatch(match);
					if (isUpdated) {
						updatedCount++;
					}
					syncedCount++;
				} catch (error) {
					logger.error(`Failed to process match ${match.match2id}:`, error);
				}
			}

			logger.info(`Sync completed: ${syncedCount} matches processed, ${updatedCount} updated`);
		} catch (error) {
			logger.error('Failed to sync Liquipedia data:', error);
			throw error;
		}
	}

	private async upsertMatch(match: LiquipediaMatch): Promise<boolean> {
		const db = await getDb();

		try {
			// First, upsert tournament
			await this.upsertTournament(match);

			// Extract team data from opponents - only process actual teams
			const team1 = match.match2opponents?.[0];
			const team2 = match.match2opponents?.[1];

			// Upsert teams in teams table for reference
			let team1Id = null;
			let team2Id = null;

			if (team1?.name && team1?.type === 'team') {
				team1Id = await this.upsertTeam(team1);
			}

			if (team2?.name && team2?.type === 'team') {
				team2Id = await this.upsertTeam(team2);
			}

			// Check if match exists and needs updating
			const existingMatch = await db
				.selectFrom('matches')
				.select(['id', 'winner', 'finished', 'date', 'lastFetchedAt'])
				.where('id', '=', match.match2id)
				.executeTakeFirst();

			const isNewMatch = !existingMatch;
			const hasChanges =
				existingMatch &&
				(existingMatch.winner !== match.winner ||
					existingMatch.finished !== match.finished ||
					existingMatch.date !== match.date);

			// Upsert match with denormalized team data
			await db
				.insertInto('matches')
				.values({
					id: match.match2id,
					tournamentId: match.parent,
					pageId: match.pageid,
					pageName: match.pagename,
					bracketId: match.match2bracketid,
					status: match.status,
					winner: match.winner,
					walkover: match.walkover,
					resultType: match.resulttype,
					finished: match.finished,
					mode: match.mode,
					type: match.type,
					section: match.section,
					game: match.game,
					patch: match.patch,
					date: match.date,
					dateExact: match.dateexact,
					bestOf: match.bestof,
					// Team 1 data - only set if it's actually a team
					team1Id: team1Id,
					team1Name: team1?.type === 'team' ? team1?.name || null : null,
					team1Shortname: team1?.type === 'team' ? team1?.teamtemplate?.shortname || team1?.name || null : null,
					team1Template: team1?.type === 'team' ? team1?.template || null : null,
					team1Score: team1?.type === 'team' ? team1?.score || null : null,
					// Team 2 data - only set if it's actually a team
					team2Id: team2Id,
					team2Name: team2?.type === 'team' ? team2?.name || null : null,
					team2Shortname: team2?.type === 'team' ? team2?.teamtemplate?.shortname || team2?.name || null : null,
					team2Template: team2?.type === 'team' ? team2?.template || null : null,
					team2Score: team2?.type === 'team' ? team2?.score || null : null,
					// Additional data
					vod: match.vod,
					streamData: JSON.stringify(match.stream || {}),
					linksData: JSON.stringify(match.links || {}),
					extraData: JSON.stringify(match.extradata || {}),
					bracketData: JSON.stringify(match.match2bracketdata || {}),
					lastFetchedAt: new Date().toISOString(),
				})
				.onConflict((oc) =>
					oc.column('id').doUpdateSet({
						status: match.status,
						winner: match.winner,
						walkover: match.walkover,
						resultType: match.resulttype,
						finished: match.finished,
						date: match.date,
						dateExact: match.dateexact,
						patch: match.patch,
						// Update team data - only if it's actually a team
						team1Id: team1Id,
						team1Name: team1?.type === 'team' ? team1?.name || null : null,
						team1Shortname: team1?.type === 'team' ? team1?.teamtemplate?.shortname || team1?.name || null : null,
						team1Template: team1?.type === 'team' ? team1?.template || null : null,
						team1Score: team1?.type === 'team' ? team1?.score || null : null,
						team2Id: team2Id,
						team2Name: team2?.type === 'team' ? team2?.name || null : null,
						team2Shortname: team2?.type === 'team' ? team2?.teamtemplate?.shortname || team2?.name || null : null,
						team2Template: team2?.type === 'team' ? team2?.template || null : null,
						team2Score: team2?.type === 'team' ? team2?.score || null : null,
						// Additional data
						vod: match.vod,
						streamData: JSON.stringify(match.stream || {}),
						linksData: JSON.stringify(match.links || {}),
						extraData: JSON.stringify(match.extradata || {}),
						bracketData: JSON.stringify(match.match2bracketdata || {}),
						lastFetchedAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}),
				)
				.execute();

			// Handle games
			if (match.match2games) {
				await this.upsertMatchGames(match.match2id, match.match2games);
			}

			return (isNewMatch ?? false) || (hasChanges ?? false);
		} catch (error) {
			logger.error(`Failed to upsert match ${match.match2id}:`, error);
			throw error;
		}
	}

	private async upsertTournament(match: LiquipediaMatch): Promise<void> {
		const db = await getDb();

		await db
			.insertInto('tournaments')
			.values({
				id: match.parent,
				name: match.tournament,
				shortname: match.shortname,
				series: match.series,
				game: match.game,
				liquipediaTier: match.liquipediatier,
				publisherTier: match.publishertier,
				iconUrl: match.iconurl,
				iconDarkUrl: match.icondarkurl,
			})
			.onConflict((oc) =>
				oc.column('id').doUpdateSet({
					name: match.tournament,
					shortname: match.shortname,
					iconUrl: match.iconurl,
					iconDarkUrl: match.icondarkurl,
					updatedAt: new Date().toISOString(),
				}),
			)
			.execute();
	}

	private async upsertTeam(opponent: any): Promise<number | null> {
		const db = await getDb();

		if (!opponent.name) {
			return null;
		}

		try {
			const teamResult = await db
				.insertInto('teams')
				.values({
					name: opponent.name,
					shortname: opponent.teamtemplate?.shortname || opponent.name,
					template: opponent.template,
					iconUrl: opponent.teamtemplate?.imageurl,
				})
				.onConflict((oc) =>
					oc.column('name').doUpdateSet({
						shortname: opponent.teamtemplate?.shortname || opponent.name,
						template: opponent.template,
						iconUrl: opponent.teamtemplate?.imageurl,
						updatedAt: new Date().toISOString(),
					}),
				)
				.returning('id')
				.executeTakeFirst();

			return (
				teamResult?.id ||
				(
					await db
						.selectFrom('teams')
						.select('id')
						.where('name', '=', opponent.name)
						.executeTakeFirstOrThrow()
				).id
			);
		} catch (error) {
			logger.error(`Failed to upsert team ${opponent.name}:`, error);
			return null;
		}
	}

	private async upsertMatchGames(matchId: string, games: any[]): Promise<void> {
		const db = await getDb();

		// Delete existing games for this match
		await db.deleteFrom('matchGames').where('matchId', '=', matchId).execute();

		for (let i = 0; i < games.length; i++) {
			const game = games[i];

			await db
				.insertInto('matchGames')
				.values({
					matchId: matchId,
					gameNumber: i + 1,
					map: game.map,
					subgroup: game.subgroup,
					team1Score: game.scores?.[0],
					team2Score: game.scores?.[1],
					winner: game.winner,
					status: game.status,
					walkover: game.walkover,
					resultType: game.resulttype,
					date: game.date,
					mode: game.mode,
					type: game.type,
					game: game.game,
					patch: game.patch,
					vod: game.vod,
					length: game.length,
					extraData: JSON.stringify(game.extradata || {}),
					participantsData: JSON.stringify(game.participants || {}),
				})
				.execute();
		}
	}

	async getOutdatedMatches(hoursThreshold: number = 1): Promise<string[]> {
		const db = await getDb();
		const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();

		const matches = await db
			.selectFrom('matches')
			.select('id')
			.where('lastFetchedAt', '<', cutoffTime)
			.execute();

		return matches.map((m) => m.id).filter((id): id is string => id !== null);
	}
}
