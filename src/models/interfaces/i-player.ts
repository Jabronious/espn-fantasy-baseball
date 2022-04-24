export interface IPlayer {
	active: boolean;
	defaultPositionId: number;
	draftRanksByRankType: {};
	droppable: boolean;
	eligibleSlots: [];
	firstName: string;
	fullName: string;
	gamesPlayedByPosition: {};
	id: number;
	injured: boolean;
	injuryStatus: string;
	lastName: string;
	lastNewsDate: number;
	ownership: {};
	proTeamId: number;
	seasonOutlook: string;
	starterStatusByProGame: {};
	stats: [];
	universeId: number;
}
