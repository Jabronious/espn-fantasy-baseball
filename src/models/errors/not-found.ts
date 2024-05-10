export class NotFound extends Error {
	constructor(message = 'Not Found') {
		super(message);
		this.name = 'NotFound';
	}
}
