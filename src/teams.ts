import { BaseClass } from './base-class';
import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { PlayerDto } from './models/classes/player.dto';
import { TeamDto } from './models/classes/team.dto';

export class Teams extends BaseClass {
	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		super(leagueId, cookies);
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
	async getTeamRoster(teamId: number): Promise<PlayerDto[]> {
		const params = { view: 'mRoster' };
		const response = await this.fantasyRequests.get(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return this.getPlayersFromEspnRoster(
			response.data.roster as { entries: [{ playerPoolEntry: { player: PlayerDto } }] }
		);
	}

	/**
	 * @returns All team roster data for the league
	 */
	async getAllTeamsRoster(): Promise<{ [key: string]: PlayerDto[] }> {
		const params = { view: 'mRoster' };
		const response = await this.fantasyRequests.get('', {}, params).catch((e) => {
			throw new Error(e);
		});

		const teamData = (
			await this.fantasyRequests.get('', {}, { view: 'mTeam' }).catch((e) => {
				throw new Error(e);
			})
		).data.teams;

		const teamRosters: { [key: string]: PlayerDto[] } = {};
		teamData.forEach((team: { nickname: string; id: number }) => {
			teamRosters[team.nickname] = this.getPlayersFromEspnRoster(
				response.data.teams.find((rosterTeam: { id: number }) => {
					return rosterTeam.id === team.id;
				}).roster
			);
		});
		return teamRosters;
	}

	private getPlayersFromEspnRoster(roster: { entries: [{ playerPoolEntry: { player: PlayerDto } }] }): PlayerDto[] {
		return roster.entries.map((entry: { playerPoolEntry: { player: PlayerDto } }) => {
			return entry.playerPoolEntry.player;
		});
	}
}
