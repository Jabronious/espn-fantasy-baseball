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
	async getTeamRoster(teamId: number): Promise<Player[]> {
		const params = { view: 'mRoster' };
		const response = await this.fantasyRequests.get(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return this.getPlayersFromEspnRoster(
			response.data.roster as { entries: [{ playerPoolEntry: { player: Player } }] }
		);
	}

	/**
	 * @returns All team roster data for the league
	 */
	async getAllTeamsRoster(): Promise<{ [key: string]: Player[] }> {
		const params = { view: 'mRoster' };
		const response = await this.fantasyRequests.get('', {}, params).catch((e) => {
			throw new Error(e);
		});

		const teamData = (
			await this.fantasyRequests.get('', {}, { view: 'mTeam' }).catch((e) => {
				throw new Error(e);
			})
		).data.teams;

		const teamRosters: { [key: string]: Player[] } = {};
		teamData.forEach((team: { nickname: string; id: number }) => {
			teamRosters[team.nickname] = this.getPlayersFromEspnRoster(
				response.data.teams.find((rosterTeam: { id: number }) => {
					return rosterTeam.id === team.id;
				}).roster
			);
		});
		return teamRosters;
	}

	private getPlayersFromEspnRoster(roster: { entries: [{ playerPoolEntry: { player: Player } }] }): Player[] {
		return roster.entries.map((entry: { playerPoolEntry: { player: Player } }) => {
			return entry.playerPoolEntry.player;
		});
	}
}
