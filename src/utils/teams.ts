import { logger } from './logger.js';

interface Team {
    shortcode: string;
    name: string;
    emojiMarkdown: string;
}

export const teams: Team[] = [
    {
        shortcode: '100',
        name: '100 Thieves',
        emojiMarkdown: '<:100T:1289420045323341905>',
    },
    {
        shortcode: 'BLG',
        name: 'BILIBILI GAMING DREAMSMART',
        emojiMarkdown: '<:BLG:1289420061366292512>',
    },
    {
        shortcode: 'DK',
        name: 'Dplus KIA',
        emojiMarkdown: '<:DK:1289420072217088061>',
    },
    {
        shortcode: 'FLY',
        name: 'FlyQuest',
        emojiMarkdown: '<:FLY:1289420083533447319>',
    },
    {
        shortcode: 'FNC',
        name: 'Fnatic',
        emojiMarkdown: '<:FNC:1289420093792587796>',
    },
    {
        shortcode: 'G2',
        name: 'G2 Esports',
        emojiMarkdown: '<:G2:1289420105675046963>',
    },
    {
        shortcode: 'GAM',
        name: 'GAM Esports',
        emojiMarkdown: '<:GAM:1289420139355176971>',
    },
    {
        shortcode: 'GEN',
        name: 'Gen.G',
        emojiMarkdown: '<:GEN:1289420151845949460>',
    },
    {
        shortcode: 'HLE',
        name: 'Hanwha Life Esports',
        emojiMarkdown: '<:HLE:1289420164374331414>',
    },
    {
        shortcode: 'LNG',
        name: 'Suzhou LNG Ninebot Esports',
        emojiMarkdown: '<:LNG:1289420177053585478>',
    },
    {
        shortcode: 'MDK',
        name: 'MAD Lions KOI',
        emojiMarkdown: '<:MDK:1289420190299459584>',
    },
    {
        shortcode: 'PNG',
        name: 'paIN Gaming',
        emojiMarkdown: '<:PNG:1289420206690664581>',
    },
    {
        shortcode: 'PSG',
        name: 'PSG Talon',
        emojiMarkdown: '<:PSG:1289420219802189865>',
    },
    {
        shortcode: 'R7',
        name: 'Movistar R7',
        emojiMarkdown: '<:R7:1289420235392421949>',
    },
    {
        shortcode: 'SHG',
        name: 'Fukuoka SoftBank HAWKS gaming',
        emojiMarkdown: '<:SHG:1289420247606235166>',
    },
    {
        shortcode: 'T1',
        name: 'T1',
        emojiMarkdown: '<:T1:1289420265608056852>',
    },
    {
        shortcode: 'TES',
        name: 'Top Esports',
        emojiMarkdown: '<:TES:1289420280493772800>',
    },
    {
        shortcode: 'TL',
        name: 'Team Liquid',
        emojiMarkdown: '<:TL:1289420293126754357>',
    },
    {
        shortcode: 'VKE',
        name: 'Vikings Esports',
        emojiMarkdown: '<:VKE:1289420306061987874>',
    },
    {
        shortcode: 'WBG',
        name: 'WeiboGaming TapTap',
        emojiMarkdown: '<:WBG:1289420318024142860>',
    },
];

export function getTeamByShortcode(shortcode: string): Team | undefined {
    return teams.find(team => team.shortcode === shortcode);
}

export function getTeamByName(name: string): Team | undefined {
    return teams.find(team => team.name === name);
}

export function getEmojiMarkdown(identifier: string): string | undefined {
    try {
        const team = teams.find(team => team.shortcode === identifier || team.name === identifier);
        return team?.emojiMarkdown;
    } catch (error) {
        logger.warn(`Failed to get emoji for ${identifier}`);
        return '';
    }
}
