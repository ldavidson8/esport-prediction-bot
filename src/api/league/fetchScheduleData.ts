import { liquipediaAPIUrl } from "../../constants.js";
import { env } from "../../env.js";
import { yearMonthDayHourMinuteSecond } from "../../utils/datetime.js";

interface LiquipediaResponse {
  result: any[];
}

type League = {
  [key: string]: string;
};

const leagues: League = {
  LCK: "LoL Champions Korea",
  LEC: "LEC",
  LPL: "LoL Pro League",
  LTA: "LoL Championship of The Americas",
  LCP: "LoL Championship Pacific",
  MSI: "Mid-Season Invitational",
  Worlds: "World Championships",
};

type LeagueKey = keyof typeof leagues;

export async function getMatchesByLeague(league: LeagueKey, limit: number, endDate?: Date) {
  const series = leagues[league];
  const startDate = new Date();
  let dateConditionString = `[[date::>${yearMonthDayHourMinuteSecond(startDate)}]]`;

  if (endDate) {
    dateConditionString += ` AND [[date::<${yearMonthDayHourMinuteSecond(endDate)}]]`;
  }

  const url = new URL(`${liquipediaAPIUrl}/match`);
  const params = new URLSearchParams({
    wiki: "leagueoflegends",
    conditions: `[[series::${series}]] AND ${dateConditionString}`,
    rawstreams: "false",
    streamurls: "false",
    order: "date ASC",
    limit: limit.toString(),
  });
  url.search = params.toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch error:", errorText);
    throw new Error(
      `Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as LiquipediaResponse;
  return data;
}

export async function getUpcomingLeagueMatches(limit: number, endDate?: Date) {
  const startDate = new Date();
  let dateConditionString = `[[date::>${yearMonthDayHourMinuteSecond(startDate)}]]`;

  if (endDate) {
    dateConditionString += ` AND [[date::<${yearMonthDayHourMinuteSecond(endDate)}]]`;
  }

  const url = new URL(`${liquipediaAPIUrl}/match`);
  const params = new URLSearchParams({
    wiki: "leagueoflegends",
    conditions: `${dateConditionString} AND [[liquipediatier::1]] AND ([[liquipediatiertype::]] OR [[liquipediatiertype::General]] OR [[liquipediatiertype::Qualifier]])`,
    rawstreams: "false",
    streamurls: "false",
    order: "date ASC",
    limit: limit.toString(),
  });
  url.search = params.toString();

  const response = await fetch(url, {
    headers: {
      Authorization: `Apikey ${env.LIQUIPEDIA_TOKEN}`,
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch error:", errorText);
    throw new Error(
      `Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as LiquipediaResponse;
  return data;
}
