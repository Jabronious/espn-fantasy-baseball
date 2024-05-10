import { IPlayer } from './i-player';

export interface ITeam {
	abbrev: string;
	id: number;
	location: string;
	nickname: string;
	owners: [string];
	roster: { entries: [{ playerPoolEntry: { player: IPlayer } }] };
}
