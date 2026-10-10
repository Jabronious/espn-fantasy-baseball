import { BaseClass } from './base-class';
import { ESPNCookiesDto, SWID } from './models/classes/espn-cookies.dto';
import { LeagueDto } from './models/classes/league.dto';
import { MatchUpDto, MatchUpResponseDto } from './models/classes/matchup.dto';
import { MemberDto } from './models/classes/member.dto';
import { TeamDto } from './models/classes/team.dto';
import { ACTIVITY_MESSAGE_TYPES, STATS, TransactionType } from './models/constants';
import { Positions } from './models/enums/positions';
import { HittingStats, PitchingStats } from './models/enums/stats';
import { ESPNNotFound } from './models/errors/espn-request-error';
import { NotFound } from './models/errors/not-found';
import {
	Activity,
	ActivityMessage,
	ActivityTopic,
	DraftDetail,
	LeagueStatus,
	ProGame,
	ProTeam,
	Transaction,
} from './models/types';
import { Players } from './players';
import { Teams } from './teams';
import { Transactions } from './transactions';
import { FantasyRequest } from './utils/fantasy-requests';

type PositionCounts = { [key in Positions]?: number };
type HittingScoreStats = { [key in HittingStats]?: number };
type PitchingScoreStats = { [key in PitchingStats]?: number };

const TRADE_MESSAGE_TYPES = [224, 225, 226, 241, 242, 243, 244, 245, 246];

export interface RecentActivityOptions {
	/** Max topics to return. Default 25. */
	limit?: number;
	offset?: number;
	/** Only these message types (see ACTIVITY_MESSAGE_TYPES). Defaults to every add/drop/trade type. */
	messageTypeIds?: number[];
	/** Only activity at or after this time (ms since epoch). Handy for polling. */
	since?: number;
	/** Only activity before this time (ms since epoch). */
	until?: number;
}

export interface TransactionsOptions {
	/** Defaults to the current scoring period. */
	scoringPeriodId?: number;
	types?: TransactionType[];
}

export class League extends BaseClass {
	name?: string;
	scoringType?: string;
	positionCounts: PositionCounts = {};
	hittingScoreStats: HittingScoreStats = {};
	pitchingScoreStats: PitchingScoreStats = {};
	/** Every scored stat keyed by abbreviation (see STATS), including ones the legacy enums don't know. */
	scoringStats: { [stat: string]: number } = {};
	tradeDeadline?: number;
	status?: LeagueStatus;
	scoringPeriodId?: number;

	/**
	 * @param {number} leagueId - ESPN league id
	 * @param cookies - espn_s2 and SWID, required for private leagues and all writes
	 * @param {number} [year] - season to read, defaults to the current calendar year
	 */
	constructor(leagueId: number, cookies?: ESPNCookiesDto, year?: number) {
		super(leagueId, cookies, year);
	}

	/**
	 * @returns League - your currently initiated league
	 */
	async init(): Promise<League> {
		const params = {
			view: ['mSettings', 'mStatus'],
		};
		const leagueData = await this.fantasyRequests.get<LeagueDto>('', {}, params);

		this.name = leagueData.settings.name;
		this.scoringType = leagueData.settings.scoringSettings.scoringType;
		this.status = leagueData.status;
		this.scoringPeriodId = leagueData.scoringPeriodId;

		const lineupSlotCounts = leagueData.settings.rosterSettings.lineupSlotCounts;
		Object.keys(leagueData.settings.rosterSettings.lineupSlotCounts).forEach((key) => {
			const positionKey = Positions[key as keyof typeof Positions];
			if (positionKey !== undefined) {
				this.positionCounts[positionKey] = lineupSlotCounts[key];
			}
		});

		leagueData.settings.scoringSettings.scoringItems.forEach((item: { statId: number; points: number }) => {
			this.scoringStats[STATS[item.statId] ?? String(item.statId)] = item.points;
			if (HittingStats[item.statId]) {
				const statKey = HittingStats[item.statId as unknown as keyof typeof HittingStats];
				this.hittingScoreStats[statKey] = item.points;
			} else if (PitchingStats[item.statId]) {
				const statKey = PitchingStats[item.statId as unknown as keyof typeof PitchingStats];
				this.pitchingScoreStats[statKey] = item.points;
			}
		});

		this.tradeDeadline = leagueData.settings.tradeSettings.deadlineDate;

		return this;
	}

	/** The matchup period (week) in progress. Requires init(). */
	get currentMatchupPeriod(): number | undefined {
		return this.status?.currentMatchupPeriod;
	}

	/**
	 * The scoring period (day) in progress, clamped to the last one once the season is over.
	 * Requires init().
	 */
	get currentScoringPeriod(): number | undefined {
		if (this.scoringPeriodId === undefined) return undefined;
		const final = this.status?.finalScoringPeriod;
		return final && this.scoringPeriodId > final ? final : this.scoringPeriodId;
	}

