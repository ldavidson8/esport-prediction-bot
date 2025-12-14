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

const LCPTeams: Team[] = [
  {
    shortcode: "CFO",
    name: "CTBC Flying Oyster",
    emojiMarkdown: "<:CFO:1372336707902373888>",
  },
  {
    shortcode: "SHG",
    name: "SoftBank HAWKS gaming",
    emojiMarkdown: "<:SHG:1372336721521283182>",
  },
  {
    shortcode: "GAM",
    name: "GAM Esports",
    emojiMarkdown: "<:GAM:1372336730975502347>",
  },
  {
    shortcode: "TLN",
    name: "TALON",
    emojiMarkdown: "<:TLN:1372336741045764147>",
  },
  {
    shortcode: "CHF",
    name: "Chiefs Esports Club",
    emojiMarkdown: "<:CHF:1372336752018067577>",
  },
  {
    shortcode: "DFM",
    name: "DetonatioN FocusMe",
    emojiMarkdown: "<:DFM:1372336761333874708>",
  },
  {
    shortcode: "TSW",
    name: "Secret Whales",
    emojiMarkdown: "<:TSW:1372336772561895424>",
  },
  {
    shortcode: "VKE",
    name: "Vikings Esports",
    emojiMarkdown: "<:VKE:1372336785023041536>",
  },
];

const VCT_AMERICAS: Team[] = [
  {
    shortcode: "G2",
    name: "G2 Esports",
    emojiMarkdown: "<:G2:1289420105675046963>",
  },
  {
    shortcode: "SEN",
    name: "Sentinels",
    emojiMarkdown: "<:SEN:1372357027032207532>",
  },
  {
    shortcode: "MIBR",
    name: "MIBR",
    emojiMarkdown: "<:MIBR:1372357049853153330>",
  },
  {
    shortcode: "KRU",
    name: "KRÜ Esports",
    emojiMarkdown: "<:KRU:1372357065795702845>",
  },
  {
    shortcode: "LEV",
    name: "Leviatán",
    emojiMarkdown: "<:LEV:1372328788553109565>",
  },
  {
    shortcode: "LOUD",
    name: "LOUD",
    emojiMarkdown: "<:LLL:1372328644352938085>",
  },
  {
    shortcode: "EG",
    name: "Evil Geniuses",
    emojiMarkdown: "<:EG:1372357114370064395>",
  },
  {
    shortcode: "NRG",
    name: "NRG",
    emojiMarkdown: "<:NRG:1372357127267422329>",
  },
  {
    shortcode: "FUR",
    name: "FURIA",
    emojiMarkdown: "<:FUR:1372328618621141032>",
  },
  {
    shortcode: "C9",
    name: "Cloud9",
    emojiMarkdown: "<:C9:1372322596841979934>",
  },
  {
    shortcode: "100T",
    name: "100 Thieves",
    emojiMarkdown: "<:100:1372322893140332645>",
  },
  {
    shortcode: "2G",
    name: "2GAME Esports",
    emojiMarkdown: "<:2G:1372357171253219470>",
  },
];

const VCT_CN: Team[] = [
  {
    shortcode: "EDG",
    name: "Edward Gaming",
    emojiMarkdown: "<:EDG:1372315154959831202>",
  },
  {
    shortcode: "TE",
    name: "Trace Esports",
    emojiMarkdown: "<:TE:1372357191700316231>",
  },
  {
    shortcode: "BLG",
    name: "Bilibili Gaming",
    emojiMarkdown: "<:BLG:1372315140351066164>",
  },
  {
    shortcode: "DRG",
    name: "Dragon Ranger Gaming",
    emojiMarkdown: "<:DRG:1372357213980459008>",
  },
  {
    shortcode: "FPX",
    name: "FunPlus Phoenix",
    emojiMarkdown: "<:FPX:1372315166984634438>",
  },
  {
    shortcode: "XLG",
    name: "XLG Esports",
    emojiMarkdown: "<:XLG:1372357241759469668>",
  },
  {
    shortcode: "NV",
    name: "Nova Esports",
    emojiMarkdown: "<:NV:1372357260310872154>",
  },
  {
    shortcode: "JDG",
    name: "JD Gaming",
    emojiMarkdown: "<:JDG:1372315187549438003>",
  },
  {
    shortcode: "WOL",
    name: "Wolves Esports",
    emojiMarkdown: "<:WOL:1372357282905718825>",
  },
  {
    shortcode: "TYL",
    name: "TYLOO",
    emojiMarkdown: "<:TYL:1372357292569399397>",
  },
  {
    shortcode: "TEC",
    name: "Titan Esports Club",
    emojiMarkdown: "<:TEC:1372357314413330533>",
  },
  {
    shortcode: "AG",
    name: "All Gamers",
    emojiMarkdown: "<:AG:1372357324915605596>",
  },
];

