export interface ISettings {
	name: string;
	rosterSettings: IRosterSettings;
	scoringSettings: IScoringSettings;
	tradeSettings: ITradeSettings;
}

export interface IRosterSettings {
	isBenchUnlimited: boolean;
	isUsingUndroppableList: boolean;
	lineupLocktimeType: string;
	lineupSlotCounts: { [key: string]: number };
	lineupSlotStatLimits: [Object];
	moveLimit: number;
	positionLimits: [Object];
	rosterLocktimeType: string;
	universeIds: [];
}

export interface IScoringSettings {
	allowOutOfPositionScoring: boolean;
	homeTeamBonus: number;
	matchupTieRule: string;
	matchupTieRuleBy: number;
	playerRankType: string;
	playoffHomeTeamBonus: number;
	playoffMatchupTieRule: string;
	playoffMatchupTieRuleBy: number;
	scoringItems: { statId: number; points: number }[];
	scoringType: string;
	statQualificationMinimum: [Object];
}

export interface ITradeSettings {
	allowOutOfUniverse: boolean;
	deadlineDate: number;
	max: number;
	revisionHours: number;
	vetoVotesRequired: number;
}
