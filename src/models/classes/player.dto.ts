import { IPlayer } from '../interfaces/i-player';
import { IPlayerResponse } from '../interfaces/i-player-response';

export class PlayerDto implements IPlayer {
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

	constructor(
		active: boolean,
		defaultPositionId: number,
		draftRanksByRankType: {},
		droppable: boolean,
		eligibleSlots: [],
		firstName: string,
		fullName: string,
		gamesPlayedByPosition: {},
		id: number,
		injured: boolean,
		injuryStatus: string,
		lastName: string,
		lastNewsDate: number,
		ownership: {},
		proTeamId: number,
		seasonOutlook: string,
		starterStatusByProGame: {},
		stats: [],
		universeId: number
	) {
		this.active = active;
		this.defaultPositionId = defaultPositionId;
		this.draftRanksByRankType = draftRanksByRankType;
		this.droppable = droppable;
		this.eligibleSlots = eligibleSlots;
		this.firstName = firstName;
		this.fullName = fullName;
		this.gamesPlayedByPosition = gamesPlayedByPosition;
		this.id = id;
		this.injured = injured;
		this.injuryStatus = injuryStatus;
		this.lastName = lastName;
		this.lastNewsDate = lastNewsDate;
		this.ownership = ownership;
		this.proTeamId = proTeamId;
		this.seasonOutlook = seasonOutlook;
		this.starterStatusByProGame = starterStatusByProGame;
		this.stats = stats;
		this.universeId = universeId;
	}
}

export class PlayerResponseDto implements IPlayerResponse {
	player: PlayerDto;

	constructor(player: PlayerDto) {
		this.player = player;
	}
}
