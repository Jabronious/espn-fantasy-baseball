import { IMember } from '../interfaces/i-member';

export class MemberDto implements IMember {
	displayName: string;
	id: string;
	isLeagueManager: boolean;

	constructor(displayName: string, id: string, isLeagueManager: boolean) {
		this.displayName = displayName;
		this.id = id;
		this.isLeagueManager = isLeagueManager;
	}
}
