import axios from 'axios';
import { Players } from '../players';

const player = {
	defaultPositionId: 3,
	droppable: true,
	eligibleSlots: [1, 7, 19, 12, 16, 17],
	firstName: 'Christian',
	fullName: 'Christian Walker',
	id: 32758,
	lastName: 'Walker',
	ownership: {
		percentOwned: 4.399557277255119,
	},
	proTeamId: 29,
	universeId: 2,
};
describe('Players', () => {
	const players = new Players(1, undefined, 2024);

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(players).toBeDefined();
	});

	const filterOf = (spy: jest.SpyInstance) =>
		JSON.parse((spy.mock.calls[0][0].headers as Record<string, string>)['x-fantasy-filter']);

	describe('getPlayerById', () => {
		it('should get simple version of the player', async () => {
			const spy = jest
				.spyOn(axios, 'request')
				.mockResolvedValueOnce({ data: { players: [{ id: 32758, onTeamId: 0, player: { ...player } }] } });

			expect(await players.getPlayerById(32758)).toMatchSnapshot();
			expect(spy.mock.calls[0][0].params).toEqual({ view: 'kona_player_info' });
			expect(filterOf(spy)).toEqual({ players: { filterIds: { value: [32758] } } });
		});

		it('should use the player card when detailed', async () => {
			const spy = jest
				.spyOn(axios, 'request')
				.mockResolvedValueOnce({ data: { players: [{ id: 32758, player: { ...player } }] } });

			await players.getPlayerById(32758, true);
			expect(spy.mock.calls[0][0].params).toEqual({ view: 'kona_playercard' });
			expect(filterOf(spy).players.filterStatsForTopScoringPeriodIds.additionalValue).toEqual([
				'002024',
				'102024',
				'012024',
				'022024',
				'032024',
			]);
		});

		it('should throw NotFound when ESPN returns no player', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { players: [] } });

			await expect(players.getPlayerById(1)).rejects.toThrow('Player 1 was not found');
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(players.getPlayerById(32758)).rejects.toMatchSnapshot();
		});
	});

	describe('getFreeAgents', () => {
		it('should filter free agents by position', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { players: [] } });

			await players.getFreeAgents({ position: 'ss', limit: 10, scoringPeriodId: 30 });
			expect(spy.mock.calls[0][0].params).toEqual({ view: 'kona_player_info', scoringPeriodId: 30 });
			expect(filterOf(spy)).toEqual({
				players: {
					filterStatus: { value: ['FREEAGENT', 'WAIVERS'] },
					limit: 10,
					offset: 0,
					filterSlotIds: { value: [4] },
					sortPercOwned: { sortPriority: 1, sortAsc: false },
				},
			});
		});

		it('should reject unknown positions before calling ESPN', async () => {
			const spy = jest.spyOn(axios, 'request');

			await expect(players.getFreeAgents({ position: 'QB' })).rejects.toThrow('Unknown position: QB');
			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe('searchPlayers', () => {
		it('should match accents, case and duplicate names', async () => {
			const fresh = new Players(1, undefined, 2024);
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: [
					{ id: 1, fullName: 'Ronald Acuña Jr.' },
					{ id: 2, fullName: 'Will Smith' },
					{ id: 3, fullName: 'Will Smith' },
					{ id: 4, fullName: 'Will Benson' },
				],
			});

			expect((await fresh.searchPlayers('will smith')).map((p) => p.id)).toEqual([2, 3]);
			expect((await fresh.searchPlayers('acuna')).map((p) => p.id)).toEqual([1]);
			expect(await fresh.searchPlayers('  ')).toEqual([]);
			// the player universe is cached
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].url).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/2024/players'
			);
		});
	});

	describe('getPlayerNews', () => {
		it('should unwrap the news feed', async () => {
			const spy = jest
				.spyOn(axios, 'request')
				.mockResolvedValueOnce({ data: { news: { feed: [{ headline: 'Walker homers' }] } } });

			expect(await players.getPlayerNews(32758)).toEqual([{ headline: 'Walker homers' }]);
			expect(spy.mock.calls[0][0].url).toBe('https://site.api.espn.com/apis/fantasy/v3/games/flb/news/players');
			expect(spy.mock.calls[0][0].params).toEqual({ playerId: 32758, limit: 10 });
		});
	});
});
