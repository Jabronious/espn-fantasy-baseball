import { BaseClass } from './base-class';
import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { PlayerDto, PlayerResponseDto } from './models/classes/player.dto';

export class Players extends BaseClass {
	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		super(leagueId, cookies);
	}

	/**
	 * @param {number} playerId - player id for the player you wish to look up
	 * @param {boolean} [detailed=false] - true will returned more detailed data about a player
	 * @returns Player data for the given team id
	 */
	async getPlayerById(playerId: number, detailed: boolean = false): Promise<PlayerDto> {
		// https://fantasy.espn.com/apis/v3/games/flb/seasons/2022/players/32758?view=players_wl
		const params = { view: detailed ? 'mRoster' : 'players_wl' };
		const playerResponse = await this.fantasyRequests
			.get<PlayerResponseDto>(`/players/${playerId}`, {}, params)
			.catch((e) => {
				throw new Error(e);
			});

		return playerResponse.player;
	}
}
