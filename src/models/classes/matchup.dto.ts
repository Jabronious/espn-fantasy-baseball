import { IMatchUp } from '../interfaces/i-matchup';
import { MatchUpTeamDTo } from './matchup-team.dto';

export class MatchUpDto implements IMatchUp {
	away: MatchUpTeamDTo;
	home: MatchUpTeamDTo;
	id: number;
	matchupPeriodId: number;
	winner: string;

	constructor(id: number, away: MatchUpTeamDTo, home: MatchUpTeamDTo, matchupPeriodId: number, winner: string) {
		this.id = id;
		this.away = away;
		this.home = home;
		this.matchupPeriodId = matchupPeriodId;
		this.winner = winner;
	}
}
