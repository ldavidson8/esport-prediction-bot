export interface Team {
    name: string;
    code: string;
    image: string;
    result: {
        outcome: string;
        gameWins: number;
    };
    record: {
        wins: number;
        losses: number;
    };
}

export interface Match {
    id: string;
    flags: string[];
    teams: Team[];
    strategy?: {
        type: string;
        count: number;
    };
}

export interface Event {
    startTime: string;
    state: string;
    type: string;
    blockName: string;
    league: {
        name: string;
        slug: string;
    };
    match: Match;
}

export interface PostedMatch {
    id: string;
    posted_at: number;
    message_id: string;
    channel_id: string;
    guild_id: string;
}
