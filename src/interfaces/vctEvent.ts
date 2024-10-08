export interface ValorantMatch {
    team1: string;
    team2: string;
    flag1: string;
    flag2: string;
    time_until_match: string;
    match_series: string;
    match_event: string;
    unix_timestamp: string;
    match_page: string;
}

export interface ValorantApiResponse {
    data: {
        status: number;
        segments: ValorantMatch[];
    };
}
