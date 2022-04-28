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
	const players = new Players(1);

	it('should be defined', () => {
		expect(players).toBeDefined();
	});

	describe('getPlayerById', () => {
		it('should get simple version of the player', async () => {
			jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { player: { ...player } } });

			expect(await players.getPlayerById(32758)).toMatchSnapshot();
		});

		it('should catch errors and throw them', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce('error');

			await expect(players.getPlayerById(32758)).rejects.toMatchSnapshot();
		});
	});
});
