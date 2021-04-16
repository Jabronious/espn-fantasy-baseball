import { IScoreByStat } from '../interfaces/i-score-by-stat';

export class ScoreByStatDto implements IScoreByStat {
	ineligible: boolean;
	rank: number;
	result: string | undefined;
	score: number;

	constructor(ineligible: boolean, rank: number, result: string | undefined, score: number) {
		this.ineligible = ineligible;
		this.rank = rank;
		this.result = result;
		this.score = score;
	}
}