	/** Seasons this league existed before `year`; open one with `new League(id, cookies, season)`. */
	get previousSeasons(): number[] {
		return (this.status?.previousSeasons || []).filter((season) => season < this.year);
	}

	/**
	 * @returns Teams object
	 */
	teams(): Teams {
		return new Teams(this.leagueId, this.cookies, this.year);
	}

	players(): Players {
		return new Players(this.leagueId, this.cookies, this.year);
	}

	/**
	 * @returns Transactions object for roster moves (adds, drops, waiver claims, lineup changes)
	 */
	transactions(): Transactions {
		return new Transactions(this.leagueId, this.cookies, this.year);
	}

	/**
	 * @returns a list of all team data
	 */
	async getLeagueTeams(): Promise<TeamDto[]> {
		const leagueData = await this.leagueRequest();
		return leagueData.teams;
	}

	/**
	 * @returns a list of members in the league
	 */
	async getLeagueMembers(): Promise<MemberDto[]> {
		const leagueData = await this.leagueRequest();
		return leagueData.members;
	}

	/**
	 * @returns a boolean whether or not the current SWID is league manager
	 */
	async isLeagueManager(): Promise<boolean> {
		const members = await this.getLeagueMembers();
		const swid = new SWID(this.cookies?.swid).swid;

		if (members === undefined) {
			throw new NotFound('No Members Found');
		}

		const member = members.find((member: MemberDto) => String(member.id).toUpperCase() === swid.toUpperCase());

		if (!member) return false;

		return member.isLeagueManager;
	}

	/**
	 * @returns the league's status: current matchup/scoring period, first/final scoring period,
	 * previous seasons and waiver timing
	 */
	async getStatus(): Promise<LeagueStatus> {
		const data = await this.fantasyRequests.get<LeagueDto>('', {}, { view: 'mStatus' });
		this.status = data.status;
		this.scoringPeriodId = data.scoringPeriodId;
		return this.status;
	}

	/**
	 * @param {number} [matchupPeriodId] - defaults to the current matchup period
	 * @returns a list of matches for the given matchup period
	 */
	async getWeeklyMatchups(matchupPeriodId?: number): Promise<MatchUpDto[]> {
		const params = {
			view: ['mMatchup', 'mStatus'],
		};
		const matchUpsRequest = await this.fantasyRequests.get<MatchUpResponseDto & { status?: LeagueStatus }>(
			'',
			{},
			params
		);

		const period =
			matchupPeriodId ?? matchUpsRequest.status?.currentMatchupPeriod ?? this.status?.currentMatchupPeriod;

		return matchUpsRequest.schedule.filter((matchUp: MatchUpDto) => matchUp.matchupPeriodId === period);
	}

	/**
	 * Box scores carry each team's per-player lineup and stats for a scoring period
	 * (`home.rosterForCurrentScoringPeriod` / `away.rosterForCurrentScoringPeriod`).
	 * @param {number} [matchupPeriodId] - defaults to the current matchup period
	 * @param {number} [scoringPeriodId] - defaults to the current scoring period
	 */
	async getBoxScores(matchupPeriodId?: number, scoringPeriodId?: number): Promise<MatchUpDto[]> {
		const { matchupPeriod, scoringPeriod } = await this.resolvePeriods(matchupPeriodId, scoringPeriodId);
		const params = { view: ['mMatchupScore', 'mScoreboard'], scoringPeriodId: scoringPeriod };
		const headers = FantasyRequest.filter({ schedule: { filterMatchupPeriodIds: { value: [matchupPeriod] } } });
		const data = await this.fantasyRequests.get<MatchUpResponseDto>('', headers, params);

		return (data.schedule || []).filter((matchUp: MatchUpDto) => matchUp.matchupPeriodId === matchupPeriod);
	}

	/**
	 * @returns teams ordered by final rank once the season is decided, otherwise by playoff seed
	 */
	async getStandings(): Promise<TeamDto[]> {
		const data = await this.fantasyRequests.get<LeagueDto>('', {}, { view: ['mTeam', 'mStandings'] });
		const rank = (team: TeamDto): number => team.rankCalculatedFinal || team.playoffSeed || Number.MAX_SAFE_INTEGER;
		return [...(data.teams || [])].sort((a, b) => rank(a) - rank(b));
	}

