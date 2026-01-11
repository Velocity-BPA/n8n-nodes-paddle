/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Get the base URL for Paddle API based on environment
 */
export function getBaseUrl(environment: string): string {
	return environment === 'sandbox'
		? 'https://sandbox-api.paddle.com'
		: 'https://api.paddle.com';
}

/**
 * Make an authenticated request to the Paddle API
 */
export async function paddleApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('paddleApi');

	const baseUrl = getBaseUrl(credentials.environment as string);

	const options: IRequestOptions = {
		method,
		uri: `${baseUrl}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			'Paddle-Version': '1',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.request(options);
		return response.data ?? response;
	} catch (error) {
		const errorObj = error as JsonObject;
		const errorMessage =
			(errorObj?.error as JsonObject)?.detail as string ??
			(errorObj?.message as string) ??
			'An unknown error occurred';
		throw new NodeApiError(this.getNode(), errorObj, {
			message: errorMessage,
		});
	}
}

/**
 * Make a paginated request to fetch all items from the Paddle API
 */
export async function paddleApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject[]> {
	const credentials = await this.getCredentials('paddleApi');
	const baseUrl = getBaseUrl(credentials.environment as string);

	const returnData: IDataObject[] = [];
	let hasMore = true;
	let after: string | undefined;

	query = query ?? {};
	query.per_page = query.per_page ?? 50;

	while (hasMore) {
		if (after) {
			query.after = after;
		}

		const options: IRequestOptions = {
			method,
			uri: `${baseUrl}${endpoint}`,
			headers: {
				Authorization: `Bearer ${credentials.apiKey}`,
				'Content-Type': 'application/json',
				'Paddle-Version': '1',
			},
			json: true,
			qs: query,
		};

		if (body && Object.keys(body).length > 0) {
			options.body = body;
		}

		try {
			const response = await this.helpers.request(options);

			if (Array.isArray(response.data)) {
				returnData.push(...response.data);
			}

			hasMore = response.meta?.pagination?.has_more === true;
			after = response.meta?.pagination?.next;

			if (!hasMore || !after) {
				break;
			}
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}

	return returnData;
}

/**
 * Make a request and return the full response including metadata
 */
export async function paddleApiRequestWithMeta(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('paddleApi');
	const baseUrl = getBaseUrl(credentials.environment as string);

	const options: IRequestOptions = {
		method,
		uri: `${baseUrl}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			'Paddle-Version': '1',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Download a file (PDF) from Paddle API
 */
export async function paddleApiDownloadFile(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<Buffer> {
	const credentials = await this.getCredentials('paddleApi');
	const baseUrl = getBaseUrl(credentials.environment as string);

	const options: IRequestOptions = {
		method: 'GET',
		uri: `${baseUrl}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			'Paddle-Version': '1',
			Accept: 'application/pdf',
		},
		encoding: null,
	};

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
