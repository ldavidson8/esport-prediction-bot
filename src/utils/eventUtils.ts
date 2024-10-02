import { isMatchPosted } from '../database/database.js';
import dayjs from 'dayjs';

export interface Event {
    id: string;
    state: string;
    startTime: string;
    match: {
        teams: { name: string; code: string }[];
    };
    league: {
        name: string;
    };
    blockName: string;
}

export function filterUpcomingEvents(events: Event[], now: dayjs.Dayjs): Event[] {
    return events.filter(event => {
        if (event.state !== 'unstarted' || isMatchPosted(event.id)) return false;
        const startTime = dayjs(event.startTime);
        const timeDiff = startTime.diff(now, 'hours');
        return timeDiff <= 40 && timeDiff >= 0;
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function determineWinner(matchData: any): string | null {
    const { strategy, teams } = matchData;
    const winThreshold = Math.ceil(strategy.count / 2);

    const team1 = teams[0];
    const team2 = teams[1];

    if (team1.result.gameWins >= winThreshold) {
        return team1.code;
    } else if (team2.result.gameWins >= winThreshold) {
        return team2.code;
    }

    return null;
}
