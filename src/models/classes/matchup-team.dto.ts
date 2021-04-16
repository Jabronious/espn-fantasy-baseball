import { IMatchupTeam } from '../interfaces/i-matchup-team';
import { ScoreByStatDto } from './score-by-stat.dto';

export class MatchUpTeamDTo implements IMatchupTeam {
	cumulativeScore: {
		losses: number;
		scoreByStat: {
			'0': ScoreByStatDto;
			'1': ScoreByStatDto;
			'33': ScoreByStatDto;
			'2': ScoreByStatDto;
			'34': ScoreByStatDto;
			'5': ScoreByStatDto;
			'37': ScoreByStatDto;
			'39': ScoreByStatDto;
			'41': ScoreByStatDto;
			'45': ScoreByStatDto;
			'47': ScoreByStatDto;
			'48': ScoreByStatDto;
			'20': ScoreByStatDto;
			'21': ScoreByStatDto;
			'53': ScoreByStatDto;
			'23': ScoreByStatDto;
			'57': ScoreByStatDto;
		};
		statBySlot: {
			'22': {
				exceededOnScoringPeriod: number;
				limitExceeded: boolean;
				statId: number;
				value: number;
			};
		};
		ties: number;
		wins: number;
	};
	gamesPlayed: number;
	teamId: number;
	totalPoints: number;

	constructor(gamesPlayed: number, teamId: number, totalPoints: number, cumulativeScore: any) {
		this.gamesPlayed = gamesPlayed;
		this.teamId = teamId;
		this.totalPoints = totalPoints;
		this.cumulativeScore = cumulativeScore;
	}
}
