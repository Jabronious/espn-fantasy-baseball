# espn-fantasy-baseball
[![ESPN Fantasy Baseball Actions](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml/badge.svg)](https://github.com/Jabronious/espn-fantasy-baseball/actions/workflows/espn-fb-actions.yml)  
A node wrapper that encompasses the ESPN Fantasy Baseball API

# Current Discovered Endpoints:
- Retreive API Key (v6 is used in prod. However, login api requires reCapthca it looks like)  
https://registerdisney.go.com/jgc/v5/client/ESPN-FANTASYLM-PROD/api-key?langPref=en-US

- Authenticate w/ API Key (Requires header `APIKEY {API_KEY}` and Content-Type: application/json) (v6 is used in prod. However, login api requires reCapthca it looks like)  
https://registerdisney.go.com/jgc/v5/client/ESPN-FANTASYLM-PROD/guest/login?langPref=en-US

- General
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/

- Gets league by the league's id  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/{league_id}/

- \[scoreboard (probably dont need), mMatchup, mRoster, mSettings, mDraftDetail, mTeam] (Different league pages)  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645?view=mMatchup

- Gets a specific team object  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/{league_id}/teams/{team_id}/  
https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/teams/15?view=scoreboard  
https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/teams/15?view=mRoster  
https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/teams/15?view=mTeam  

- Gets a list of the current league memebers  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/members

- Gets MLB Team schedules  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021?view=proTeamSchedules_wl

- Gets MLB players. Headers required  
    ![image](https://user-images.githubusercontent.com/14021591/114256743-1f4e7b00-9981-11eb-8778-a730c0a18d4b.png)     
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021?view=players_wl

- POST Pick up player from waiver wire: 
https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/transactions/  
Example Body:  
``` 
{
    "executionType": "EXECUTE",
    "isLeagueManager": false,
    "items": [
        {
            "playerId": 32758,
            "type": "ADD",
            "toTeamId": 15
        }
    ],
    "scoringPeriodId": 16,
    "teamId": 15,
    "type": "FREEAGENT"
}  
```  
- POST add/remove players from watch list  
https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/teams/15  
```
{
    "watchList": [31094, 30862, 39807, 32758]
}
```

# Resources:
Authenticating for private leagues:  
https://github.com/cwendt94/espn-api/discussions/150  
Inspired by:  
https://github.com/cwendt94/espn-api  
