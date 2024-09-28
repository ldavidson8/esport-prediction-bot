const leagueIds = {
    Worlds: '98767975604431411',
    LCS: '98767991299243165',
    LEC: '98767991302996019',
    LCK: '98767991310872058',
    LPL: '98767991314006698',
    MSI: '98767991325878492',
};

export function getAllLeagueIds(): string[] {
    return Object.values(leagueIds);
}
