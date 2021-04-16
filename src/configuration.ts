import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
	ESPN_BASE_ENDPOINT: str({ default: 'https://fantasy.espn.com/apis/v3/games/flb/seasons' }),
});
