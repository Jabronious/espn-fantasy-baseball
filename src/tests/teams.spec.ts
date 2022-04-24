import axios from 'axios';
import { Teams } from '../teams';

describe('League', () => {
	const teams = new Teams(1);

	it('should be defined', () => {
		expect(teams).toBeDefined();
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
				data: { roster: { entries: [{ playerPoolEntry: { player: { fullName: 'Jose Ramirez' } } }] } },
			});

			expect(await teams.getTeamRoster(1)).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(teams.getTeamRoster(1)).rejects.toMatchSnapshot();
		});
	});
});
