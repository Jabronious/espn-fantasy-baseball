import axios from 'axios';
import { Teams } from '../teams';
import { ESPNCookiesDto } from '../models/classes/espn-cookies.dto';
import { TeamDto } from '../models/classes/team.dto';
import { PlayerDto } from '../models/classes/player.dto';

const roster = { entries: [{ playerPoolEntry: { player: { fullName: 'Jose Ramirez' } } }] };
describe('Teams', () => {
	const cookies: ESPNCookiesDto = {
		espn_s2: '2B7uOaY7pTx8neDj061z24T3PdDPn6a29EHEMEfelzI6HLT43oy1P%%2BUTkzYAsk%2BkxgrK%',
		swid: '{A11A1111-1AAA-111A-1A11-111AAA111A1A}',
	};
	const teams = new Teams(1, cookies);

	it('should be defined', () => {
		expect(teams).toBeDefined();
	});

	describe('getTeamInfoFromSWID', () => {
		const teamData: Partial<TeamDto>[] = [
			{
				owners: [cookies.swid],
			},
		];
		it('should get team info', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: teamData });

			expect(await teams.getTeamInfoFromSWID()).toMatchSnapshot();
		});

		it('should throw a team not found error', async () => {
			const teamData: Partial<TeamDto>[] = [
				{
					owners: ['12345-12345-1235'],
				},
			];
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: teamData });

			await expect(teams.getTeamInfoFromSWID()).rejects.toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getTeamInfoFromSWID()).rejects.toMatchSnapshot();
		});
	});

	describe('getTeamInfoFromSWID', () => {
		const teamData: Partial<TeamDto>[] = [
			{
				owners: [cookies.swid],
				roster: {
					entries: [] as unknown as [{ playerPoolEntry: { player: PlayerDto } }],
				},
			},
		];
		it('should get team info', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: teamData });

			expect(await teams.getTeamRosterFromSWID()).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getTeamRosterFromSWID()).rejects.toMatchSnapshot();
		});
	});

	describe('getDetailedTeamData', () => {
		it('should get all details for a team', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { abbrev: 'CDMD' } });

			expect(await teams.getDetailedTeamData(1)).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getDetailedTeamData(1)).rejects.toMatchSnapshot();
		});
	});

	describe('getTeamRoster', () => {
		it('should get of a teams roster', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { roster },
			});

			expect(await teams.getTeamRoster(1)).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getTeamRoster(1)).rejects.toMatchSnapshot();
		});
	});

	describe('getAllTeamsRoster', () => {
		it('should get all the teams rosters', async () => {
			jest.spyOn(axios, 'request')
				.mockResolvedValueOnce({
					data: {
						teams: [
							{ id: 1, roster },
							{ id: 2, roster },
						],
					},
				})
				.mockResolvedValueOnce({
					data: {
						teams: [
							{ id: 1, name: 'team1' },
							{ id: 2, name: 'team two' },
						],
					},
				});

			expect(await teams.getAllTeamsRoster()).toMatchSnapshot();
		});

		it('should return blank list because there are no teams', async () => {
			jest.spyOn(axios, 'request')
				.mockResolvedValueOnce({
					data: {
						teams: [
							{ id: 1, roster },
							{ id: 2, roster },
						],
					},
				})
				.mockResolvedValueOnce({
					data: {
						teams: [
							{ id: 3, name: 'team1' },
							{ id: 4, name: 'team two' },
						],
					},
				});

			expect(await teams.getAllTeamsRoster()).toMatchSnapshot();
		});

		it('should catch errors and throw them on leagueRosterData', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getAllTeamsRoster()).rejects.toMatchSnapshot();
		});

		it('should catch errors and throw them on leagueTeamData', async () => {
			jest.spyOn(axios, 'request')
				.mockResolvedValueOnce({
					data: {
						teams: [
							{ id: 1, roster },
							{ id: 2, roster },
						],
					},
				})
				.mockRejectedValueOnce('error');

			await expect(teams.getAllTeamsRoster()).rejects.toMatchSnapshot();
		});
	});
});
