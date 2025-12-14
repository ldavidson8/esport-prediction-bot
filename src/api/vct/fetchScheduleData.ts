import { liquipediaAPIUrl } from "../../constants.js";
import { env } from "../../env.js";
import { yearMonthDayHourMinuteSecond } from "../../utils/datetime.js";

interface LiquipediaResponse {
  result: any[];
}

export async function getUpcomingVCTMatches(limit: number, endDate?: Date) {
  const startDate = new Date();
  let dateConditionString = `[[date::>${yearMonthDayHourMinuteSecond(startDate)}]]`;

  if (endDate) {
    dateConditionString += ` AND [[date::<${yearMonthDayHourMinuteSecond(endDate)}]]`;
  }

  const url = new URL(`${liquipediaAPIUrl}/match`);
  const params = new URLSearchParams({
    wiki: "valorant",
    conditions: `[[series::VALORANT Champions Tour]] AND ${dateConditionString}`,
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
