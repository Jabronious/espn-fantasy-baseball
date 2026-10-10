import { BaseClass } from './base-class';
import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { LeagueDto } from './models/classes/league.dto';
import { TransactionType } from './models/constants';
import { LineupMove, TransactionItem, TransactionResult } from './models/types';

interface TransactionOptions {
	teamId: number;
	/** ESPN only accepts writes for the current scoring period. Looked up when omitted. */
	scoringPeriodId?: number;
	/** Submit as the league manager (acting on another team). Requires LM cookies. */
	asLeagueManager?: boolean;
}

export interface AddPlayerOptions extends TransactionOptions {
	playerId: number;
	/** Player to drop in the same transaction, when the roster is full. */
	dropPlayerId?: number;
}

export interface DropPlayerOptions extends TransactionOptions {
	playerId: number;
}

export interface WaiverClaimOptions extends AddPlayerOptions {
	/** FAAB bid, for leagues using a free agent acquisition budget. */
	bidAmount?: number;
}

export interface SetLineupOptions extends TransactionOptions {
	/** Only players whose slot changes. A swap is two moves. */
	moves: LineupMove[];
}

/**
 * Roster writes via ESPN's transaction endpoint (lm-api-writes). These change real league
 * state and need the acting owner's espn_s2/SWID. ESPN has no dry-run mode.
 *
 * Rejections surface as ESPNTransactionRejected with ESPN's code, e.g. TRAN_LINEUP_LOCKED,
 * TRAN_ROSTER_SAME_SLOT or TRAN_INVALID_SCORINGPERIOD_NOT_CURRENT.
 */
export class Transactions extends BaseClass {
	constructor(leagueId: number, cookies?: ESPNCookiesDto, year?: number) {
		super(leagueId, cookies, year);
	}

	/** Add a free agent, optionally dropping a player in the same move. */
	async addFreeAgent({ playerId, dropPlayerId, ...options }: AddPlayerOptions): Promise<TransactionResult> {
		return this.submit('FREEAGENT', options, this.addDropItems(options.teamId, playerId, dropPlayerId));
	}

	/** Drop a player to free agency. */
	async dropPlayer({ playerId, ...options }: DropPlayerOptions): Promise<TransactionResult> {
		return this.submit('FREEAGENT', options, [{ playerId, type: 'DROP', fromTeamId: options.teamId }]);
	}

	/** Place a waiver claim (with a FAAB bid if the league uses one). */
	async claimWaiver({
		playerId,
		dropPlayerId,
		bidAmount,
		...options
	}: WaiverClaimOptions): Promise<TransactionResult> {
		const extra = bidAmount === undefined ? {} : { bidAmount };
		return this.submit('WAIVER', options, this.addDropItems(options.teamId, playerId, dropPlayerId), extra);
	}

	/**
	 * Move players between lineup slots. All moves apply atomically. Fails with
	 * TRAN_LINEUP_LOCKED if any player's game has started (`playerPoolEntry.lineupLocked`).
	 */
	async setLineup({ moves, ...options }: SetLineupOptions): Promise<TransactionResult> {
		if (!moves.length) {
			throw new Error('setLineup requires at least one move');
		}
		const unchanged = moves.find((move) => move.fromLineupSlotId === move.toLineupSlotId);
		if (unchanged) {
			// ESPN rejects these with TRAN_ROSTER_SAME_SLOT and fails the whole transaction
			throw new Error(`Player ${unchanged.playerId} is already in slot ${unchanged.toLineupSlotId}`);
		}
		const items: TransactionItem[] = moves.map((move) => ({ ...move, type: 'LINEUP' }));
		return this.submit('ROSTER', options, items);
	}

	private addDropItems(teamId: number, playerId: number, dropPlayerId?: number): TransactionItem[] {
		const items: TransactionItem[] = [{ playerId, type: 'ADD', toTeamId: teamId }];
		if (dropPlayerId !== undefined) {
			items.push({ playerId: dropPlayerId, type: 'DROP', fromTeamId: teamId });
		}
		return items;
	}

	private async submit(
		type: TransactionType,
		{ teamId, scoringPeriodId, asLeagueManager = false }: TransactionOptions,
		items: TransactionItem[],
		extra: { [key: string]: unknown } = {}
	): Promise<TransactionResult> {
		if (!this.cookies?.espn_s2) {
			throw new Error('espn_s2 cookie is required to make transactions');
		}
		const body = {
			isLeagueManager: asLeagueManager,
			teamId,
			type,
			memberId: this.cookies.swid,
			scoringPeriodId: scoringPeriodId ?? (await this.currentScoringPeriod()),
			executionType: 'EXECUTE',
			items,
			...extra,
		};
		return this.fantasyRequests.post<TransactionResult>('/transactions/', body);
	}

	private async currentScoringPeriod(): Promise<number> {
		const data = await this.fantasyRequests.get<LeagueDto>('', {}, { view: 'mStatus' });
		return data.scoringPeriodId;
	}
}
