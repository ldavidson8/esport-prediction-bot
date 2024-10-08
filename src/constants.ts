export const leagueIds = {
    Worlds: '98767975604431411',
    LCS: '98767975604431412',
    LEC: '98767975604431413',
    LCK: '98767975604431414',
    LPL: '98767975604431415',
} as const;

interface EsportInfo {
    fullName: string;
    shortcode: string;
    markdown: string;
}

export const esportsData: Record<string, EsportInfo> = {
    lol: {
        fullName: 'League of Legends',
        shortcode: 'LoL',
        markdown: '<:LOL:1293232196030562335>',
    },
    valorant: {
        fullName: 'Valorant',
        shortcode: 'VCT',
        markdown: '<:VCT:1293232162446905446>',
    },
    r6: {
        fullName: 'Rainbow Six Siege',
        shortcode: 'R6',
        markdown: '🔫',
    },
};
