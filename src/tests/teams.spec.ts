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
	const teams = new Teams(1, cookies, 2024);

	afterEach(() => {
		jest.restoreAllMocks();
	});

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
		it('should get all the teams rosters in one request', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					teams: [
						{ id: 1, name: 'team1 ', roster },
						{ id: 2, name: 'team two', roster },
					],
				},
			});

			expect(await teams.getAllTeamsRoster()).toMatchSnapshot();
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy.mock.calls[0][0].params).toEqual({ view: ['mTeam', 'mRoster'] });
		});

		it('should return blank list because there are no teams', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { teams: [] } });

			expect(await teams.getAllTeamsRoster()).toEqual({});
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getAllTeamsRoster()).rejects.toMatchSnapshot();
		});
	});

	describe('getRostersByTeamId', () => {
		it('should key rosters by team id for a scoring period', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: { teams: [{ id: 3, roster }, { id: 4 }] },
			});

			expect(await teams.getRostersByTeamId(42)).toEqual({ 3: [{ fullName: 'Jose Ramirez' }] });
			expect(spy.mock.calls[0][0].params).toEqual({ view: 'mRoster', scoringPeriodId: 42 });
		});
	});

	describe('getTeamLineup', () => {
		it('should resolve slots, pro team and lock state', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: {
					roster: {
						entries: [
							{
								playerId: 32758,
								lineupSlotId: 16,
								injuryStatus: 'ACTIVE',
								playerPoolEntry: {
									lineupLocked: true,
									player: {
										id: 32758,
										fullName: 'Christian Walker',
										proTeamId: 29,
										eligibleSlots: [1, 19, 12, 16, 17],
									},
								},
							},
						],
					},
				},
			});

			const [player] = await teams.getTeamLineup(1);
			expect(player).toMatchObject({
				playerId: 32758,
				fullName: 'Christian Walker',
				lineupSlotId: 16,
				lineupSlot: 'BE',
				eligibleSlots: ['1B', 'IF', 'UTIL', 'BE', 'IL'],
				proTeam: 'Ari',
				injuryStatus: 'ACTIVE',
				lineupLocked: true,
			});
		});
	});

	describe('updateWatchList', () => {
		it('should post the watch list to the write endpoint', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });

			await teams.updateWatchList(15, [1, 2]);
			const request = spy.mock.calls[0][0];
			expect(request.method).toBe('POST');
			expect(request.url).toBe(
				'https://lm-api-writes.fantasy.espn.com/apis/v3/games/flb/seasons/2024/segments/0/leagues/1/teams/15'
			);
			expect(request.data).toEqual({ watchList: [1, 2] });
		});
	});

	describe('getTeamInfoFromSWID casing', () => {
		it('should match owners regardless of SWID casing', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({
				data: [{ id: 9, owners: [cookies.swid.toLowerCase()] }],
			});

			expect((await teams.getTeamInfoFromSWID())?.id).toBe(9);
		});
	});
});
