import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { MatchUpDto } from './models/classes/matchup.dto';
import { MemberDto } from './models/classes/member.dto';
import { TeamDto } from './models/classes/team.dto';
import { Teams } from './teams';
import { FantasyRequest } from './utils/fantasy-requests';

export class League {
	leagueId: number;
	cookies: ESPNCookiesDto | undefined;
	private fantasyRequests: FantasyRequest;

	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		this.leagueId = leagueId;
		this.cookies = cookies;
		this.fantasyRequests = new FantasyRequest(leagueId, cookies);
	}

	/**
	 * @returns Teams object
	 */
	teams(): Teams {
		return new Teams(this.leagueId, this.cookies);
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
