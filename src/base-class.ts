import { ESPNCookiesDto } from './models/classes/espn-cookies.dto';
import { FantasyRequest } from './utils/fantasy-requests';

export class BaseClass {
	leagueId: number;
	cookies: ESPNCookiesDto | undefined;
	fantasyRequests: FantasyRequest;

	constructor(leagueId: number, cookies?: ESPNCookiesDto) {
		this.leagueId = leagueId;
		this.cookies = cookies;
		this.fantasyRequests = new FantasyRequest(leagueId, cookies);
	}
}
