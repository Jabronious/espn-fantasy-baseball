import { BaseClass } from './base-class';
import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { PlayerDto } from './models/classes/player.dto';
import { LINEUP_SLOT_IDS, PlayerPoolStatus } from './models/constants';
import { NotFound } from './models/errors/not-found';
import { PlayerNews, PlayerPoolEntry } from './models/types';
import { FantasyRequest } from './utils/fantasy-requests';
import { normalizeName } from './utils/player-utils';

export interface PlayerPoolOptions {
	/** A lineup slot name (e.g. 'SS', 'OF', 'SP') or slot id. Omit for every position. */
	position?: string | number;
	/** Defaults to ['FREEAGENT', 'WAIVERS']. */
	status?: PlayerPoolStatus[];
	/** Default 50. */
	limit?: number;
	offset?: number;
	/** Scoring period to evaluate (affects stats and lock state). Defaults to ESPN's current one. */
	scoringPeriodId?: number;
	/** Sort by percent owned (default) or by ESPN's standard draft rank. */
	sortBy?: 'percentOwned' | 'draftRank';
}

export class Players extends BaseClass {
	private playerUniverse?: PlayerDto[];

	constructor(leagueId: number, cookies?: ESPNCookiesDto, year?: number) {
		super(leagueId, cookies, year);
	}

	/**
	 * @param {number} playerId - player id for the player you wish to look up
	 * @param {boolean} [detailed=false] - true returns the player card: season, last 7/15/30 and
	 * projected stats
	 * @returns Player data for the given player id
	 */
	async getPlayerById(playerId: number, detailed: boolean = false): Promise<PlayerDto> {
		const [entry] = detailed ? await this.getPlayerCards([playerId]) : await this.getPlayersByIds([playerId]);
		if (!entry) {
			throw new NotFound(`Player ${playerId} was not found`);
		}
		return entry.player;
	}

	/**
	 * @returns league-aware entries (onTeamId, status, lock state) for the given player ids
	 */
	async getPlayersByIds(playerIds: number[]): Promise<PlayerPoolEntry[]> {
		const headers = FantasyRequest.filter({ players: { filterIds: { value: playerIds } } });
		const data = await this.fantasyRequests.get<{ players?: PlayerPoolEntry[] }>('', headers, {
			view: 'kona_player_info',
		});
		return data.players || [];
	}

	/**
	 * The player card view: season totals plus last 7/15/30 splits and projections for this season.
	 * @param {number} [scoringPeriodId] - include per-day stats up to this scoring period
	 */
	async getPlayerCards(playerIds: number[], scoringPeriodId?: number): Promise<PlayerPoolEntry[]> {
		// <split><source><year>: 00 season actual, 10 season projected, 01/02/03 last 7/15/30
		const splits = ['00', '10', '01', '02', '03'].map((prefix) => `${prefix}${this.year}`);
		const headers = FantasyRequest.filter({
			players: {
				filterIds: { value: playerIds },
				filterStatsForTopScoringPeriodIds: { value: scoringPeriodId ?? 0, additionalValue: splits },
			},
		});
		const data = await this.fantasyRequests.get<{ players?: PlayerPoolEntry[] }>('', headers, {
			view: 'kona_playercard',
		});
		return data.players || [];
	}

	/**
	 * Free agents (and players on waivers) for this league, most-owned first.
	 */
	async getFreeAgents(options: PlayerPoolOptions = {}): Promise<PlayerPoolEntry[]> {
		return this.getPlayerPool(options);
	}

	/**
	 * Query the league's player pool. Pass status ['ONTEAM'] for rostered players.
	 */
	async getPlayerPool({
		position,
		status = ['FREEAGENT', 'WAIVERS'],
		limit = 50,
		offset = 0,
		scoringPeriodId,
		sortBy = 'percentOwned',
	}: PlayerPoolOptions = {}): Promise<PlayerPoolEntry[]> {
		const players: { [key: string]: unknown } = {
			filterStatus: { value: status },
			limit,
			offset,
		};
		if (position !== undefined) {
			const slotId = typeof position === 'number' ? position : LINEUP_SLOT_IDS[position.toUpperCase()];
			if (slotId === undefined) {
				throw new Error(`Unknown position: ${position}`);
			}
			players.filterSlotIds = { value: [slotId] };
		}
		if (sortBy === 'draftRank') {
			players.sortDraftRanks = { sortPriority: 1, sortAsc: true, value: 'STANDARD' };
		} else {
			players.sortPercOwned = { sortPriority: 1, sortAsc: false };
		}

		const params: { [key: string]: unknown } = { view: 'kona_player_info' };
		if (scoringPeriodId !== undefined) params.scoringPeriodId = scoringPeriodId;

		const data = await this.fantasyRequests.get<{ players?: PlayerPoolEntry[] }>(
			'',
			FantasyRequest.filter({ players }),
			params
		);
		return data.players || [];
	}

	/**
	 * Every active MLB player for the season (league independent). Cached per instance.
	 */
	async getAllPlayers(): Promise<PlayerDto[]> {
		if (!this.playerUniverse) {
			this.playerUniverse = await this.fantasyRequests.getSeason<PlayerDto[]>(
				'/players',
				FantasyRequest.filter({ filterActive: { value: true } }),
				{ view: 'players_wl', scoringPeriodId: 0 }
			);
		}
		return this.playerUniverse;
	}

	/**
	 * Finds players by name, ignoring case and accents. Returns every match because
	 * names collide (there are two MLB players named Will Smith).
	 */
	async searchPlayers(name: string): Promise<PlayerDto[]> {
		const query = normalizeName(name);
		if (!query) return [];
		const players = await this.getAllPlayers();
		const exact = players.filter((p) => normalizeName(p.fullName || '') === query);
		if (exact.length) return exact;
		return players.filter((p) => normalizeName(p.fullName || '').includes(query));
	}

	/**
	 * @returns recent news blurbs for a player from ESPN's news feed
	 */
	async getPlayerNews(playerId: number, limit: number = 10): Promise<PlayerNews[]> {
		const data = await this.fantasyRequests.getNews<{ news?: { feed?: PlayerNews[] }; feed?: PlayerNews[] }>({
			playerId,
			limit,
		});
		return data.news?.feed || data.feed || [];
	}
}
