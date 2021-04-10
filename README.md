# espn-fantasy-baseball
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

- \[scoreboard, mMatchup, mRoster, mSettings, mDraftDetail] (Different league pages)  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645?view=mMatchup

- Gets a specific team object  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/{league_id}/teams/{team_id}/

- Gets a list of the current league memebers  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/59645/members

- Gets MLB Team schedules  
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021?view=proTeamSchedules_wl

- Gets MLB players. Headers required 
    ![image](https://user-images.githubusercontent.com/14021591/114256743-1f4e7b00-9981-11eb-8778-a730c0a18d4b.png)     
http://fantasy.espn.com/apis/v3/games/flb/seasons/2021?view=players_wl

# Resources:
Authenticating for private leagues:
https://github.com/cwendt94/espn-api/discussions/150
Inspired by:
https://github.com/cwendt94/espn-api
