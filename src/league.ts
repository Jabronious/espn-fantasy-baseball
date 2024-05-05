import { BaseClass } from './base-class';
import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { MatchUpDto } from './models/classes/matchup.dto';
import { MemberDto } from './models/classes/member.dto';
import { TeamDto } from './models/classes/team.dto';
import { Positions } from './models/enums/positions';
import { HittingStats, PitchingStats } from './models/enums/stats';
import { Players } from './players';
import { Teams } from './teams';

export class League extends BaseClass {
	positionCounts: { [key in Positions]?: number } = {};
	hittingScoreStats: { [key in HittingStats]?: number } = {};
	pitchingScoreStats: { [key in PitchingStats]?: number } = {};
	tradeDeadline: number | undefined;
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
		const fLeagueRes = await this.fantasyRequests.get('', {}, params).catch((e: string) => {
			throw new Error(e);
		});

		const lineupSlotCounts = fLeagueRes.data.settings.rosterSettings.lineupSlotCounts;
		Object.keys(fLeagueRes.data.settings.rosterSettings.lineupSlotCounts).forEach((key) => {
			this.positionCounts[Positions[key as unknown as number] as unknown as number] = lineupSlotCounts[key];
		});

		fLeagueRes.data.settings.scoringSettings.scoringItems.forEach((item: { statId: number; points: number }) => {
			if (HittingStats[item.statId as unknown as number]) {
				this.hittingScoreStats[HittingStats[item.statId as unknown as number] as unknown as number] =
					item.points;
			} else {
				this.pitchingScoreStats[PitchingStats[item.statId as unknown as number] as unknown as number] =
					item.points;
			}
		});

		this.tradeDeadline = fLeagueRes.data.settings.tradeSettings.deadlineDate;

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
	async getLeagueTeams(): Promise<[TeamDto]> {
		const fLeagueRes = await this.fantasyRequests.get().catch((e) => {
			throw new Error(e);
		});
		return fLeagueRes.data.teams as [TeamDto];
	}

	/**
	 * @returns a list of members in the league
	 */
	async getLeagueMembers(): Promise<[MemberDto]> {
		const fLeagueRes = await this.fantasyRequests.get().catch((e) => {
			throw new Error(e);
		});
		return fLeagueRes.data.members as [MemberDto];
	}

	/**
	 * @returns a list of matches for the given week
	 */
	async getWeeklyMatchups(): Promise<[MatchUpDto]> {
		const params = {
			view: 'mMatchup',
		};
		const fLeagueRes = await this.fantasyRequests.get('', {}, params).catch((e) => {
			throw new Error(e);
		});

		const currentMatchUps = fLeagueRes.data.schedule.filter(
			(matchUp: MatchUpDto) => matchUp.matchupPeriodId === fLeagueRes.data.gameId
		);

		return currentMatchUps;
	}
}
