import axios from 'axios';
import { League } from '../league';
import { ESPNCookiesDto } from '../models/classes/espn-cookies.dto';
import { NotFound } from '../models/errors/not-found';
import { ESPNNotFound } from '../models/errors/espn-request-error';

describe('League', () => {
	const cookies: ESPNCookiesDto = {
		espn_s2: '2B7uOaY7pTx8neDj061z24T3PdDPn6a29EHEMEfelzI6HLT43oy1P%%2BUTkzYAsk%2BkxgrK%',
		swid: '{A11A1111-1AAA-111A-1A11-111AAA111A1A}',
	};
	const league = new League(1, cookies, 2024);

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(league).toBeDefined();
	});

	describe('init', () => {
		it('should get init team data', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					settings: {
						rosterSettings: {
							lineupSlotCounts: {
								'0': 1,
								'1': 1,
								'2': 1,
								'3': 1,
								'4': 1,
								'5': 5,
								'6': 1,
								'7': 1,
								'8': 0,
								'9': 0,
								'10': 0,
								'11': 0,
								'12': 1,
								'13': 0,
								'14': 5,
								'15': 3,
								'16': 4,
								'17': 3,
								'18': 0,
								'19': 0,
							},
						},
						scoringSettings: {
							scoringItems: [
								{
									isReverseItem: false,
									leagueRanking: 0.0,
									leagueTotal: 0.0,
									points: 1.0,
									statId: 20,
								},
								{
									isReverseItem: false,
									leagueRanking: 0.0,
									leagueTotal: 0.0,
									points: 1.0,
									statId: 76,
								},
							],
						},
						tradeSettings: {
							deadlineDate: 123412341234124,
						},
					},
				},
			});

			expect(await league.init()).toMatchSnapshot();
		});

		it('should catch errors and throw by init', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.init()).rejects.toMatchSnapshot();
		});
	});

	describe('teams', () => {
		it('should be defined', () => {
			expect(league.teams()).toBeDefined();
		});
	});

	describe('players', () => {
		it('should be defined', () => {
			expect(league.players()).toBeDefined();
		});
	});

	describe('getLeagueTeams', () => {
		it('should get all league teams', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { teams: { abbrev: 'CDMD' } } });

			expect(await league.getLeagueTeams()).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.getLeagueTeams()).rejects.toMatchSnapshot();
		});
	});

	describe('getLeagueMembers', () => {
		it('should get all league members', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { members: [{ displayName: 'string', id: 12345, isLeagueManager: true }] },
			});

			expect(await league.getLeagueMembers()).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.getLeagueMembers()).rejects.toMatchSnapshot();
		});
	});

	describe('isLeagueManager', () => {
		it('should return true when isLeagueManager is true', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { members: [{ displayName: 'string', id: cookies.swid, isLeagueManager: true }] },
			});

			expect(await league.isLeagueManager()).toBeTruthy();
		});

		it('should return false when isLeagueManager is false', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { members: [{ displayName: 'string', id: 'swid', isLeagueManager: false }] },
			});

			expect(await league.isLeagueManager()).toBeFalsy();
		});

		it('should return false when no members are found', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {},
			});

			await expect(league.isLeagueManager()).rejects.toThrowError(NotFound);
		});
	});

	describe('getWeeklyMatchups', () => {
		it('should get the weekly matchups', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { gameId: 2, status: { currentMatchupPeriod: 1 }, schedule: [{ matchupPeriodId: 1 }] },
			});

			expect(await league.getWeeklyMatchups()).toMatchSnapshot();
		});

		it('should use the current matchup period, not gameId', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					gameId: 2,
					status: { currentMatchupPeriod: 7 },
					schedule: [
						{ id: 1, matchupPeriodId: 2 },
						{ id: 2, matchupPeriodId: 7 },
					],
				},
			});

			expect(await league.getWeeklyMatchups()).toEqual([{ id: 2, matchupPeriodId: 7 }]);
		});

		it('should accept an explicit matchup period', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					status: { currentMatchupPeriod: 7 },
					schedule: [
						{ id: 1, matchupPeriodId: 2 },
						{ id: 2, matchupPeriodId: 7 },
					],
				},
			});

			expect(await league.getWeeklyMatchups(2)).toEqual([{ id: 1, matchupPeriodId: 2 }]);
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.getWeeklyMatchups()).rejects.toMatchSnapshot();
		});
	});

	describe('status getters', () => {
		it('should clamp the scoring period to the final one after the season', async () => {
			const done = new League(1, cookies, 2024);
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					scoringPeriodId: 190,
					status: { currentMatchupPeriod: 25, finalScoringPeriod: 186, previousSeasons: [2022, 2023, 2024] },
				},
			});

			await done.getStatus();
			expect(done.currentScoringPeriod).toBe(186);
			expect(done.currentMatchupPeriod).toBe(25);
			expect(done.previousSeasons).toEqual([2022, 2023]);
		});
	});

	describe('getBoxScores', () => {
		it('should look up the current periods and filter the schedule', async () => {
			const fresh = new League(1, cookies, 2024);
			const spy = jest
				.spyOn(axios, 'request')
				.mockResolvedValueOnce({
					data: { scoringPeriodId: 40, status: { currentMatchupPeriod: 6, finalScoringPeriod: 186 } },
				})
				.mockResolvedValueOnce({ data: { schedule: [{ id: 9, matchupPeriodId: 6 }] } });

			expect(await fresh.getBoxScores()).toEqual([{ id: 9, matchupPeriodId: 6 }]);
			const request = spy.mock.calls[1][0];
			expect(request.params).toEqual({ view: ['mMatchupScore', 'mScoreboard'], scoringPeriodId: 40 });
			expect(JSON.parse((request.headers as Record<string, string>)['x-fantasy-filter'])).toEqual({
				schedule: { filterMatchupPeriodIds: { value: [6] } },
			});
		});
	});

	describe('getStandings', () => {
		it('should order by final rank, then playoff seed', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					teams: [
						{ id: 1, playoffSeed: 2, rankCalculatedFinal: 0 },
						{ id: 2, playoffSeed: 1, rankCalculatedFinal: 0 },
						{ id: 3, playoffSeed: 3, rankCalculatedFinal: 0 },
					],
				},
			});

			expect((await league.getStandings()).map((t) => t.id)).toEqual([2, 1, 3]);
		});
	});

	describe('getRecentActivity', () => {
		it('should normalize adds, drops and trades', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					topics: [
						{
							id: 'a',
							date: 1000,
							messages: [
								{ messageTypeId: 178, targetId: 111, to: 4 },
								{ messageTypeId: 239, targetId: 222, for: 4 },
							],
						},
						{ id: 'b', date: 900, messages: [{ messageTypeId: 244, targetId: 333, from: 1, to: 2 }] },
						{ id: 'c', date: 800, messages: [{ messageTypeId: 999, targetId: 444, to: 3 }] },
					],
				},
			});

			const activity = await league.getRecentActivity({ limit: 10, since: 500 });
			expect(activity).toEqual([
				{
					id: 'a',
					date: 1000,
					actions: [
						{
							action: 'FA_ADD',
							messageTypeId: 178,
							playerId: 111,
							teamId: 4,
							fromTeamId: undefined,
							toTeamId: 4,
						},
						{
							action: 'DROP',
							messageTypeId: 239,
							playerId: 222,
							teamId: 4,
							fromTeamId: undefined,
							toTeamId: undefined,
						},
					],
				},
				{
					id: 'b',
					date: 900,
					actions: [
						{
							action: 'TRADE_PROCESSED',
							messageTypeId: 244,
							playerId: 333,
							teamId: 1,
							fromTeamId: 1,
							toTeamId: 2,
						},
					],
				},
				{
					id: 'c',
					date: 800,
					actions: [
						{
							action: 'UNKNOWN',
							messageTypeId: 999,
							playerId: 444,
							teamId: 3,
							fromTeamId: undefined,
							toTeamId: 3,
						},
					],
				},
			]);

			const request = spy.mock.calls[0][0];
			expect(request.url).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/2024/segments/0/leagues/1/communication/'
			);
			const filter = JSON.parse((request.headers as Record<string, string>)['x-fantasy-filter']);
			expect(filter.topics.limit).toBe(10);
			expect(filter.topics.filterDateRange.value).toBe(500);
		});

		it('should return no activity when the league has no message board', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce(
				new axios.AxiosError('nope', '404', undefined, undefined, {
					status: 404,
					data: { details: [{ type: 'COMMUNICATION_GROUP_NOT_FOUND', message: 'not found' }] },
				} as never)
			);

			expect(await league.getRecentActivity()).toEqual([]);
		});
	});

	describe('getTransactions', () => {
		it('should filter by type for the given scoring period', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { transactions: [{ id: 't1' }] } });

			expect(await league.getTransactions({ scoringPeriodId: 12, types: ['WAIVER'] })).toEqual([{ id: 't1' }]);
			const request = spy.mock.calls[0][0];
			expect(request.params).toEqual({ view: 'mTransactions2', scoringPeriodId: 12 });
			expect(JSON.parse((request.headers as Record<string, string>)['x-fantasy-filter'])).toEqual({
				transactions: { filterType: { value: ['WAIVER'] } },
			});
		});
	});

	describe('getDraft', () => {
		it('should return the draft detail', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { draftDetail: { drafted: true, inProgress: false, picks: [{ playerId: 1 }] } },
			});

			expect(await league.getDraft()).toEqual({ drafted: true, inProgress: false, picks: [{ playerId: 1 }] });
		});
	});

	describe('getProGames', () => {
		it('should map pro teams to their games for a scoring period', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					settings: {
						proTeams: [
							{ id: 0, proGamesByScoringPeriod: { '5': [{ id: 1 }] } },
							{ id: 10, proGamesByScoringPeriod: { '5': [{ id: 2 }, { id: 3 }] } },
							{ id: 2, proGamesByScoringPeriod: { '6': [{ id: 4 }] } },
						],
					},
				},
			});

			expect(await league.getProGames(5)).toEqual({ 10: [{ id: 2 }, { id: 3 }] });
			expect(spy.mock.calls[0][0].url).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/2024'
			);
		});
	});

	describe('errors', () => {
		it('should surface ESPN 404s as ESPNNotFound', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce(
				new axios.AxiosError('nope', '404', undefined, undefined, { status: 404, data: {} } as never)
			);

			await expect(league.getLeagueTeams()).rejects.toBeInstanceOf(ESPNNotFound);
		});
	});
});
