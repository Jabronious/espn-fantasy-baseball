import { ESPNCookiesDto, SWID } from '../../models/classes/espn-cookies.dto';
import { MalformedSWID } from '../../models/errors/malformed-swid';
import { SWIDNotSet } from '../../models/errors/swid-not-set';

describe('SWID', () => {
	const swid = new SWID('{A11A1111-1AAA-111A-1A11-111AAA111A1A}');

	it('should be defined', () => {
		expect(swid).toBeDefined();
	});

	it('should throw an error if the swid wasnt set', () => {
		expect(() => new SWID(undefined)).toThrowError(SWIDNotSet);
	});

	it('should throw an error if the swid was malformed', () => {
		expect(() => new SWID('undefined')).toThrowError(MalformedSWID);
	});
});

describe('ESPNCookiesDto', () => {
	const cookies = new ESPNCookiesDto('some encrypted cookie value', '{A11A1111-1AAA-111A-1A11-111AAA111A1A}');

	it('should be defined', () => {
		expect(cookies).toBeDefined();
	});
});
