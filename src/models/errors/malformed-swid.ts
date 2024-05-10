export class MalformedSWID extends Error {
	constructor(
		message = 'SWID does not match format: /^{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}}$/'
	) {
		super(message);
		this.name = 'MalformedSWID';
	}
}
