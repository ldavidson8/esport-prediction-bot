const baseUrl = 'https://vlrggapi.vercel.app';

export async function fetchUpcomingMatches(): Promise<unknown> {
    const url = `${baseUrl}/match/?q=upcoming`;
    const headers = {
        Accept: 'application/json',
    };
    const response = await fetch(url, { headers });
    return response.json();
}

export async function fetchLiveResults(): Promise<unknown> {
    const url = `${baseUrl}/match/?q=live_score`;
    const headers = {
        Accept: 'application/json',
    };
    const response = await fetch(url, { headers });
    return response.json();
}

export async function fetchMatchResults(): Promise<unknown> {
    const url = `${baseUrl}/match/?q=results`;
    const headers = {
        Accept: 'application/json',
    };
    const response = await fetch(url, { headers });
    return response.json();
}