const VCT_EMEA: Team[] = [
  {
    shortcode: "VIT",
    name: "Team Vitality",
    emojiMarkdown: "<:VIT:1372287759615524885>",
  },
  {
    shortcode: "TL",
    name: "Team Liquid",
    emojiMarkdown: "<:TL:1372322742363492432>",
  },
  {
    shortcode: "TH",
    name: "Team Heretics",
    emojiMarkdown: "<:TH:1372287599762341889>",
  },
  {
    shortcode: "FUT",
    name: "FUT Esports",
    emojiMarkdown: "<:FUT:1372357365671792691>",
  },
  {
    shortcode: "FNC",
    name: "Fnatic",
    emojiMarkdown: "<:FNC:1289420093792587796>",
  },
  {
    shortcode: "BBL",
    name: "BBL Esports",
    emojiMarkdown: "<:BBL:1372357487017332747>",
  },
  {
    shortcode: "M8",
    name: "Gentle Mates",
    emojiMarkdown: "<:M8:1372357506344419458>",
  },
  {
    shortcode: "GX",
    name: "GIANTX",
    emojiMarkdown: "<:GX:1372287477968277534>",
  },
  {
    shortcode: "KOI",
    name: "KOI",
    emojiMarkdown: "<:KOI:1372287505642295390>",
  },
  {
    shortcode: "NAVI",
    name: "Natus Vincere",
    emojiMarkdown: "<:NAVI:1372357674074898532>",
  },
  {
    shortcode: "KC",
    name: "Karmine Corp",
    emojiMarkdown: "<:KC:1372287491947630603>",
  },
  {
    shortcode: "APK",
    name: "Apeks",
    emojiMarkdown: "<:APK:1372357706433826846>",
  },
];

const VCT_PACIFIC: Team[] = [
  {
    shortcode: "DRX",
    name: "DRX",
    emojiMarkdown: "<:DRX:1372324712197263561>",
  },
  { shortcode: "T1", name: "T1", emojiMarkdown: "<:T1:1372324602155634838>" },
  {
    shortcode: "GEN",
    name: "Gen.G Esports",
    emojiMarkdown: "<:GEN:1372324627942215831>",
  },
  {
    shortcode: "TLN",
    name: "Talon Esports",
    emojiMarkdown: "<:TLN:1372336741045764147>",
  },
  {
    shortcode: "NS",
    name: "Nongshim RedForce",
    emojiMarkdown: "<:NS:1372324695168385235>",
  },
  {
    shortcode: "DFM",
    name: "DetonatioN FocusMe",
    emojiMarkdown: "<:DFM:1372336761333874708>",
  },
  {
    shortcode: "RRQ",
    name: "Rex Regum Qeon",
    emojiMarkdown: "<:RRQ:1372357775430123662>",
  },
  {
    shortcode: "PRX",
    name: "Paper Rex",
    emojiMarkdown: "<:PRX:1372357791939035247>",
  },
  {
    shortcode: "BME",
    name: "BOOM Esports",
    emojiMarkdown: "<:BME:1372357804014436352>",
  },
  {
    shortcode: "TS",
    name: "Team Secret",
    emojiMarkdown: "<:TSW:1372336772561895424>",
  },
  {
    shortcode: "GE",
    name: "Global Esports",
    emojiMarkdown: "<:GE:1372357844753449000>",
  },
  {
    shortcode: "ZETA",
    name: "ZETA DIVISION",
    emojiMarkdown: "<:ZETA:1372357854618583110>",
  },
];

export const teams: Team[] = [
  ...LCKTeams,
  ...LECTeams,
  ...LPLTeams,
  ...LTANorthTeams,
  ...LTASouthTeams,
  ...LCPTeams,
  ...VCT_AMERICAS,
  ...VCT_CN,
  ...VCT_EMEA,
  ...VCT_PACIFIC,
];

export function getTeamByShortcode(shortcode: string): Team | undefined {
  return teams.find((team) => team.shortcode === shortcode);
}

export function getTeamByName(name: string): Team | undefined {
  return teams.find((team) => team.name === name);
}

export function getEmojiMarkdown(identifier: string): string | undefined {
  try {
    const team = teams.find((team) => team.shortcode === identifier || team.name === identifier);
    return team?.emojiMarkdown;
  } catch (error) {
    logger.warn(error, `Failed to get emoji for ${identifier}`);
    return "";
  }
}
