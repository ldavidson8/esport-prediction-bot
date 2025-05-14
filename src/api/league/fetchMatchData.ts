import { logger } from "../../utils/logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchMatchData(matchId: string): Promise<any> {
  const url = `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${matchId}`;

  try {
    // use native fetch instead of request
    const response = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    return data.data.event.match;
  } catch (error) {
    logger.error(`Failed to fetch match data for ${matchId}`, error);
    throw error;
  }
}
