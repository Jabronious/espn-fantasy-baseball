import { ESPNCookiesDto } from '../models/classes/espn-cookies.dto';
import { env } from '../configuration';
import axios, { AxiosRequestConfig } from 'axios';
import { stringify } from 'querystring';
import { FIRST_MODERN_SEASON } from '../models/constants';
import {
	ESPNAccessDenied,
	ESPNNotFound,
	ESPNRateLimited,
	ESPNRequestError,
	ESPNTransactionRejected,
} from '../models/errors/espn-request-error';

export type RequestHeaders = { [key: string]: string };
export type RequestParams = { [key: string]: unknown | unknown[] };

const stripSeasons = (endpoint: string): string => endpoint.replace(/\/seasons\/?$/, '');

export class FantasyRequest {
	leagueId: number;
	year: number;
	endpoint: string;
	cookies: ESPNCookiesDto | undefined;
	private historical: boolean;

	constructor(leagueId: number, cookies: ESPNCookiesDto | undefined, year: number = new Date().getFullYear()) {
		this.leagueId = leagueId;
		this.cookies = cookies;
		this.year = year;
		// ESPN serves 2018+ from /seasons/{year}/...; older seasons only from /leagueHistory/{id}?seasonId=
		this.historical = year < FIRST_MODERN_SEASON;
		this.endpoint = this.leagueEndpoint(this.historical);
	}

	/** Builds an `x-fantasy-filter` header from a filter object. */
	static filter(filter: object): RequestHeaders {
		return { 'x-fantasy-filter': JSON.stringify(filter) };
	}

	/**
	 * GET against the league endpoint.
	 * @param {string} path: requires that you have "/" at the front of the path
	 * @param headers: required headers for the request being made
	 * @param params: optional values to be made with the request
	 */
	async get<T>(path: string = '', headers: RequestHeaders = {}, params: RequestParams = {}): Promise<T> {
		try {
			return await this.leagueGet<T>(path, headers, params);
		} catch (e) {
			// Some leagues only answer on the other endpoint family (e.g. a 2018 league still
			// archived under leagueHistory). Try it once and stick with it if it works.
			if (!(e instanceof ESPNAccessDenied)) throw e;
			this.historical = !this.historical;
			this.endpoint = this.leagueEndpoint(this.historical);
			try {
				return await this.leagueGet<T>(path, headers, params);
			} catch {
				this.historical = !this.historical;
				this.endpoint = this.leagueEndpoint(this.historical);
				throw e;
			}
		}
	}

	/**
	 * GET against the season (game-wide) endpoint: `/seasons/{year}{path}`. No league needed.
	 * Used for the MLB player universe, pro team schedules and game state.
	 */
	async getSeason<T>(path: string = '', headers: RequestHeaders = {}, params: RequestParams = {}): Promise<T> {
		return this.request<T>({
			url: `${env.ESPN_BASE_ENDPOINT}/${this.year}${path}`,
			method: 'GET',
			params,
			headers,
		});
	}

	/** GET against ESPN's player news feed (site.api.espn.com). */
	async getNews<T>(params: RequestParams = {}): Promise<T> {
		return this.request<T>({ url: env.ESPN_NEWS_ENDPOINT, method: 'GET', params, headers: {} });
	}

	/**
	 * POST a JSON body to the league's write endpoint (lm-api-writes). Requires espn_s2.
	 * @param {string} path: requires that you have "/" at the front of the path
	 * @param data: the JSON body
	 * @param headers: extra headers for the request being made
	 */
	async post<T>(path: string = '', data: unknown = {}, headers: RequestHeaders = {}): Promise<T> {
		return this.request<T>({
			url: `${env.ESPN_WRITE_ENDPOINT}/${this.year}/segments/0/leagues/${this.leagueId}${path}`,
			method: 'POST',
			data,
			headers: { 'Content-Type': 'application/json', ...headers },
		});
	}

	private leagueEndpoint(historical: boolean): string {
		const gameRoot = stripSeasons(env.ESPN_BASE_ENDPOINT);
		return historical
			? `${gameRoot}/leagueHistory/${this.leagueId}`
			: `${gameRoot}/seasons/${this.year}/segments/0/leagues/${this.leagueId}`;
	}

	private async leagueGet<T>(path: string, headers: RequestHeaders, params: RequestParams): Promise<T> {
		const data = await this.request<T | T[]>({
			url: `${this.endpoint}${path}`,
			method: 'GET',
			params: this.historical ? { ...params, seasonId: this.year } : params,
			headers,
		});
		// leagueHistory wraps the league in an array
		return (this.historical && Array.isArray(data) ? data[0] : data) as T;
	}

	private async request<T>(config: AxiosRequestConfig): Promise<T> {
		const cookie = this.cookies ? { Cookie: `espn_s2=${this.cookies.espn_s2}; SWID=${this.cookies.swid};` } : {};
		const request: AxiosRequestConfig = {
			...config,
			paramsSerializer: (params) => stringify(params, '&'),
			headers: { ...config.headers, ...cookie },
		};

		try {
			const response = await axios.request<T>(request);
			return response.data;
		} catch (e) {
			throw toESPNError(e, request.url);
		}
	}
}

type ESPNErrorBody = { messages?: string[]; details?: { message?: string; type?: string }[] };

const toESPNError = (e: unknown, url?: string): Error => {
	if (!axios.isAxiosError(e) || !e.response) {
		return e instanceof Error ? e : new Error(String(e));
	}
	const { status, data } = e.response;
	const body = (data || {}) as ESPNErrorBody;
	const detail = body.details?.[0];
	const code = detail?.type;
	const message = detail?.message || body.messages?.[0] || `ESPN returned an HTTP ${status}`;

	switch (status) {
		case 401:
		case 403:
			return new ESPNAccessDenied(message, status, code, url, data);
		case 404:
			return new ESPNNotFound(message, status, code, url, data);
		case 409:
			return new ESPNTransactionRejected(message, status, code, url, data);
		case 429:
			return new ESPNRateLimited(message, status, code, url, data);
		default:
			return new ESPNRequestError(message, status, code, url, data);
	}
};
