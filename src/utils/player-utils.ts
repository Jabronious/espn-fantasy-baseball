import { PlayerDto } from '../models/classes/player.dto';
import { DEFAULT_POSITIONS, LINEUP_SLOTS, PRO_TEAMS, STATS } from '../models/constants';
import { LineupPlayer, PlayerStatsEntry, RosterEntry } from '../models/types';

export const slotName = (slotId: number): string => LINEUP_SLOTS[slotId] ?? String(slotId);

export const proTeamAbbrev = (proTeamId: number): string => PRO_TEAMS[proTeamId] ?? String(proTeamId);

export const positionName = (defaultPositionId: number): string =>
	DEFAULT_POSITIONS[defaultPositionId] ?? String(defaultPositionId);

/** Lowercases and strips accents so "Acuna" finds "Acuña". */
export const normalizeName = (name: string): string =>
	name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-zA-Z0-9 ]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();

export interface StatsQuery {
	seasonId?: number;
	/** 0 season, 1 last 7, 2 last 15, 3 last 30, 5 single scoring period (see STAT_SPLITS) */
	statSplitTypeId?: number;
	/** 0 actual, 1 projected */
	statSourceId?: number;
	scoringPeriodId?: number;
}

/**
 * Picks one `stats[]` entry off a player and returns it keyed by stat abbreviation
 * (e.g. `{ HR: 12, AVG: 0.281 }`). Defaults to actual season totals.
 */
export const getPlayerStats = (
	player: Pick<PlayerDto, 'stats'>,
	{ seasonId, statSplitTypeId = 0, statSourceId = 0, scoringPeriodId }: StatsQuery = {}
): { [stat: string]: number } | undefined => {
	const entries = (player.stats || []) as PlayerStatsEntry[];
	const entry = entries.find(
		(s) =>
			s.statSplitTypeId === statSplitTypeId &&
			s.statSourceId === statSourceId &&
			(seasonId === undefined || s.seasonId === seasonId) &&
			(scoringPeriodId === undefined || s.scoringPeriodId === scoringPeriodId)
	);
	if (!entry) return undefined;

	return Object.entries(entry.stats || {}).reduce((acc: { [stat: string]: number }, [statId, value]) => {
		acc[STATS[Number(statId)] ?? statId] = value;
		return acc;
	}, {});
};

/** Resolves a roster entry's ids into display-ready fields. */
export const toLineupPlayer = (entry: RosterEntry): LineupPlayer => {
	const pool = entry.playerPoolEntry || ({} as RosterEntry['playerPoolEntry']);
	const player = pool.player || ({} as PlayerDto);
	return {
		playerId: entry.playerId ?? player.id,
		fullName: player.fullName,
		lineupSlotId: entry.lineupSlotId,
		lineupSlot: slotName(entry.lineupSlotId),
		eligibleSlots: ((player.eligibleSlots || []) as number[]).map(slotName),
		proTeam: proTeamAbbrev(player.proTeamId),
		injuryStatus: entry.injuryStatus ?? player.injuryStatus,
		lineupLocked: Boolean(pool.lineupLocked),
		player,
	};
};
