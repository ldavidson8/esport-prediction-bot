import { logger } from "./logger.js";

interface Team {
  shortcode: string;
  name: string;
  emojiMarkdown: string;
}

const LCKTeams: Team[] = [
  {
    shortcode: "T1",
    name: "T1",
    emojiMarkdown: "<:T1:1372324602155634838>",
  },
  {
    shortcode: "DK",
    name: "Dplus",
    emojiMarkdown: "<:DK:1372324614209929408>",
  },
  {
    shortcode: "GEN",
    name: "Gen.G Esports",
    emojiMarkdown: "<:GEN:1372324627942215831>",
  },
  {
    shortcode: "HLE",
    name: "Hanwha Life Esports",
    emojiMarkdown: "<:HLE:1372324665342689320>",
  },
  {
    shortcode: "KT",
    name: "KT Rolster",
    emojiMarkdown: "<:KT:1372324683705483396>",
  },
  {
    shortcode: "NS",
    name: "Nongshim RedForce",
    emojiMarkdown: "<:NS:1372324695168385235>",
  },
  {
    shortcode: "DRX",
    name: "DRX",
    emojiMarkdown: "<:DRX:1372324712197263561>",
  },
  {
    shortcode: "BFX",
    name: "FEARX",
    emojiMarkdown: "<:BFX:1372324762734432326>",
  },
  {
    shortcode: "BRO",
    name: "BRION",
    emojiMarkdown: "<:BRO:1372324799128539206>",
  },
  {
    shortcode: "DNF",
    name: "Freecs",
    emojiMarkdown: "<:DNF:1372324823748837447>",
  },
];

const LECTeams: Team[] = [
  {
    shortcode: "FNC",
    name: "Fnatic",
    emojiMarkdown: "<:FNC:1289420093792587796>",
  },
  {
    shortcode: "G2",
    name: "G2 Esports",
    emojiMarkdown: "<:G2:1289420105675046963>",
  },
  {
    shortcode: "GX",
    name: "GIANTX",
    emojiMarkdown: "<:GX:1372287477968277534>",
  },
  {
    shortcode: "KC",
    name: "Karmine Corp",
    emojiMarkdown: "<:KC:1372287491947630603>",
  },
  {
    name: "KOI",
    shortcode: "KOI",
    emojiMarkdown: "<:KOI:1372287505642295390>",
  },
  {
    shortcode: "RGE",
    name: "Rogue",
    emojiMarkdown: "<:RGE:1372287556422602992>",
  },
  {
    shortcode: "SK",
    name: "SK Gaming",
    emojiMarkdown: "<:SK:1372287580334460970>",
  },
  {
    shortcode: "BDS",
    name: "Team BDS",
    emojiMarkdown: "<:BDS:1372287444115787836>",
  },
  {
    shortcode: "TH",
    name: "Team Heretics",
    emojiMarkdown: "<:TH:1372287599762341889>",
  },
  {
    shortcode: "VIT",
    name: "Team Vitality",
    emojiMarkdown: "<:VIT:1372287759615524885>",
  },
];

const LPLTeams: Team[] = [
  {
    shortcode: "AL",
    name: "Anyone's Legend",
    emojiMarkdown: "<:AL:1372315123481448448>",
  },
  {
    shortcode: "BLG",
    name: "Bilibili Gaming",
    emojiMarkdown: "<:BLG:1372315140351066164>",
  },
  {
    shortcode: "EDG",
    name: "EDward Gaming",
    emojiMarkdown: "<:EDG:1372315154959831202>",
  },
  {
    shortcode: "FPX",
    name: "FunPlus Phoenix",
    emojiMarkdown: "<:FPX:1372315166984634438>",
  },
  {
    shortcode: "IG",
    name: "Invictus Gaming",
    emojiMarkdown: "<:IG:1372315175604195378>",
  },
  {
    shortcode: "JDG",
    name: "JDG Gaming",
    emojiMarkdown: "<:JDG:1372315187549438003>",
  },
  {
    shortcode: "LGD",
    name: "LGD Gaming",
    emojiMarkdown: "<:LGD:1372315203743780864>",
  },
  {
    shortcode: "LNG",
    name: "LNG Esports",
    emojiMarkdown: "<:LNG:1372315215319924906>",
  },
  {
    shortcode: "NIP",
    name: "Ninjas in Pyjamas",
    emojiMarkdown: "<:NIP:1372315235519828129>",
  },
  {
    shortcode: "OMG",
    name: "Oh My God",
    emojiMarkdown: "<:OMG:1372315244315017328>",
  },
  {
    shortcode: "RNG",
    name: "Royal Never Give Up",
    emojiMarkdown: "<:RNG:1372315289512968232>",
  },
  {
    shortcode: "WE",
    name: "Team WE",
    emojiMarkdown: "<:WE:1372315319841853440>",
  },
  {
    shortcode: "TT",
    name: "ThunderTalk Gaming",
    emojiMarkdown: "<:TT:1372315338028617748>",
  },
  {
    shortcode: "TES",
    name: "Top Esports",
    emojiMarkdown: "<:TES:1372315376729194576>",
  },
  {
    shortcode: "UP",
    name: "Ultra Prime",
    emojiMarkdown: "<:UP:1372315402117451878>",
  },
  {
    shortcode: "WBG",
    name: "Weibo Gaming",
    emojiMarkdown: "<:WBG:1372315424380813444>",
  },
];

