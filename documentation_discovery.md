# espn-fantasy-baseball: endpoint discovery notes

[![ESPN Fantasy Baseball Actions](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml/badge.svg)](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml)

ESPN's fantasy API is undocumented. Everything here was found by watching fantasy.espn.com in browser
devtools or cross-checked against other open-source clients:
[cwendt94/espn-api](https://github.com/cwendt94/espn-api) (Python, all sports),
[espn-fantasy-football-api](https://www.npmjs.com/package/espn-fantasy-football-api) and
[fantasy-hockey-notifier-cdk](https://www.npmjs.com/package/fantasy-hockey-notifier-cdk).
Entries marked **(unverified)** have not been confirmed against a live baseball league yet.

## Hosts

| Purpose | Base URL |
| --- | --- |
| League reads (2018+) | `https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/{year}/segments/0/leagues/{leagueId}` |
| League reads (2017 and earlier) | `https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/leagueHistory/{leagueId}?seasonId={year}` (returns an **array**) |
| Season-wide reads (no league) | `https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons/{year}` |
| Writes | `https://lm-api-writes.fantasy.espn.com/apis/v3/games/flb/seasons/{year}/segments/0/leagues/{leagueId}` |
| Player news | `https://site.api.espn.com/apis/fantasy/v3/games/flb/news/players?playerId={id}` |

`fantasy.espn.com/apis/v3/...` is the old read host; ESPN moved reads to `lm-api-reads` in 2024.
Other sports use the same paths with `ffl` (football), `fba` (basketball), `fhl` (hockey) or `wfba` (WNBA).

## Authentication

Private leagues need the `espn_s2` and `SWID` cookies from a logged-in browser session:

```
Cookie: espn_s2={ESPN_S2}; SWID={SWID}
```

The cookie name is upper-case `SWID`. The SWID value is a braced GUID (`{XXXXXXXX-XXXX-...}`); ESPN is not
consistent about its letter case between cookies and payloads, so compare case-insensitively.
Username/password login (`registerdisney.go.com/jgc/v5/client/ESPN-FANTASYLM-PROD/...`) is behind reCAPTCHA
and not usable from a script.

## Query parameters

- `view` selects what the league response includes. Repeat it to combine views in one request:
  `?view=mTeam&view=mRoster`.
- `scoringPeriodId` selects a day. Baseball scoring periods are days; matchup periods are weeks.
- `rosterForTeamId` limits roster data to one team **(unverified for flb)**.

## League views

| View | Returns | Wrapper |
| --- | --- | --- |
| `mSettings` | League settings: name, roster slots, scoring items, trade deadline, schedule settings | `League.init()` |
| `mStatus` | `status.currentMatchupPeriod`, `first/final/latestScoringPeriod`, `previousSeasons`, waiver timing; top-level `scoringPeriodId` | `League.getStatus()` |
| `mTeam` | Teams (records, owners, waiver rank, transaction counters) and members | `League.getLeagueTeams()`, `Teams.*` |
| `mRoster` | `teams[].roster.entries[]` with `lineupSlotId` and `playerPoolEntry` | `Teams.getTeamRoster()`, `getTeamLineup()` |
| `mStandings` | Standings fields on teams (`playoffSeed`, `rankCalculatedFinal`, `record`) | `League.getStandings()` |
| `mMatchup` | Full season `schedule[]` with category results (`cumulativeScore.scoreByStat`) | `League.getWeeklyMatchups()` |
| `mMatchupScore` + `mScoreboard` | Box scores: `home/away.rosterForCurrentScoringPeriod` with per-player stats for the day | `League.getBoxScores()` |
| `mLiveScoring` | Live score updates **(unverified)** | |
| `mBoxscore` | Box score detail **(unverified)** | |
| `mTransactions2` | Transactions for a scoring period, filterable by type | `League.getTransactions()` |
| `mPendingTransactions` | Pending trades and waiver claims **(unverified response shape)** | `League.getPendingTransactions()` |
| `mDraftDetail` | `draftDetail.picks[]`, `drafted`, `inProgress` | `League.getDraft()` |
| `mNav` | Members with `isLeagueCreator` / `isLeagueManager` **(unverified for flb)** | |
| `kona_player_info` | League-aware player pool (`onTeamId`, `status`, lock flags) | `Players.getPlayerPool()`, `getFreeAgents()`, `getPlayersByIds()` |
| `kona_playercard` | Player card: season, last 7/15/30 splits, projections | `Players.getPlayerCards()`, `getPlayerById(id, true)` |
| `kona_league_communication` | Activity feed; request `/communication/` | `League.getRecentActivity()` |

## Season-wide views

| Request | Returns | Wrapper |
| --- | --- | --- |
| `/seasons/{year}?view=proTeamSchedules_wl` | `settings.proTeams[].proGamesByScoringPeriod` (every MLB game) | `League.getProTeamSchedules()`, `getProGames()` |
| `/seasons/{year}/players?view=players_wl&scoringPeriodId=0` + `filterActive` | Every active MLB player | `Players.getAllPlayers()`, `searchPlayers()` |
| `/seasons/{year}?view=kona_game_state` | Current season state **(unverified)** | |

## The `x-fantasy-filter` header

A JSON header that filters and paginates. Build it with `FantasyRequest.filter({...})`.

Player pool (`kona_player_info`):

```json
{
  "players": {
    "filterStatus": { "value": ["FREEAGENT", "WAIVERS"] },
    "filterSlotIds": { "value": [4] },
    "filterIds": { "value": [32758] },
    "limit": 50,
    "offset": 0,
    "sortPercOwned": { "sortPriority": 1, "sortAsc": false },
    "sortDraftRanks": { "sortPriority": 100, "sortAsc": true, "value": "STANDARD" }
  }
}
```

Player card stats (`kona_playercard`): `additionalValue` entries are `<split><source><year>`. For example,
`002026` is 2026 season actuals, `102026` 2026 season projections and `012026` 2026 last 7 days.

```json
{
  "players": {
    "filterIds": { "value": [32758] },
    "filterStatsForTopScoringPeriodIds": { "value": 0, "additionalValue": ["002026", "102026", "012026"] }
  }
}
```

Schedule (`mMatchupScore`/`mScoreboard`): `{"schedule":{"filterMatchupPeriodIds":{"value":[6]}}}`

Transactions (`mTransactions2`): `{"transactions":{"filterType":{"value":["WAIVER","WAIVER_ERROR"]}}}`

Activity feed (`/communication/?view=kona_league_communication`):

```json
{
  "topics": {
    "filterType": { "value": ["ACTIVITY_TRANSACTIONS"] },
    "limit": 25,
    "limitPerMessageSet": { "value": 25 },
    "offset": 0,
    "sortMessageDate": { "sortPriority": 1, "sortAsc": false },
    "sortFor": { "sortPriority": 2, "sortAsc": false },
    "filterIncludeMessageTypeIds": { "value": [178, 179, 180, 181, 239, 244] },
    "filterDateRange": { "value": 1760000000000, "additionalValue": 1760100000000 }
  }
}
```

## Activity message types

| `messageTypeId` | Meaning | Acting team field |
| --- | --- | --- |
| 178 | Added from free agency | `to` |
| 180 | Added from waivers | `to` |
| 179, 181 | Dropped | `to` |
| 239 | Dropped | `for` |
| 224 / 225 | Trade accepted / accompanying drop | `from` |
| 226 | Draft pick trade accepted | `from` |
| 241 / 242 / 243 | Trade vetoed by LM / drop / draft pick trade vetoed | `from` |
| 244 / 245 | Trade processed / accompanying drop | `from` |
| 246 | Draft pick trade processed | `from` |

`targetId` is the player id. Trade ids come from the hockey notifier; ESPN appears to share them across sports.

## Writes

`POST {write host}/transactions/` with `Content-Type: application/json`. `espn_s2` alone authorizes it.
There is no dry-run mode: `executionType` other than `EXECUTE` returns an untyped 400.

```json
{
  "isLeagueManager": false,
  "teamId": 15,
  "type": "FREEAGENT",
  "memberId": "{SWID}",
  "scoringPeriodId": 16,
  "executionType": "EXECUTE",
  "items": [
    { "playerId": 32758, "type": "ADD", "toTeamId": 15 },
    { "playerId": 30862, "type": "DROP", "fromTeamId": 15 }
  ]
}
```

| `type` | Items | Wrapper |
| --- | --- | --- |
| `FREEAGENT` | `ADD` (`toTeamId`) and/or `DROP` (`fromTeamId`) | `Transactions.addFreeAgent()`, `dropPlayer()` |
| `WAIVER` | Same as FREEAGENT, plus top-level `bidAmount` for FAAB | `Transactions.claimWaiver()` |
| `ROSTER` | `LINEUP` with `fromLineupSlotId` / `toLineupSlotId`; only players whose slot changes | `Transactions.setLineup()` |
| `FUTURE_ROSTER` | Lineup for a future scoring period **(unverified)** | |
| `TRADE_PROPOSAL`, `TRADE_ACCEPT`, `TRADE_DECLINE`, `TRADE_VETO`, `TRADE_UPHOLD` | Trade flow **(unverified payloads; capture from devtools before implementing)** | |

Watch list: `POST {write host}/teams/{teamId}` with `{"watchList": [31094, 30862]}`. Wrapped as
`Teams.updateWatchList()`. **(Moved to the write host; the original capture was on fantasy.espn.com.)**

Known write errors (from football captures):

| Status | Code | Meaning |
| --- | --- | --- |
| 409 | `TRAN_LINEUP_LOCKED` | A player's game has started; check `playerPoolEntry.lineupLocked` first |
| 409 | `TRAN_ROSTER_SAME_SLOT` | An item has `from == to`; the whole transaction fails |
| 409 | `TRAN_INVALID_SCORINGPERIOD_NOT_CURRENT` | Writes only target the current scoring period |
| 401 | `AUTH_MISSING_CREDENTIALS` | No or expired `espn_s2` |
| 405 | `HTTP_METHOD_NOT_SUPPORTED` | GET against the write endpoint |

## Edge cases the wrapper handles

- **Historical seasons.** 2017 and earlier use `leagueHistory` and wrap the league in an array. Some leagues
  answer only on the other endpoint family, so a 401 retries once against the alternate base URL.
- **Private league or expired cookies.** 401/403 throws `ESPNAccessDenied` with ESPN's code (for example
  `AUTH_LEAGUE_NOT_VISIBLE`). 404 throws `ESPNNotFound`, 409 `ESPNTransactionRejected`, 429 `ESPNRateLimited`.
- **No message board.** `/communication/` 404s with `COMMUNICATION_GROUP_NOT_FOUND` for leagues without one
  (and many past seasons); `getRecentActivity()` returns `[]`.
- **After the season.** `scoringPeriodId` keeps counting past `finalScoringPeriod`; `currentScoringPeriod` clamps it.
- **Current matchup.** `gameId` is the sport id (2 = baseball), not the week. Use `status.currentMatchupPeriod`.
- **Trade items.** `mTransactions2` leaves `items` empty on `TRADE_ACCEPT` rows for trades the authenticated
  user was not in. Use the activity feed for trade details.
- **Doubleheaders.** `proGamesByScoringPeriod[day]` can hold two games.
- **Duplicate names.** Two MLB players are named Will Smith; `searchPlayers()` returns every match and ignores
  accents (`acuna` finds Acuña).
- **Two numbering schemes for positions.** `defaultPositionId` (1 = SP, 2 = C, ...) differs from
  `lineupSlotId`/`eligibleSlots` (0 = C, 16 = BE, 17 = IL). Slots 18, 21 and 22 appear but are unidentified.

## Capturing more traffic

1. Log in to fantasy.espn.com and open devtools, Network tab, filter `lm-api`.
2. Do the action (open a page, make a move). Note the `view` params, the `x-fantasy-filter` request header and,
   for writes, the JSON request body and response.
3. Right-click a request, choose "Copy as cURL", and remove the `Cookie` header before sharing it anywhere.

Worth capturing next: trade proposal/accept/decline bodies, `FUTURE_ROSTER`, `mLiveScoring`, `kona_game_state`,
and the `mPendingTransactions` response shape.
