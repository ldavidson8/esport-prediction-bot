import { isMatchPosted } from '../database/database.js';
import dayjs from 'dayjs';
import type { Event, Match } from '../interfaces/leagueEvent.js';

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
