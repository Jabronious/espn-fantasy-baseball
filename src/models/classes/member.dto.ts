import { IMember } from '../interfaces/i-member';

export class MemberDto implements IMember {
	displayName: string;
	id: number;
	isLeagueManager: boolean;

	constructor(displayName: string, id: number, isLeagueManager: boolean) {
		this.displayName = displayName;
		this.id = id;
		this.isLeagueManager = isLeagueManager;
	}
}
