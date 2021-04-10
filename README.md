# espn-fantasy-baseball
A node wrapper that encompasses the ESPN Fantasy Baseball API

# Current Discovered Endpoints:
General
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/

Leagues
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/{league_id}/

\[scoreboard, mMatchup, mRoster, mSettings ]
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645?view=mMatchup
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/{league_id}/teams/{team_id}/
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/members


http://fantasy.espn.com/apis/v3/games/flb/seasons/2021?view=proTeamSchedules_wl

# Resources:
Authenticating for private leagues:
https://github.com/cwendt94/espn-api/discussions/150
Inspired by:
https://github.com/cwendt94/espn-api