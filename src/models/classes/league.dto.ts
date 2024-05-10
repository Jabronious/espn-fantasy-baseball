import { Positions } from '../enums/positions';
import { HittingStats, PitchingStats, Stats } from '../enums/stats';
import { ILeague } from '../interfaces/i-league';
import { IRosterSettings, IScoringSettings, ISettings, ITradeSettings } from '../interfaces/i-settings';
import { MemberDto } from './member.dto';
import { TeamDto } from './team.dto';

export class LeagueDto implements ILeague {
	gameId: number;
	id: number;
	members: [MemberDto];
	scoringPeriodId: number;
	seasonId: number;
	segmentId: number;
	settings: SettingsDto;
	status: {
		currentMatchupPeriod: number;
		isActive: boolean;
		latestScoringPeriod: number;
	};
	teams: [TeamDto];

	constructor(
		gameId: number,
		id: number,
		members: [MemberDto],
		scoringPeriodId: number,
		seasonId: number,
		segmentId: number,
		settings: SettingsDto,
		status: {
			currentMatchupPeriod: number;
			isActive: boolean;
			latestScoringPeriod: number;
		},
		teams: [TeamDto]
	) {
		this.gameId = gameId;
		this.id = id;
		this.members = members;
		this.scoringPeriodId = scoringPeriodId;
		this.seasonId = seasonId;
		this.segmentId = segmentId;
		this.settings = settings;
		this.status = status;
		this.teams = teams;
	}
}

export class SettingsDto implements ISettings {
	name: string;
	rosterSettings: RosterSettings;
	scoringSettings: ScoringSettingsDto;
	tradeSettings: TradeSettingsDto;

	constructor(
		name: string,
		rosterSettings: RosterSettings,
		scoringSettings: ScoringSettingsDto,
		tradeSettings: TradeSettingsDto
	) {
		this.name = name;
		this.rosterSettings = rosterSettings;
		this.scoringSettings = scoringSettings;
		this.tradeSettings = tradeSettings;
	}
}

class TradeSettingsDto implements ITradeSettings {
	allowOutOfUniverse: boolean;
	deadlineDate: number;
	max: number;
	revisionHours: number;
	vetoVotesRequired: number;

	constructor(
		allowOutOfUniverse: boolean,
		deadlineDate: number,
		max: number,
		revisionHours: number,
		vetoVotesRequired: number
	) {
		this.allowOutOfUniverse = allowOutOfUniverse;
		this.deadlineDate = deadlineDate;
		this.max = max;
		this.revisionHours = revisionHours;
		this.vetoVotesRequired = vetoVotesRequired;
	}
}

class ScoringSettingsDto implements IScoringSettings {
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

	constructor(
		allowOutOfPositionScoring: boolean,
		homeTeamBonus: number,
		matchupTieRule: string,
		matchupTieRuleBy: number,
		playerRankType: string,
		playoffHomeTeamBonus: number,
		playoffMatchupTieRule: string,
		playoffMatchupTieRuleBy: number,
		scoringItems: { statId: number; points: number }[],
		scoringType: string,
		statQualificationMinimum: [Object]
	) {
		this.allowOutOfPositionScoring = allowOutOfPositionScoring;
		this.homeTeamBonus = homeTeamBonus;
		this.matchupTieRule = matchupTieRule;
		this.matchupTieRuleBy = matchupTieRuleBy;
		this.playerRankType = playerRankType;
		this.playoffHomeTeamBonus = playoffHomeTeamBonus;
		this.playoffMatchupTieRule = playoffMatchupTieRule;
		this.playoffMatchupTieRuleBy = playoffMatchupTieRuleBy;
		this.scoringItems = scoringItems;
		this.scoringType = scoringType;
		this.statQualificationMinimum = statQualificationMinimum;
	}
}

class RosterSettings implements IRosterSettings {
	isBenchUnlimited: boolean;
	isUsingUndroppableList: boolean;
	lineupLocktimeType: string;
	lineupSlotCounts: { [key: string]: number };
	lineupSlotStatLimits: [Object];
	moveLimit: number;
	positionLimits: [Object];
	rosterLocktimeType: string;
	universeIds: [];

	constructor(
		isBenchUnlimited: boolean,
		isUsingUndroppableList: boolean,
		lineupLocktimeType: string,
		lineupSlotCounts: { [key: string]: number },
		lineupSlotStatLimits: [Object],
		moveLimit: number,
		positionLimits: [Object],
		rosterLocktimeType: string,
		universeIds: []
	) {
		this.isBenchUnlimited = isBenchUnlimited;
		this.isUsingUndroppableList = isUsingUndroppableList;
		this.lineupLocktimeType = lineupLocktimeType;
		this.lineupSlotCounts = lineupSlotCounts;
		this.lineupSlotStatLimits = lineupSlotStatLimits;
		this.moveLimit = moveLimit;
		this.positionLimits = positionLimits;
		this.rosterLocktimeType = rosterLocktimeType;
		this.universeIds = universeIds;
	}
}
