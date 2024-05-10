import { IMatchUp } from './i-matchup';

export interface IMatchUpResponse {
	draftDetail: { drafted: boolean; inProgress: boolean };
	gameId: number;
	id: number;
	schedule: IMatchUp[];
}
