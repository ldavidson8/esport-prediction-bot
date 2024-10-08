import { logger } from '../../utils/logger.js';
import { request } from 'undici';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchScheduleData(): Promise<any> {
    const url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US';

    try {
        const { statusCode, body } = await request(url, {
            method: 'GET',
            headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
        });

        if (statusCode !== 200) {
            throw new Error(`HTTP error! status: ${statusCode}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await body.json();
        return data;
    } catch (error) {
        logger.error('Failed to fetch schedule data', error);
        throw error;
    }
}
