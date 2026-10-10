import { PlayerDto } from './classes/player.dto';
import { TransactionType, PlayerPoolStatus } from './constants';

export interface LeagueStatus {
	currentMatchupPeriod: number;
	firstScoringPeriod: number;
	finalScoringPeriod: number;
	latestScoringPeriod: number;
	isActive: boolean;
	isExpired?: boolean;
	isFull?: boolean;
	isPlayoffMatchupEdited?: boolean;
	isToBeDeleted?: boolean;
	isViewable?: boolean;
	isWaiverOrderEdited?: boolean;
	previousSeasons: number[];
	waiverLastExecutionDate?: number;
	waiverNextExecutionDate?: number;
	waiverProcessStatus?: { [date: string]: number };
	[key: string]: unknown;
}

/** One of a player's `stats[]` entries. `stats` is keyed by stat id (see STATS). */
export interface PlayerStatsEntry {
	id: string;
	seasonId: number;
	scoringPeriodId: number;
	statSourceId: number;
	statSplitTypeId: number;
	stats: { [statId: string]: number };
	appliedStats?: { [statId: string]: number };
	appliedTotal?: number;
	proTeamId?: number;
	externalId?: string;
}

/** A player as returned by the player pool views (kona_player_info, kona_playercard, players_wl). */
export interface PlayerPoolEntry {
	id: number;
	onTeamId: number;
	status: PlayerPoolStatus | string;
	keeperValue?: number;
	keeperValueFuture?: number;
	lineupLocked?: boolean;
	rosterLocked?: boolean;
	tradeLocked?: boolean;
	draftAuctionValue?: number;
	ratings?: { [splitTypeId: string]: { positionalRanking: number; totalRanking: number; totalRating: number } };
	player: PlayerDto;
	[key: string]: unknown;
}

/** An entry of `team.roster.entries` (mRoster). */
export interface RosterEntry {
	playerId: number;
	lineupSlotId: number;
	acquisitionType?: string;
	acquisitionDate?: number;
	injuryStatus?: string;
	status?: string;
	playerPoolEntry: PlayerPoolEntry;
	[key: string]: unknown;
}

/** A RosterEntry with slot ids resolved to labels, ready for display. */
export interface LineupPlayer {
	playerId: number;
	fullName: string;
	lineupSlotId: number;
	lineupSlot: string;
	eligibleSlots: string[];
	proTeam: string;
	injuryStatus?: string;
	lineupLocked: boolean;
	player: PlayerDto;
}

export interface ActivityMessage {
	id: string;
	messageTypeId: number;
	targetId?: number | string;
	from?: number | string;
	to?: number | string;
	for?: number;
	date: number;
	[key: string]: unknown;
}

export interface ActivityTopic {
	id: string;
	date: number;
	type: string;
	messages: ActivityMessage[];
	[key: string]: unknown;
}

export interface ActivityAction {
	/** Readable action, e.g. FA_ADD, WAIVER_ADD, DROP, TRADE_PROCESSED (see ACTIVITY_MESSAGE_TYPES). */
	action: string;
	messageTypeId: number;
	playerId?: number;
	/** The fantasy team that performed the action. */
	teamId?: number;
	fromTeamId?: number;
	toTeamId?: number;
}

export interface Activity {
	id: string;
	date: number;
	actions: ActivityAction[];
}

export interface TransactionItem {
	playerId: number;
	type: 'ADD' | 'DROP' | 'LINEUP' | 'DRAFT' | 'TRADE' | string;
	fromTeamId?: number;
	toTeamId?: number;
	fromLineupSlotId?: number;
	toLineupSlotId?: number;
	isKeeper?: boolean;
	overallPickNumber?: number;
}

export interface Transaction {
	id: string;
	type: TransactionType | string;
	status?: string;
	teamId: number;
	memberId?: string;
	scoringPeriodId: number;
	executionType?: string;
	bidAmount?: number;
	isPending?: boolean;
	proposedDate?: number;
	processDate?: number;
	relatedTransactionId?: string;
	items: TransactionItem[];
	[key: string]: unknown;
}

export interface DraftPick {
	id: number;
	overallPickNumber: number;
	roundId: number;
	roundPickNumber: number;
	teamId: number;
	playerId: number;
	bidAmount?: number;
	keeper?: boolean;
	nominatingTeamId?: number;
	autoDraftTypeId?: number;
	[key: string]: unknown;
}

export interface DraftDetail {
	drafted: boolean;
	inProgress: boolean;
	completeDate?: number;
	picks?: DraftPick[];
	[key: string]: unknown;
}

export interface ProGame {
	id: number;
	date: number;
	homeProTeamId: number;
	awayProTeamId: number;
	scoringPeriodId: number;
	startTimeTBD?: boolean;
	statsOfficial?: boolean;
	validForLocking?: boolean;
}

export interface ProTeam {
	id: number;
	abbrev: string;
	location: string;
	name: string;
	proGamesByScoringPeriod?: { [scoringPeriodId: string]: ProGame[] };
	[key: string]: unknown;
}

export interface PlayerNews {
	id?: number;
	headline?: string;
	description?: string;
	story?: string;
	published?: string;
	lastModified?: string;
	[key: string]: unknown;
}

export interface LineupMove {
	playerId: number;
	fromLineupSlotId: number;
	toLineupSlotId: number;
}

export interface TransactionResult {
	id?: string;
	status?: string;
	type?: string;
	[key: string]: unknown;
}
