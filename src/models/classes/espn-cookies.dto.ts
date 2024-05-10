import { MalformedSWID } from '../errors/malformed-swid';
import { SWIDNotSet } from '../errors/swid-not-set';
import { IESPNCookies } from '../interfaces/i-espn-cookies';

export class ESPNCookiesDto implements IESPNCookies {
	espn_s2: string;
	swid: string;

	constructor(espn_s2: string, swid: string) {
		this.espn_s2 = espn_s2;
		this.swid = swid;
	}
}

export class SWID {
	private _swid: string;

	constructor(swid: string | undefined) {
		if (!swid) {
			throw new SWIDNotSet();
		}
		if (!this.validateSWID(swid)) {
			throw new MalformedSWID();
		}
		this._swid = swid;
	}

	private validateSWID(swid: string): boolean {
		const regex = /^\{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}$/i;
		return regex.test(swid);
	}

	get swid(): string {
		return this._swid;
	}
}