	/**
	 * The league's activity feed (adds, drops, trades), newest first. This is what ESPN's
	 * "Recent Activity" page reads and is the best source for a transaction feed.
	 */
	async getRecentActivity({
		limit = 25,
		offset = 0,
		messageTypeIds = Object.keys(ACTIVITY_MESSAGE_TYPES).map(Number),
		since,
		until,
	}: RecentActivityOptions = {}): Promise<Activity[]> {
		const topics: { [key: string]: unknown } = {
			filterType: { value: ['ACTIVITY_TRANSACTIONS'] },
			limit,
			limitPerMessageSet: { value: 25 },
			offset,
			sortMessageDate: { sortPriority: 1, sortAsc: false },
			sortFor: { sortPriority: 2, sortAsc: false },
			filterIncludeMessageTypeIds: { value: messageTypeIds },
		};
		if (since !== undefined || until !== undefined) {
			topics.filterDateRange = { value: since ?? 0, additionalValue: until ?? Date.now() };
		}

		let data: { topics?: ActivityTopic[] };
		try {
			data = await this.fantasyRequests.get('/communication/', FantasyRequest.filter({ topics }), {
				view: 'kona_league_communication',
			});
		} catch (e) {
			// Leagues without a message board (and most past seasons) 404 with COMMUNICATION_GROUP_NOT_FOUND
			if (e instanceof ESPNNotFound) return [];
			throw e;
		}

		return (data.topics || []).map((topic) => ({
			id: topic.id,
			date: topic.date,
			actions: (topic.messages || []).map(toActivityAction),
		}));
	}

	/**
	 * Transactions processed (or attempted) in a scoring period, including failed waiver claims.
	 * Note: ESPN leaves `items` empty on TRADE_ACCEPT rows for trades the authenticated user
	 * was not part of.
	 */
	async getTransactions({ scoringPeriodId, types }: TransactionsOptions = {}): Promise<Transaction[]> {
		const scoringPeriod = scoringPeriodId ?? (await this.resolvePeriods()).scoringPeriod;
		const filter = types ? { transactions: { filterType: { value: types } } } : {};
		const data = await this.fantasyRequests.get<{ transactions?: Transaction[] }>(
			'',
			FantasyRequest.filter(filter),
			{ view: 'mTransactions2', scoringPeriodId: scoringPeriod }
		);
		return data.transactions || [];
	}

	/**
	 * Pending trades and waiver claims visible to the authenticated user.
	 */
	async getPendingTransactions(): Promise<Transaction[]> {
		const data = await this.fantasyRequests.get<{
			transactions?: Transaction[];
			pendingTransactions?: Transaction[];
		}>('', {}, { view: 'mPendingTransactions' });
		return data.pendingTransactions || data.transactions || [];
	}

	/**
	 * @returns draft state and picks. Poll during a live draft to stream picks.
	 */
	async getDraft(): Promise<DraftDetail> {
		const data = await this.fantasyRequests.get<{ draftDetail: DraftDetail }>('', {}, { view: 'mDraftDetail' });
		return data.draftDetail;
	}

	/**
	 * @returns every MLB team with its games keyed by scoring period (no league or auth needed)
	 */
	async getProTeamSchedules(): Promise<ProTeam[]> {
		const data = await this.fantasyRequests.getSeason<{ settings?: { proTeams?: ProTeam[] } }>(
			'',
			{},
			{ view: 'proTeamSchedules_wl' }
		);
		return data.settings?.proTeams || [];
	}

	/**
	 * @param {number} scoringPeriodId - the fantasy scoring period (day)
	 * @returns MLB games that day keyed by proTeamId; doubleheaders return two games
	 */
	async getProGames(scoringPeriodId: number): Promise<{ [proTeamId: number]: ProGame[] }> {
		const proTeams = await this.getProTeamSchedules();
		return proTeams.reduce((acc: { [proTeamId: number]: ProGame[] }, team) => {
			const games = team.proGamesByScoringPeriod?.[String(scoringPeriodId)];
			if (team.id !== 0 && games?.length) acc[team.id] = games;
			return acc;
		}, {});
	}

	private async resolvePeriods(
		matchupPeriodId?: number,
		scoringPeriodId?: number
	): Promise<{ matchupPeriod: number; scoringPeriod: number }> {
		if ((matchupPeriodId === undefined || scoringPeriodId === undefined) && !this.status) {
			await this.getStatus();
		}
		return {
			matchupPeriod: (matchupPeriodId ?? this.currentMatchupPeriod) as number,
			scoringPeriod: (scoringPeriodId ?? this.currentScoringPeriod) as number,
		};
	}

	private async leagueRequest(): Promise<LeagueDto> {
		return this.fantasyRequests.get<LeagueDto>();
	}
}

const asTeamId = (value: unknown): number | undefined =>
	value === undefined || value === null || value === '' ? undefined : Number(value);

const toActivityAction = (message: ActivityMessage): Activity['actions'][number] => {
	const fromTeamId = asTeamId(message.from);
	const toTeamId = asTeamId(message.to);
	let teamId = toTeamId;
	if (message.messageTypeId === 239) teamId = asTeamId(message.for);
	else if (TRADE_MESSAGE_TYPES.includes(message.messageTypeId)) teamId = fromTeamId;

	return {
		action: ACTIVITY_MESSAGE_TYPES[message.messageTypeId] ?? 'UNKNOWN',
		messageTypeId: message.messageTypeId,
		playerId: asTeamId(message.targetId),
		teamId,
		fromTeamId,
		toTeamId,
	};
};
