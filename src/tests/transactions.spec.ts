import axios from 'axios';
import { Transactions } from '../transactions';

describe('Transactions', () => {
	const cookies = { espn_s2: 's2', swid: '{A11A1111-1AAA-111A-1A11-111AAA111A1A}' };
	const transactions = new Transactions(1, cookies, 2026);

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const bodyOf = (spy: jest.SpyInstance, call = 0) => spy.mock.calls[call][0].data;

	it('should add a free agent and drop a player in one transaction', async () => {
		const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: { status: 'EXECUTED' } });

		expect(
			await transactions.addFreeAgent({ teamId: 15, playerId: 100, dropPlayerId: 200, scoringPeriodId: 16 })
		).toEqual({ status: 'EXECUTED' });
		expect(spy.mock.calls[0][0].url).toBe(
			'https://lm-api-writes.fantasy.espn.com/apis/v3/games/flb/seasons/2026/segments/0/leagues/1/transactions/'
		);
		expect(bodyOf(spy)).toEqual({
			isLeagueManager: false,
			teamId: 15,
			type: 'FREEAGENT',
			memberId: cookies.swid,
			scoringPeriodId: 16,
			executionType: 'EXECUTE',
			items: [
				{ playerId: 100, type: 'ADD', toTeamId: 15 },
				{ playerId: 200, type: 'DROP', fromTeamId: 15 },
			],
		});
	});

	it('should look up the current scoring period when omitted', async () => {
		const spy = jest
			.spyOn(axios, 'request')
			.mockResolvedValueOnce({ data: { scoringPeriodId: 33 } })
			.mockResolvedValueOnce({ data: {} });

		await transactions.dropPlayer({ teamId: 15, playerId: 200 });
		expect(spy.mock.calls[0][0].params).toEqual({ view: 'mStatus' });
		expect(bodyOf(spy, 1)).toMatchObject({
			type: 'FREEAGENT',
			scoringPeriodId: 33,
			items: [{ playerId: 200, type: 'DROP', fromTeamId: 15 }],
		});
	});

	it('should place a waiver claim with a FAAB bid', async () => {
		const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });

		await transactions.claimWaiver({
			teamId: 3,
			playerId: 100,
			bidAmount: 12,
			scoringPeriodId: 5,
			asLeagueManager: true,
		});
		expect(bodyOf(spy)).toMatchObject({
			type: 'WAIVER',
			isLeagueManager: true,
			bidAmount: 12,
			items: [{ playerId: 100, type: 'ADD', toTeamId: 3 }],
		});
	});

	it('should send lineup moves as a ROSTER transaction', async () => {
		const spy = jest.spyOn(axios, 'request').mockResolvedValueOnce({ data: {} });

		await transactions.setLineup({
			teamId: 3,
			scoringPeriodId: 5,
			moves: [
				{ playerId: 1, fromLineupSlotId: 16, toLineupSlotId: 5 },
				{ playerId: 2, fromLineupSlotId: 5, toLineupSlotId: 16 },
			],
		});
		expect(bodyOf(spy)).toMatchObject({
			type: 'ROSTER',
			items: [
				{ playerId: 1, type: 'LINEUP', fromLineupSlotId: 16, toLineupSlotId: 5 },
				{ playerId: 2, type: 'LINEUP', fromLineupSlotId: 5, toLineupSlotId: 16 },
			],
		});
	});

	it('should reject no-op and empty lineup moves before calling ESPN', async () => {
		const spy = jest.spyOn(axios, 'request');

		await expect(
			transactions.setLineup({ teamId: 3, moves: [{ playerId: 1, fromLineupSlotId: 5, toLineupSlotId: 5 }] })
		).rejects.toThrow('Player 1 is already in slot 5');
		await expect(transactions.setLineup({ teamId: 3, moves: [] })).rejects.toThrow('at least one move');
		expect(spy).not.toHaveBeenCalled();
	});

	it('should require espn_s2', async () => {
		await expect(new Transactions(1).dropPlayer({ teamId: 1, playerId: 1 })).rejects.toThrow(
			'espn_s2 cookie is required'
		);
	});
});
