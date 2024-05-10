export class TeamNotFound extends Error {
	constructor(message = 'Team was not found in the league') {
		super(message);
		this.name = 'TeamNotFound';
	}
}
