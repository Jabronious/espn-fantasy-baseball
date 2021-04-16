import { IMatchupTeam } from './i-matchup-team';

export interface IMatchUp {
	away: IMatchupTeam;
	home: IMatchupTeam;
	id: number;
	matchupPeriodId: number;
	winner: string;
}
