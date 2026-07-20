import { env } from '@/lib/env';

type RequestConfig = {
	headers?: Record<string, string>;
	params?: Record<string, unknown>;
	responseType?: 'json' | 'blob' | 'text';
};

type ApiResponse<T> = {
	data: T;
};

async function request<T>(
	method: string,
	endpoint: string,
	body?: unknown,
	config?: RequestConfig
): Promise<ApiResponse<T>> {
	const url = new URL(endpoint, env.backendApiUrl);

	if (config?.params) {
		Object.entries(config.params).forEach(([key, value]) => {
			if (value === undefined || value === null) return;
			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (item !== undefined && item !== null) {
						url.searchParams.append(key, String(item));
					}
				});
				return;
			}
			url.searchParams.set(key, String(value));
		});
	}

	const response = await fetch(url.toString(), {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(config?.headers ?? {}),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
		cache: 'no-store',
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `HTTP ${response.status}`);
	}

	if (response.status === 204) {
		return { data: undefined as T };
	}

	const responseType = config?.responseType ?? 'json';
	const data =
		responseType === 'blob'
			? ((await response.blob()) as T)
			: responseType === 'text'
				? ((await response.text()) as T)
				: ((await response.json()) as T);
	return { data };
}

export const apiClient = {
	get: <T>(endpoint: string, config?: RequestConfig) =>
		request<T>('GET', endpoint, undefined, config),
	post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
		request<T>('POST', endpoint, body, config),
	patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
		request<T>('PATCH', endpoint, body, config),
	put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
		request<T>('PUT', endpoint, body, config),
	delete: <T>(endpoint: string, config?: RequestConfig) =>
		request<T>('DELETE', endpoint, undefined, config),
};
