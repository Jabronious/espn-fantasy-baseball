import { ITeam } from '../interfaces/i-team';

export class TeamDto implements ITeam {
	abbrev: string;
	id: number;
	location: string;
	nickname: string;
	owners: [string];

	constructor(abbrev: string, id: number, location: string, nickname: string, owners: [string]) {
		this.abbrev = abbrev;
		this.id = id;
		this.location = location;
		this.nickname = nickname;
		this.owners = owners;
	}
}
