import { getPlayerStats, normalizeName, positionName, proTeamAbbrev, slotName } from '../../utils/player-utils';

describe('player utils', () => {
	it('should resolve ids to labels and fall back to the raw id', () => {
		expect(slotName(19)).toBe('IF');
		expect(slotName(21)).toBe('21');
		expect(proTeamAbbrev(10)).toBe('NYY');
		expect(positionName(1)).toBe('SP');
	});

	it('should normalize names', () => {
		expect(normalizeName('  Ronald  Acuña Jr. ')).toBe('ronald acuna jr');
	});

	describe('getPlayerStats', () => {
		const player = {
			stats: [
				{
					seasonId: 2026,
					scoringPeriodId: 0,
					statSourceId: 0,
					statSplitTypeId: 0,
					stats: { '5': 30, '2': 0.281 },
				},
				{ seasonId: 2026, scoringPeriodId: 0, statSourceId: 1, statSplitTypeId: 0, stats: { '5': 35 } },
				{
					seasonId: 2026,
					scoringPeriodId: 0,
					statSourceId: 0,
					statSplitTypeId: 1,
					stats: { '5': 2, '500': 1 },
				},
			],
		} as never;

		it('should default to actual season stats keyed by abbreviation', () => {
			expect(getPlayerStats(player)).toEqual({ HR: 30, AVG: 0.281 });
		});

		it('should select projections and splits, keeping unknown stat ids', () => {
			expect(getPlayerStats(player, { statSourceId: 1 })).toEqual({ HR: 35 });
			expect(getPlayerStats(player, { statSplitTypeId: 1 })).toEqual({ HR: 2, '500': 1 });
			expect(getPlayerStats(player, { seasonId: 2025 })).toBeUndefined();
		});
	});
});
