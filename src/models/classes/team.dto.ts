import { ITeam } from '../interfaces/i-team';
import { SWID } from './espn-cookies.dto';
import { PlayerDto } from './player.dto';

export class RecordDto {
	gamesBack!: number;
	losses!: number;
	percentage!: number;
	pointsAgainst!: number;
	pointsFor!: number;
	streakLength!: number;
	streakType!: string;
	ties!: number;
	wins!: number;
}

export class PositionStat {
	'0': number;
	'1': number;
	'33': number;
	'2': number;
	'34': number;
	'5': number;
	'37': number;
	'39': number;
	'41': number;
	'45': number;
	'47': number;
	'48': number;
	'20': number;
	'21': number;
	'53': number;
	'23': number;
	'57': number;
}

enum RecordEnum {
	away,
	home,
	overall,
	division,
}

enum TransactionCounterEnum {
	acquisitionBudgetSpent,
	acquisitions,
	drops,
	matchupAcquisitionTotals,
	misc,
	moveToActive,
	moveToIR,
	paid,
	teamCharges,
	trades,
}
export class TeamDto implements ITeam {
	abbrev: string;
	id: number;
	location: string;
	nickname: string;
	owners: [string];
	currentProjectedRank: number;
	divisionId: number;
	draftDayProjectedRank: number;
	isActive: boolean;
	name: string;
	logo: string;
	logoType: string;
	playoffSeed: number;
	points: number;
	pointsAdjusted: number;
	pointsDelta: number;
	primaryOwner: string;
	rankCalculatedFinal: number;
	rankFinal: number;
	record: {
		away: RecordDto;
		home: RecordDto;
		division: RecordDto;
		overall: RecordDto;
	};
	valuesByStat: PositionStat;
	waiverRank: number;
	watchList: [string];
	transactionCounter: {
		acquisitionBudgetSpent: number;
		acquisitions: number;
		drops: number;
		matchupAcquisitionTotals: PositionStat;
		misc: number;
		moveToActive: number;
		moveToIR: number;
		paid: number;
		teamCharges: number;
		trades: number;
	};
	roster: { entries: [{ playerPoolEntry: { player: PlayerDto } }] };

	constructor(
		abbrev: string,
		id: number,
		location: string,
		nickname: string,
		name: string,
		owners: [string],
		currentProjectedRank: number,
		divisionId: number,
		draftDayProjectedRank: number,
		isActive: boolean,
		valuesByStat: PositionStat,
		waiverRank: number,
		watchList: [string],
		logo: string,
		logoType: string,
		playoffSeed: number,
		points: number,
		pointsAdjusted: number,
		pointsDelta: number,
		primaryOwner: string,
		rankCalculatedFinal: number,
		rankFinal: number,
		record: { [key in keyof typeof RecordEnum]: RecordDto },
		transactionCounter: { [key in keyof typeof TransactionCounterEnum]: any },
		roster: { entries: [{ playerPoolEntry: { player: PlayerDto } }] }
	) {
		this.abbrev = abbrev;
		this.id = id;
		this.location = location;
		this.nickname = nickname;
		this.owners = owners;
		this.name = name;
		this.currentProjectedRank = currentProjectedRank;
		this.divisionId = divisionId;
		this.draftDayProjectedRank = draftDayProjectedRank;
		this.isActive = isActive;
		this.valuesByStat = valuesByStat;
		this.waiverRank = waiverRank;
		this.watchList = watchList;
		this.logo = logo;
		this.logoType = logoType;
		this.playoffSeed = playoffSeed;
		this.points = points;
		this.pointsAdjusted = pointsAdjusted;
		this.pointsDelta = pointsDelta;
		this.primaryOwner = primaryOwner;
		this.rankCalculatedFinal = rankCalculatedFinal;
		this.rankFinal = rankFinal;
		this.record = record;
		this.transactionCounter = transactionCounter;
		this.roster = roster;
	}
}
