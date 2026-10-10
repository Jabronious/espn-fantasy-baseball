import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { FantasyRequest } from './utils/fantasy-requests';

export class BaseClass {
	leagueId: number;
	cookies: ESPNCookiesDto | undefined;
	year: number;
	fantasyRequests: FantasyRequest;

	/**
	 * @param {number} leagueId - ESPN league id
	 * @param cookies - espn_s2 and SWID, required for private leagues and all writes
	 * @param {number} [year] - season to read, defaults to the current calendar year
	 */
	constructor(leagueId: number, cookies?: ESPNCookiesDto, year: number = new Date().getFullYear()) {
		this.leagueId = leagueId;
		this.cookies = cookies;
		this.year = year;
		this.fantasyRequests = new FantasyRequest(leagueId, cookies, year);
	}
}
