import { ILeague } from '../interfaces/i-league';
import { MemberDto } from './member.dto';
import { TeamDto } from './team.dto';

export class LeagueDto implements ILeague {
	gameId: number;
	id: number;
	members: [MemberDto];
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
	teams: [TeamDto];

	constructor(
		gameId: number,
		id: number,
		members: [MemberDto],
		scoringPeriodId: number,
		seasonId: number,
		segmentId: number,
		settings: { name: string },
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
