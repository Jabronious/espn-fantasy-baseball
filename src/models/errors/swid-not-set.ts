export class SWIDNotSet extends Error {
	constructor(message = 'SWID has not been set') {
		super(message);
		this.name = 'SWIDNotSet';
	}
}
