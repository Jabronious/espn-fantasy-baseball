import { BaseClass } from './base-class';
import { ESPNCookiesDto, SWID } from './models/classes/espn-cookies.dto';
import { LeagueDto } from './models/classes/league.dto';
import { MatchUpDto, MatchUpResponseDto } from './models/classes/matchup.dto';
import { MemberDto } from './models/classes/member.dto';
import { TeamDto } from './models/classes/team.dto';
import { Positions } from './models/enums/positions';
import { HittingStats, PitchingStats } from './models/enums/stats';
import { NotFound } from './models/errors/not-found';
import { Players } from './players';
import { Teams } from './teams';

type PositionCounts = { [key in Positions]?: number };
type HittingScoreStats = { [key in HittingStats]?: number };
type PitchingScoreStats = { [key in PitchingStats]?: number };

export class League extends BaseClass {
	positionCounts: PositionCounts = {};
	hittingScoreStats: HittingScoreStats = {};
	pitchingScoreStats: PitchingScoreStats = {};
	tradeDeadline?: number;
	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		super(leagueId, cookies);
	}

	/**
	 * @returns League - your currently initiated league
	 */
	async init(): Promise<League> {
		const params = {
			view: 'mSettings',
		};
		const leagueData = await this.fantasyRequests.get<LeagueDto>('', {}, params).catch((e: string) => {
			throw new Error(e);
		});

		const lineupSlotCounts = leagueData.settings.rosterSettings.lineupSlotCounts;
		Object.keys(leagueData.settings.rosterSettings.lineupSlotCounts).forEach((key) => {
			const positionKey = Positions[key as keyof typeof Positions];
			if (positionKey !== undefined) {
				this.positionCounts[positionKey] = lineupSlotCounts[key];
			}
		});

		leagueData.settings.scoringSettings.scoringItems.forEach((item: { statId: number; points: number }) => {
			if (HittingStats[item.statId]) {
				const statKey = HittingStats[item.statId as unknown as keyof typeof HittingStats];
				this.hittingScoreStats[statKey] = item.points;
			} else {
				const statKey = PitchingStats[item.statId as unknown as keyof typeof PitchingStats];
				this.pitchingScoreStats[statKey] = item.points;
			}
		});

		this.tradeDeadline = leagueData.settings.tradeSettings.deadlineDate;

		return this;
	}

	/**
	 * @returns Teams object
	 */
	teams(): Teams {
		return new Teams(this.leagueId, this.cookies);
	}

	players(): Players {
		return new Players(this.leagueId, this.cookies);
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

		const member = members.find((member: MemberDto) => member.id === swid);

		if (!member) return false;

		return member.isLeagueManager;
	}

	/**
	 * @returns a list of matches for the given week
	 */
	async getWeeklyMatchups(): Promise<MatchUpDto[]> {
		const params = {
			view: 'mMatchup',
		};
		const matchUpsRequest = await this.fantasyRequests.get<MatchUpResponseDto>('', {}, params).catch((e) => {
			throw new Error(e);
		});

		const currentMatchUps = matchUpsRequest.schedule.filter(
			(matchUp: MatchUpDto) => matchUp.matchupPeriodId === matchUpsRequest.gameId
		);

		return currentMatchUps;
	}

	private async leagueRequest(): Promise<LeagueDto> {
		return await this.fantasyRequests.get<LeagueDto>().catch((e) => {
			throw new Error(e);
		});
	}
}
