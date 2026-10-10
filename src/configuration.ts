import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
	ESPN_BASE_ENDPOINT: str({ default: 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/flb/seasons' }),
	ESPN_WRITE_ENDPOINT: str({ default: 'https://lm-api-writes.fantasy.espn.com/apis/v3/games/flb/seasons' }),
	ESPN_NEWS_ENDPOINT: str({ default: 'https://site.api.espn.com/apis/fantasy/v3/games/flb/news/players' }),
});
