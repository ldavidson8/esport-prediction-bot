import { isMatchPosted } from '../database/database.js';
import dayjs from 'dayjs';
import type { Event, Match } from '../interfaces/leagueEvent.js';
import type { ValorantMatch } from '../interfaces/vctEvent.js';

export function filterUpcomingEvents(events: Event[], now: dayjs.Dayjs): Event[] {
    return events.filter(event => {
        if (event.state !== 'unstarted' || isMatchPosted(event.match.id)) return false;
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');
        return timeDiff <= 24 && timeDiff >= 0;
    });
}

export function determineWinner(matchData: Match): string | null {
    const { strategy, teams } = matchData;
    if (!strategy || !strategy.type || !strategy.count) {
        return null;
    }
    const winThreshold = Math.ceil(strategy.count / 2);

    const team1 = teams[0];
    const team2 = teams[1];

    if (team1 && team1.result.gameWins >= winThreshold) {
        return team1.code;
    } else if (team2 && team2.result.gameWins >= winThreshold) {
        return team2.code;
    }

    return null;
}

export function getBestOf(event: Event): number | null {
    const strategy = event.match.strategy;
    if (strategy && strategy.type === 'bestOf') {
        return strategy.count;
    }
    return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatSchedule(esport: string, data: any, now: dayjs.Dayjs): string {
    switch (esport) {
        case 'lol': {
            const events: Event[] = data.data.schedule.events
                .filter((event: Event) => dayjs(event.startTime).isAfter(now))
                .slice(0, 5);
            let formatted = 'Upcoming League of Legends Matches:\n\n';
            for (const event of events) {
                const match = event.match;
                if (match.teams && match.teams[0] && match.teams[1]) {
                    formatted += `**${match.teams[0].name} vs ${match.teams[1].name}**\n`;
                }
                formatted += `   **League:** ${event.league.name}\n`;
                formatted += `   **Block:** ${event.blockName}\n`;
                formatted += `   **Start Time:** ${new Date(event.startTime).toLocaleString()}\n`;
                formatted += `   **Format:** ${match.strategy?.type.toUpperCase()} ${match.strategy?.count}\n\n`;
            }
            return formatted;
        }
        case 'valorant': {
            const matches: ValorantMatch[] = data.data.segments
                .filter((match: ValorantMatch) =>
                    dayjs(match.unix_timestamp, 'YYYY-MM-DD HH:mm:ss').isAfter(now)
                )
                .slice(0, 5);
            let formatted = 'Upcoming Valorant Matches:\n\n';
            for (const match of matches) {
                formatted += `**${match.team1} vs ${match.team2}**\n`;
                formatted += `   **Event:** ${match.match_event}\n`;
                formatted += `   **Series:** ${match.match_series}\n`;
                formatted += `   **Time:** ${match.time_until_match}\n`;
                formatted += `   [Match Page](<${match.match_page}>)\n\n`;
            }
            return formatted;
        }
        default:
            return 'No schedule data available.';
    }
}
