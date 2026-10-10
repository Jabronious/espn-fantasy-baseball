/**
 * Raised when ESPN answers with a non-2xx status. `code` carries ESPN's own error
 * code when the body has one (e.g. TRAN_LINEUP_LOCKED, AUTH_MISSING_CREDENTIALS).
 */
export class ESPNRequestError extends Error {
	status?: number;
	code?: string;
	url?: string;
	data?: unknown;

	constructor(message: string, status?: number, code?: string, url?: string, data?: unknown) {
		super(message);
		this.name = 'ESPNRequestError';
		this.status = status;
		this.code = code;
		this.url = url;
		this.data = data;
	}
}

/** 401/403: the league is private and espn_s2/SWID are missing, wrong or expired. */
export class ESPNAccessDenied extends ESPNRequestError {
	constructor(message: string, status?: number, code?: string, url?: string, data?: unknown) {
		super(message, status, code, url, data);
		this.name = 'ESPNAccessDenied';
	}
}

/** 404: the league (or resource) does not exist for that season. */
export class ESPNNotFound extends ESPNRequestError {
	constructor(message: string, status?: number, code?: string, url?: string, data?: unknown) {
		super(message, status, code, url, data);
		this.name = 'ESPNNotFound';
	}
}

/** 429: ESPN is throttling this client. */
export class ESPNRateLimited extends ESPNRequestError {
	constructor(message: string, status?: number, code?: string, url?: string, data?: unknown) {
		super(message, status, code, url, data);
		this.name = 'ESPNRateLimited';
	}
}

/** 409 from the write endpoint, e.g. TRAN_LINEUP_LOCKED or TRAN_ROSTER_SAME_SLOT. */
export class ESPNTransactionRejected extends ESPNRequestError {
	constructor(message: string, status?: number, code?: string, url?: string, data?: unknown) {
		super(message, status, code, url, data);
		this.name = 'ESPNTransactionRejected';
	}
}
