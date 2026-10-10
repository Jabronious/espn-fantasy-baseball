/**
 * Lookup tables for the numeric ids ESPN returns in fantasy baseball (flb) payloads.
 * Cross-referenced against cwendt94/espn-api (espn_api/baseball/constant.py).
 */

/** `lineupSlotId` / `eligibleSlots` -> slot label. 18, 21 and 22 show up in payloads but are unidentified. */
export const LINEUP_SLOTS: { [slotId: number]: string } = {
	0: 'C',
	1: '1B',
	2: '2B',
	3: '3B',
	4: 'SS',
	5: 'OF',
	6: '2B/SS',
	7: '1B/3B',
	8: 'LF',
	9: 'CF',
	10: 'RF',
	11: 'DH',
	12: 'UTIL',
	13: 'P',
	14: 'SP',
	15: 'RP',
	16: 'BE',
	17: 'IL',
	19: 'IF',
};

/** Reverse of LINEUP_SLOTS, used to build `filterSlotIds` from a position name. */
export const LINEUP_SLOT_IDS: { [slot: string]: number } = Object.entries(LINEUP_SLOTS).reduce(
	(acc, [id, slot]) => ({ ...acc, [slot]: Number(id) }),
	{}
);

export const BENCH_SLOT_ID = 16;
export const IL_SLOT_ID = 17;

/** `defaultPositionId` -> position. This is a DIFFERENT numbering from lineup slots. */
export const DEFAULT_POSITIONS: { [positionId: number]: string } = {
	1: 'SP',
	2: 'C',
	3: '1B',
	4: '2B',
	5: '3B',
	6: 'SS',
	7: 'LF',
	8: 'CF',
	9: 'RF',
	10: 'DH',
	11: 'RP',
};

/** `proTeamId` -> MLB team abbreviation. 0 is a free agent (no MLB team). */
export const PRO_TEAMS: { [proTeamId: number]: string } = {
	0: 'FA',
	1: 'Bal',
	2: 'Bos',
	3: 'LAA',
	4: 'ChW',
	5: 'Cle',
	6: 'Det',
	7: 'KC',
	8: 'Mil',
	9: 'Min',
	10: 'NYY',
	11: 'Oak',
	12: 'Sea',
	13: 'Tex',
	14: 'Tor',
	15: 'Atl',
	16: 'ChC',
	17: 'Cin',
	18: 'Hou',
	19: 'LAD',
	20: 'Wsh',
	21: 'NYM',
	22: 'Phi',
	23: 'Pit',
	24: 'StL',
	25: 'SD',
	26: 'SF',
	27: 'Col',
	28: 'Mia',
	29: 'Ari',
	30: 'TB',
};

/**
 * Stat id -> abbreviation. Where hitters and pitchers share an abbreviation the
 * key is prefixed with `B_` (batter) or `P_` (pitcher).
 */
export const STATS: { [statId: number]: string } = {
	0: 'AB',
	1: 'H',
	2: 'AVG',
	3: '2B',
	4: '3B',
	5: 'HR',
	6: 'XBH',
	7: '1B',
	8: 'TB',
	9: 'SLG',
	10: 'B_BB',
	11: 'B_IBB',
	12: 'HBP',
	13: 'SF',
	14: 'SH',
	15: 'SAC',
	16: 'PA',
	17: 'OBP',
	18: 'OPS',
	19: 'RC',
	20: 'R',
	21: 'RBI',
	23: 'SB',
	24: 'CS',
	25: 'SB-CS',
	26: 'GDP',
	27: 'B_SO',
	28: 'PS',
	29: 'PPA',
	31: 'CYC',
	32: 'GP',
	33: 'GS',
	34: 'OUTS',
	35: 'TBF',
	36: 'P',
	37: 'P_H',
	38: 'OBA',
	39: 'P_BB',
	40: 'P_IBB',
	41: 'WHIP',
	42: 'P_HBP',
	43: 'OOBP',
	44: 'P_R',
	45: 'ER',
	46: 'P_HR',
	47: 'ERA',
	48: 'K',
	49: 'K/9',
	50: 'WP',
	51: 'BLK',
	52: 'PK',
	53: 'W',
	54: 'L',
	55: 'WPCT',
	56: 'SVO',
	57: 'SV',
	58: 'BLSV',
	59: 'SV%',
	60: 'HLD',
	62: 'CG',
	63: 'QS',
	65: 'NH',
	66: 'PG',
	67: 'TC',
	68: 'PO',
	69: 'A',
	70: 'OFA',
	71: 'FPCT',
	72: 'E',
	73: 'DP',
	74: 'B_G_W',
	75: 'B_G_L',
	76: 'P_G_W',
	77: 'P_G_L',
	81: 'G',
	82: 'K/BB',
	83: 'SVHD',
	99: 'STARTER',
};

/** `statSplitTypeId` on a player's `stats[]` entries. */
export const STAT_SPLITS: { [splitTypeId: number]: string } = {
	0: 'season',
	1: 'last_7',
	2: 'last_15',
	3: 'last_30',
	5: 'box_score',
};

/** `statSourceId` on a player's `stats[]` entries. */
export const STAT_SOURCES: { [sourceId: number]: string } = {
	0: 'actual',
	1: 'projected',
};

/**
 * `messageTypeId` values from the league communication (activity) feed.
 * Trade ids come from fantasy-hockey-notifier; ESPN shares them across sports.
 */
export const ACTIVITY_MESSAGE_TYPES: { [messageTypeId: number]: string } = {
	178: 'FA_ADD',
	179: 'DROP',
	180: 'WAIVER_ADD',
	181: 'DROP',
	224: 'TRADE_ACCEPTED',
	225: 'TRADE_ACCEPTED_DROP',
	226: 'DRAFT_PICK_TRADE_ACCEPTED',
	239: 'DROP',
	241: 'TRADE_VETOED',
	242: 'TRADE_VETOED_DROP',
	243: 'DRAFT_PICK_TRADE_VETOED',
	244: 'TRADE_PROCESSED',
	245: 'TRADE_PROCESSED_DROP',
	246: 'DRAFT_PICK_TRADE_PROCESSED',
};

/** Transaction `type` values accepted by the `mTransactions2` filter and the write endpoint. */
export const TRANSACTION_TYPES = [
	'DRAFT',
	'FREEAGENT',
	'WAIVER',
	'WAIVER_ERROR',
	'ROSTER',
	'FUTURE_ROSTER',
	'RETRO_ROSTER',
	'TRADE_PROPOSAL',
	'TRADE_ACCEPT',
	'TRADE_DECLINE',
	'TRADE_VETO',
	'TRADE_UPHOLD',
	'TRADE_ERROR',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** `filterStatus` values for player pool queries. */
export type PlayerPoolStatus = 'FREEAGENT' | 'WAIVERS' | 'ONTEAM';

/** Seasons before this live under `/leagueHistory/{id}?seasonId=` instead of `/seasons/{year}/...`. */
export const FIRST_MODERN_SEASON = 2018;
