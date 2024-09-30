import { logger } from '../utils/logger.js';

export async function fetchMatchData(matchId: string): Promise<any> {
    const url = `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${matchId}`;
    const options = {
        method: 'GET',
        headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
    };
    try {
        const response = await fetch(url, options);
        const data: any = await response.json();
        return data.data.event.match;
    } catch (error) {
        logger.error(`Failed to fetch match data for ${matchId}`, error);
    }
}
