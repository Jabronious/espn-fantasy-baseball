# ESPN Fantasy Baseball

[![ESPN Fantasy Baseball Actions](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml/badge.svg)](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml)

## Usage

```typescript
import { League } from 'espn-fantasy-baseball'

// Initialize League
const league = new League(<LEAGUE ID>, {'espn_s2': <ESPN_S2 COOKIE>, swid: <SWID COOKIE>})
await league.init()

// Provides access to league based actions within this league
league.teams()

// Provides access to player based actions within this league
league.players()

// Get a list of slightly different league teams info
league.getLeagueTeams()

// Get a list of all league member info
league.getLeagueMembers()

// View all the matchups for that week
league.getWeeklyMatchups()
```

## Resources

Authenticating for private leagues:  
<https://github.com/cwendt94/espn-api/discussions/150>  
Inspired by:  
<https://github.com/cwendt94/espn-api>  
