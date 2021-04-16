import { IMember } from './i-member';
import { ITeam } from './i-team';

export interface ILeague {
	gameId: number;
	id: number;
	members: [IMember];
	scoringPeriodId: number;
	seasonId: number;
	segmentId: number;
	settings: {
		name: string;
	};
	status: {
		currentMatchupPeriod: number;
		isActive: boolean;
		latestScoringPeriod: number;
	};
	teams: [ITeam];
}