const LTANorthTeams: Team[] = [
  {
    shortcode: "C9",
    name: "Cloud9",
    emojiMarkdown: "<:C9:1372322596841979934>",
  },
  {
    shortcode: "DIG",
    name: "Dignitas",
    emojiMarkdown: "<:DIG:1372322622162997291>",
  },
  {
    shortcode: "FLY",
    name: "FlyQuest",
    emojiMarkdown: "<:FLY:1372322664269742080>",
  },
  {
    shortcode: "SR",
    name: "Shopify Rebellion",
    emojiMarkdown: "<:SR:1372322676466647040>",
  },
  {
    shortcode: "TL",
    name: "Team Liquid",
    emojiMarkdown: "<:TL:1372322742363492432>",
  },
  {
    shortcode: "LYON",
    name: "LYON",
    emojiMarkdown: "<:LYON:1372322759807602770>",
  },
  {
    shortcode: "100",
    name: "100 Thieves",
    emojiMarkdown: "<:100:1372322893140332645>",
  },
  {
    shortcode: "DSG",
    name: "Disguised",
    emojiMarkdown: "<:DSG:1372322915500032171>",
  },
];

const LTASouthTeams: Team[] = [
  {
    shortcode: "FX7M",
    name: "Fluxo W7M",
    emojiMarkdown: "<:FX7M:1372328602066092153>",
  },
  {
    shortcode: "FUR",
    name: "FURIA Esports",
    emojiMarkdown: "<:FUR:1372328618621141032>",
  },
  {
    shortcode: "VKS",
    name: "Keyd Stars",
    emojiMarkdown: "<:VKS:1372328629819805766>",
  },
  {
    shortcode: "LLL",
    name: "LOUD",
    emojiMarkdown: "<:LLL:1372328644352938085>",
  },
  {
    shortcode: "PNG",
    name: "paiN Gaming",
    emojiMarkdown: "<:PNG:1372328762661671012>",
  },
  {
    shortcode: "RED",
    name: "RED Canids",
    emojiMarkdown: "<:RED:1372328776741945486>",
  },
  {
    shortcode: "LEV",
    name: "Leviatán",
    emojiMarkdown: "<:LEV:1372328788553109565>",
  },
  {
    shortcode: "IE",
    name: "Isurus Estral",
    emojiMarkdown: "<:IE:1372328799995302050>",
  },
];

export const teams: Team[] = [
  ...LCKTeams,
  ...LECTeams,
  ...LPLTeams,
  ...LTANorthTeams,
  ...LTASouthTeams,
];

export function getTeamByShortcode(shortcode: string): Team | undefined {
  return teams.find((team) => team.shortcode === shortcode);
}

export function getTeamByName(name: string): Team | undefined {
  return teams.find((team) => team.name === name);
}

export function getEmojiMarkdown(identifier: string): string | undefined {
  try {
    const team = teams.find(
      (team) => team.shortcode === identifier || team.name === identifier
    );
    return team?.emojiMarkdown;
  } catch (error) {
    logger.warn(`Failed to get emoji for ${identifier}`, error);
    return "";
  }
}
