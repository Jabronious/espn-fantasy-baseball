import axios from 'axios';
import { League } from '../league';

describe('League', () => {
	const league = new League(1);

	it('should be defined', () => {
		expect(league).toBeDefined();
	});

	describe('teams', () => {
		it('should be defined', () => {
			expect(league.teams()).toBeDefined();
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
