import { BaseClass } from './base-class';
import { ESPNCookiesDto, SWID } from './models/classes/espn-cookies.dto';
import { LeagueDto } from './models/classes/league.dto';
import { PlayerDto } from './models/classes/player.dto';
import { TeamDto } from './models/classes/team.dto';
import { TeamNotFound } from './models/errors/team-not-found';

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
		const team = await this.fantasyRequests.get<TeamDto>(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return team;
	}

	/**
	 * @returns Team info data for the given swid
	 */
	async getTeamInfoFromSWID(): Promise<TeamDto | undefined> {
		const swid = new SWID(this.cookies?.swid);
		const params = { view: 'mTeam' };
		const team = await this.findTeamFromSWID(swid, params);

		return team;
	}

	/**
	 * @returns Team roster data for the given swid
	 */
	async getTeamRosterFromSWID(): Promise<PlayerDto[]> {
		const swid = new SWID(this.cookies?.swid);
		const params = { view: ['mTeam', 'mRoster'] };
		const team = await this.findTeamFromSWID(swid, params);

		return this.getPlayersFromEspnRoster(team.roster);
	}

	/**
	 * @param {number} teamId - team id for the team you wish to get the roster for
	 * @returns Team roster data for the given team id
	 */
	async getTeamRoster(teamId: number): Promise<PlayerDto[]> {
		const params = { view: 'mRoster' };
		const team = await this.fantasyRequests.get<TeamDto>(`/teams/${teamId}`, {}, params).catch((e) => {
			throw new Error(e);
		});

		return this.getPlayersFromEspnRoster(team.roster);
	}

	/**
	 * @returns All team roster data for the league
	 */
	async getAllTeamsRoster(): Promise<{ [key: string]: PlayerDto[] }> {
		const rosterParams = { view: 'mRoster' };
		const leagueRosterData = await this.fantasyRequests.get<LeagueDto>('', {}, rosterParams).catch((e) => {
			throw new Error(e);
		});

		const teamParams = { view: 'mTeam' };
		const leagueTeamData = await this.fantasyRequests.get<LeagueDto>('', {}, teamParams).catch((e) => {
			throw new Error(e);
		});

		const teams = leagueTeamData.teams;
		const teamRosters: { [key: string]: PlayerDto[] } = {};
		teams.forEach((team: { name: string; id: number }) => {
			const tempTeam = leagueRosterData.teams.find((rosterTeam: { id: number }) => {
				return rosterTeam.id === team.id;
			});
			if (tempTeam) {
				teamRosters[team.name.trim()] = this.getPlayersFromEspnRoster(tempTeam.roster);
			}
		});
		return teamRosters;
	}

	private getPlayersFromEspnRoster(roster: { entries: [{ playerPoolEntry: { player: PlayerDto } }] }): PlayerDto[] {
		return roster.entries.map((entry: { playerPoolEntry: { player: PlayerDto } }) => {
			return entry.playerPoolEntry.player;
		});
	}

	private async findTeamFromSWID(
		swid: SWID,
		params?: {
			[key: string]: unknown;
		}
	): Promise<TeamDto> {
		const _swid = swid.swid;
		const teams = await this.fantasyRequests.get<TeamDto[]>(`/teams`, {}, params).catch((e) => {
			throw new Error(e);
		});

		const team = teams.find((team: TeamDto) => team.owners.includes(_swid));

		if (!team) {
			throw new TeamNotFound();
		}
		return team;
	}
}
