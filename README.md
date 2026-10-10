# ESPN Fantasy Baseball

[![ESPN Fantasy Baseball Actions](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml/badge.svg)](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml)

## Usage

```typescript
import { League, getPlayerStats } from 'espn-fantasy-baseball';

// Cookies are required for private leagues and for any roster move.
// The third argument is the season; it defaults to the current calendar year.
const league = new League(<LEAGUE ID>, { espn_s2: <ESPN_S2 COOKIE>, swid: <SWID COOKIE> }, 2026);
await league.init();

league.currentMatchupPeriod; // week in progress
league.currentScoringPeriod; // day in progress (clamped after the season ends)
league.previousSeasons; // open one with new League(id, cookies, season)

// League
await league.getStandings();
await league.getWeeklyMatchups(); // or getWeeklyMatchups(matchupPeriodId)
await league.getBoxScores(); // per-player lineups and stats for a day
await league.getRecentActivity({ since: lastPoll }); // adds, drops, trades
await league.getTransactions({ types: ['WAIVER', 'WAIVER_ERROR'] });
await league.getPendingTransactions();
await league.getDraft();
await league.getProGames(league.currentScoringPeriod); // MLB games today, keyed by proTeamId

// Teams
const teams = league.teams();
await teams.getTeamLineup(teamId); // slots, eligibility, MLB team, injury and lock state
await teams.getRostersByTeamId();
await teams.getTeamInfoFromSWID();

// Players
const players = league.players();
await players.getFreeAgents({ position: 'SS', limit: 25 });
await players.searchPlayers('acuna');
const [card] = await players.getPlayerCards([playerId]);
getPlayerStats(card.player, { statSplitTypeId: 1 }); // last 7 days, e.g. { HR: 2, AVG: 0.333 }
await players.getPlayerNews(playerId);

// Roster moves. These change your real team.
const tx = league.transactions();
await tx.addFreeAgent({ teamId, playerId, dropPlayerId });
await tx.claimWaiver({ teamId, playerId, dropPlayerId, bidAmount: 5 });
await tx.setLineup({ teamId, moves: [{ playerId, fromLineupSlotId: 16, toLineupSlotId: 5 }] });
```

Failed requests throw typed errors: `ESPNAccessDenied` (private league or expired cookies), `ESPNNotFound`,
`ESPNRateLimited` and `ESPNTransactionRejected`. Each carries `status` and ESPN's error `code`, for example
`TRAN_LINEUP_LOCKED`.

Lookup tables for ESPN's numeric ids are exported as `LINEUP_SLOTS`, `DEFAULT_POSITIONS`, `PRO_TEAMS`, `STATS`
and `ACTIVITY_MESSAGE_TYPES`. See [documentation_discovery.md](documentation_discovery.md) for every known
endpoint, filter and edge case.

## Resources

Authenticating for private leagues:  
<https://github.com/cwendt94/espn-api/discussions/150>  
Inspired by:  
<https://github.com/cwendt94/espn-api>  
