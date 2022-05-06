import axios from 'axios';
import { League } from '../league';

describe('League', () => {
	const league = new League(1);

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
				data: { members: { displayName: 'string', id: 12345, isLeagueManager: true } },
			});

			expect(await league.getLeagueMembers()).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.getLeagueMembers()).rejects.toMatchSnapshot();
		});
	});

	describe('getWeeklyMatchups', () => {
		it('should get the weekly matchups', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { gameId: 1, schedule: [{ matchupPeriodId: 1 }] },
			});

			expect(await league.getWeeklyMatchups()).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(league.getWeeklyMatchups()).rejects.toMatchSnapshot();
		});
	});
});
