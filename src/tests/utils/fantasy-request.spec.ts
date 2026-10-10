import { FantasyRequest } from '../../utils/fantasy-requests';
import axios from 'axios';
import {
	ESPNAccessDenied,
	ESPNRateLimited,
	ESPNRequestError,
	ESPNTransactionRejected,
} from '../../models/errors/espn-request-error';

const httpError = (status: number, data: unknown = {}) =>
	new axios.AxiosError(`HTTP ${status}`, String(status), undefined, undefined, { status, data } as never);

const rejection = (promise: Promise<unknown>): Promise<ESPNRequestError> =>
	promise.then(
		() => {
			throw new Error('expected the request to fail');
		},
		(e: ESPNRequestError) => e
	);

describe('FantasyRequest', () => {
	const cookies = { espn_s2: 's2', swid: '{A11A1111-1AAA-111A-1A11-111AAA111A1A}' };
	const fRequest = new FantasyRequest(1234, undefined, 1999);

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(fRequest).toBeDefined();
	});

	describe('endpoints', () => {
		it('should use the seasons endpoint for 2018 and later', () => {
			expect(new FantasyRequest(1, undefined, 2018).endpoint).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/2018/segments/0/leagues/1'
			);
		});

		it('should use leagueHistory before 2018', () => {
			expect(new FantasyRequest(1, undefined, 2017).endpoint).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/leagueHistory/1'
			);
		});
	});

	describe('get', () => {
		it('should accept multiple of the same params', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });
			await fRequest.get('', {}, { views: ['1', '2'] });
			expect(spy).toMatchSnapshot();
		});

		it('should pass seasonId as a param and unwrap the leagueHistory array', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: [{ id: 1234, seasonId: 2016 }] });
			const history = new FantasyRequest(1234, undefined, 2016);

			expect(await history.get('/communication/', {}, { view: 'mTeam' })).toEqual({ id: 1234, seasonId: 2016 });
			const request = spy.mock.calls[0][0];
			expect(request.url).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/leagueHistory/1234/communication/'
			);
			expect(request.params).toEqual({ view: 'mTeam', seasonId: 2016 });
		});

		it('should send espn_s2 and an upper-case SWID cookie', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });
			await new FantasyRequest(1, cookies, 2024).get();
			expect((spy.mock.calls[0][0].headers as Record<string, string>).Cookie).toBe(
				`espn_s2=s2; SWID=${cookies.swid};`
			);
		});

		it('should fall back to the other endpoint family on a 401', async () => {
			const spy = jest
				.spyOn(axios, 'request')
				.mockRejectedValueOnce(httpError(401))
				.mockResolvedValueOnce({ data: [{ id: 5 }] });
			const request = new FantasyRequest(5, cookies, 2018);

			expect(await request.get()).toEqual({ id: 5 });
			expect(spy.mock.calls[1][0].url).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/leagueHistory/5'
			);
			expect(request.endpoint).toBe('https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/leagueHistory/5');
		});

		it('should throw the original access error when the fallback also fails', async () => {
			jest.spyOn(axios, 'request')
				.mockRejectedValueOnce(
					httpError(401, { details: [{ type: 'AUTH_LEAGUE_NOT_VISIBLE', message: 'private' }] })
				)
				.mockRejectedValueOnce(httpError(404));
			const request = new FantasyRequest(5, undefined, 2024);

			const error = await rejection(request.get());
			expect(error).toBeInstanceOf(ESPNAccessDenied);
			expect(error.code).toBe('AUTH_LEAGUE_NOT_VISIBLE');
			expect(error.message).toBe('private');
			expect(request.endpoint).toBe(
				'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/2024/segments/0/leagues/5'
			);
		});

		it('should map 429 and other statuses to typed errors', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce(httpError(429)).mockRejectedValueOnce(httpError(500));
			const request = new FantasyRequest(5, undefined, 2024);

			await expect(request.get()).rejects.toBeInstanceOf(ESPNRateLimited);
			const error = await rejection(request.get());
			expect(error).toBeInstanceOf(ESPNRequestError);
			expect(error.status).toBe(500);
			expect(error.message).toBe('ESPN returned an HTTP 500');
		});
	});

	describe('filter', () => {
		it('should serialize an x-fantasy-filter header', () => {
			expect(FantasyRequest.filter({ players: { limit: 1 } })).toEqual({
				'x-fantasy-filter': '{"players":{"limit":1}}',
			});
		});
	});

	describe('post', () => {
		it('should send a JSON body to the write host', async () => {
			const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { status: 'EXECUTED' } });

			expect(await new FantasyRequest(7, cookies, 2026).post('/transactions/', { a: 1 })).toEqual({
				status: 'EXECUTED',
			});
			const request = spy.mock.calls[0][0];
			expect(request.method).toBe('POST');
			expect(request.url).toBe(
				'https://lm-api-writes.fantasy.espn.com/apis/v3/games/flb/seasons/2026/segments/0/leagues/7/transactions/'
			);
			expect(request.data).toEqual({ a: 1 });
			expect((request.headers as Record<string, string>)['Content-Type']).toBe('application/json');
		});

		it('should surface 409s with the ESPN code', async () => {
			jest.spyOn(axios, 'request').mockRejectedValueOnce(
				httpError(409, {
					details: [
						{ type: 'TRAN_LINEUP_LOCKED', message: 'Lineup transaction could not be completed, is locked' },
					],
				})
			);

			const error = await rejection(new FantasyRequest(7, cookies, 2026).post('/transactions/', {}));
			expect(error).toBeInstanceOf(ESPNTransactionRejected);
			expect(error.code).toBe('TRAN_LINEUP_LOCKED');
		});
	});
});
