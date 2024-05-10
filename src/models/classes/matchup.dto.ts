import { IMatchUp } from '../interfaces/i-matchup';
import { IMatchUpResponse } from '../interfaces/i-matchup-response';
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
export class MatchUpResponseDto implements IMatchUpResponse {
	draftDetail: { drafted: boolean; inProgress: boolean };
	gameId: number;
	id: number;
	schedule: MatchUpDto[];

	constructor(
		draftDetail: { drafted: boolean; inProgress: boolean },
		gameId: number,
		id: number,
		schedule: MatchUpDto[]
	) {
		this.draftDetail = draftDetail;
		this.gameId = gameId;
		this.id = id;
		this.schedule = schedule;
	}
}
