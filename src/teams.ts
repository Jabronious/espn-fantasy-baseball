import { BaseClass } from './base-class';
import { ESPNCookiesDto, SWID } from './models/classes/espn-cookies.dto';
import { LeagueDto } from './models/classes/league.dto';
import { PlayerDto } from './models/classes/player.dto';
import { TeamDto } from './models/classes/team.dto';
import { TeamNotFound } from './models/errors/team-not-found';
import { LineupPlayer, RosterEntry } from './models/types';
import { toLineupPlayer } from './utils/player-utils';

type Roster = { entries: [{ playerPoolEntry: { player: PlayerDto } }] };

export class Teams extends BaseClass {
	constructor(leagueId: number, cookies?: ESPNCookiesDto, year?: number) {
		super(leagueId, cookies, year);
	}

	/**
	 * @param {number} teamId - team id for the team you wish to look up
	 * @returns Team data for the given team id
	 */
	async getDetailedTeamData(teamId: number): Promise<TeamDto> {
		const params = { view: 'mTeam' };
		return this.fantasyRequests.get<TeamDto>(`/teams/${teamId}`, {}, params);
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
	 * @param {number} [scoringPeriodId] - roster as of that scoring period (day); defaults to today
	 * @returns Team roster data for the given team id
	 */
	async getTeamRoster(teamId: number, scoringPeriodId?: number): Promise<PlayerDto[]> {
		const team = await this.fantasyRequests.get<TeamDto>(
			`/teams/${teamId}`,
			{},
			this.rosterParams('mRoster', scoringPeriodId)
		);

		return this.getPlayersFromEspnRoster(team.roster);
	}

	/**
	 * A team's lineup with slot, eligibility, MLB team, injury and lock state resolved, e.g. to
	 * flag benched starters or injured players in active slots.
	 * @param {number} teamId - team id
	 * @param {number} [scoringPeriodId] - lineup for that scoring period (day); defaults to today
	 */
	async getTeamLineup(teamId: number, scoringPeriodId?: number): Promise<LineupPlayer[]> {
		const team = await this.fantasyRequests.get<{ roster?: { entries?: RosterEntry[] } }>(
			`/teams/${teamId}`,
			{},
			this.rosterParams('mRoster', scoringPeriodId)
		);
		return (team.roster?.entries || []).map(toLineupPlayer);
	}

	/**
	 * @returns All team roster data for the league keyed by team name
	 */
	async getAllTeamsRoster(): Promise<{ [key: string]: PlayerDto[] }> {
		const leagueData = await this.fantasyRequests.get<LeagueDto>('', {}, { view: ['mTeam', 'mRoster'] });

		const teamRosters: { [key: string]: PlayerDto[] } = {};
		(leagueData.teams || []).forEach((team) => {
			if (team.name && team.roster) {
				teamRosters[team.name.trim()] = this.getPlayersFromEspnRoster(team.roster);
			}
		});
		return teamRosters;
	}

	/**
	 * Team names can change or collide; prefer this over getAllTeamsRoster for lookups.
	 * @param {number} [scoringPeriodId] - rosters as of that scoring period (day); defaults to today
	 * @returns All team rosters keyed by team id
	 */
	async getRostersByTeamId(scoringPeriodId?: number): Promise<{ [teamId: number]: PlayerDto[] }> {
		const leagueData = await this.fantasyRequests.get<LeagueDto>(
			'',
			{},
			this.rosterParams('mRoster', scoringPeriodId)
		);

		return (leagueData.teams || []).reduce((acc: { [teamId: number]: PlayerDto[] }, team) => {
			if (team.roster) acc[team.id] = this.getPlayersFromEspnRoster(team.roster);
			return acc;
		}, {});
	}

	/**
	 * Replaces a team's watch list. Requires the team owner's cookies.
	 * @param {number} teamId - team id
	 * @param {number[]} playerIds - the full watch list to save
	 */
	async updateWatchList(teamId: number, playerIds: number[]): Promise<unknown> {
		return this.fantasyRequests.post(`/teams/${teamId}`, { watchList: playerIds });
	}

	private rosterParams(view: string, scoringPeriodId?: number): { [key: string]: unknown } {
		return scoringPeriodId === undefined ? { view } : { view, scoringPeriodId };
	}

	private getPlayersFromEspnRoster(roster: Roster): PlayerDto[] {
		return (roster?.entries || []).map((entry: { playerPoolEntry: { player: PlayerDto } }) => {
			return entry.playerPoolEntry.player;
		});
	}

	private async findTeamFromSWID(
		swid: SWID,
		params?: {
			[key: string]: unknown;
		}
	): Promise<TeamDto> {
		// ESPN is inconsistent about SWID casing between cookies and payloads
		const _swid = swid.swid.toUpperCase();
		const teams = await this.fantasyRequests.get<TeamDto[]>(`/teams`, {}, params);

		const team = teams.find((team: TeamDto) => (team.owners || []).some((owner) => owner.toUpperCase() === _swid));

		if (!team) {
			throw new TeamNotFound();
		}
		return team;
	}
}
