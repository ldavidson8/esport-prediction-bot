export async function fetchScheduleData(): Promise<any> {
    const url =
        'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=98767975604431411';
    const options = {
        method: 'GET',
        headers: { 'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z' },
    };
    const response = await fetch(url, options);
    return response.json();
}
