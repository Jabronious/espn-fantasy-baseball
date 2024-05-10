import { ESPNCookiesDto } from '../models/classes/espn-cookies.dto';
import { env } from '../configuration';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { stringify } from 'querystring';

export class FantasyRequest {
	endpoint: string;
	cookies: ESPNCookiesDto | undefined;
	constructor(leagueId: number, cookies: ESPNCookiesDto | undefined, year: number = new Date().getFullYear()) {
		this.cookies = cookies;
		this.endpoint =
			year === new Date().getFullYear()
				? `${env.ESPN_BASE_ENDPOINT}/${year}/segments/0/leagues/${leagueId}`
				: `${env.ESPN_BASE_ENDPOINT}/leagueHistory/${leagueId}?seasonId=${year}`;
	}

	/**
	 * @param {string} path: requires that you have "/" at the front of the path
	 * @param headers: required headers for the request being made
	 * @param params: optional values to be made with the request
	 */
	async get<T>(
		path: string = '',
		headers: { [key: string]: unknown } = {},
		params: { [key: string]: unknown | unknown[] } = {}
	): Promise<T> {
		const setCookies = this.cookies
			? { Cookie: `espn_s2=${this.cookies.espn_s2}; swid=${this.cookies.swid};` }
			: {};

		const request: AxiosRequestConfig = {
			url: `${this.endpoint}${path}`,
			method: 'GET',
			params,
			paramsSerializer: (params) => stringify(params, '&'),
			headers: { ...headers, ...setCookies },
		};

		const response = await axios.request<T>(request);
		return response.data;
	}

	/**
	 * @param {string} path: requires that you have "/" at the front of the path
	 * @param headers: required headers for the request being made
	 * @param params: optional values to be made with the request
	 */
	async post(
		path: string = '',
		headers: { [key: string]: unknown } = {},
		params: { [key: string]: unknown } = {}
	): Promise<AxiosResponse> {
		const setCookies = !this.cookies
			? {}
			: { Cookie: `espn_s2=${this.cookies?.espn_s2}; swid=${this.cookies?.swid};` };

		const request: AxiosRequestConfig = {
			url: `${this.endpoint}${path}`,
			method: 'POST',
			params,
			headers: { ...headers, ...setCookies },
		};

		const response = await axios.request(request);
		return response;
	}
}
