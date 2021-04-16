import { IESPNCookies } from '../interfaces/i-espn-cookies';

export class ESPNCookiesDto implements IESPNCookies {
	espn_s2: string;
	swid: string;

	constructor(espn_s2: string, swid: string) {
		this.espn_s2 = espn_s2;
		this.swid = swid;
	}
}
