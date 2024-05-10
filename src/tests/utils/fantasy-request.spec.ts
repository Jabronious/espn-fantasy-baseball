import { FantasyRequest } from '../../utils/fantasy-requests';
import axios from 'axios';

describe('FantasyRequest', () => {
	const fRequest = new FantasyRequest(1234, undefined, 1999);

	it('should be defined', () => {
		expect(fRequest).toBeDefined();
	});

	describe('get', () => {
		it('should accept multiple of the same params', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });
			await fRequest.get('', {}, { views: ['1', '2'] });
			expect(spy).toMatchSnapshot();
		});
	});
});
