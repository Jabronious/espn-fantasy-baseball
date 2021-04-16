import { IScoreByStat } from './i-score-by-stat';

export interface IMatchupTeam {
	cumulativeScore: {
		losses: number;
		scoreByStat: {
			'0': IScoreByStat;
			'1': IScoreByStat;
			'33': IScoreByStat;
			'2': IScoreByStat;
			'34': IScoreByStat;
			'5': IScoreByStat;
			'37': IScoreByStat;
			'39': IScoreByStat;
			'41': IScoreByStat;
			'45': IScoreByStat;
			'47': IScoreByStat;
			'48': IScoreByStat;
			'20': IScoreByStat;
			'21': IScoreByStat;
			'53': IScoreByStat;
			'23': IScoreByStat;
			'57': IScoreByStat;
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
}
