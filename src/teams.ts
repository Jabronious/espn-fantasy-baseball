import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { Player } from './models/classes/player.dto';
import { TeamDto } from './models/classes/team.dto';
import { FantasyRequest } from './utils/fantasy-requests';

export class Teams {
	leagueId: number;
	cookies: ESPNCookiesDto | undefined;
	private fantasyRequests: FantasyRequest;

	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		this.leagueId = leagueId;
		this.cookies = cookies;
		this.fantasyRequests = new FantasyRequest(leagueId, cookies);
	}

	/**
	 * @param {number} teamId - team id for the team you wish to look up
	 * @returns Team data for the given team id
	 */
	async getDetailedTeamData(teamId: number): Promise<TeamDto> {
		const params = { view: 'mTeam' };
		const response = await this.fantasyRequests.get(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return response.data;
	}

	/**
	 * @param {number} teamId - team id for the team you wish to get the roster for
	 * @returns Team roster data for the given team id
	 */
	async getTeamRoster(teamId: number): Promise<[Player]> {
		const params = { view: 'mRoster' };
		const response = await this.fantasyRequests.get(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return response.data.roster.entries.map((entry: { playerPoolEntry: { player: Player } }) => {
			return entry.playerPoolEntry.player;
		});
	}
}
