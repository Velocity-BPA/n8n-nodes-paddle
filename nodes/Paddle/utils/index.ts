/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';
import * as crypto from 'crypto';

/**
 * Convert an array of n8n execution data to a single array of data objects
 */
export function simplifyOutput(items: INodeExecutionData[]): IDataObject[] {
	return items.map((item) => item.json);
}

/**
 * Verify Paddle webhook signature
 */
export function verifyWebhookSignature(
	rawBody: string,
	signature: string,
	timestamp: string,
	secretKey: string,
): boolean {
	const signedPayload = `${timestamp}:${rawBody}`;
	const expectedSignature = crypto
		.createHmac('sha256', secretKey)
		.update(signedPayload)
		.digest('hex');

	// Parse the signature header (format: h1=xxx;ts=xxx)
	const parts = signature.split(';');
	const h1 = parts.find((p) => p.startsWith('h1='))?.slice(3);

	if (!h1) {
		return false;
	}

	// Use timing-safe comparison to prevent timing attacks
	try {
		return crypto.timingSafeEqual(
			Buffer.from(h1, 'hex'),
			Buffer.from(expectedSignature, 'hex'),
		);
	} catch {
		return false;
	}
}

/**
 * Parse custom data from string to object
 */
export function parseCustomData(customDataString: string): IDataObject {
	if (!customDataString) {
		return {};
	}

	try {
		return JSON.parse(customDataString) as IDataObject;
	} catch {
		// If it's not valid JSON, try to parse as key=value pairs
		const result: IDataObject = {};
		const pairs = customDataString.split(',');
		for (const pair of pairs) {
			const [key, value] = pair.split('=').map((s) => s.trim());
			if (key && value) {
				result[key] = value;
			}
		}
		return result;
	}
}

/**
 * Build filter query parameters from options
 */
export function buildFilterQuery(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			// Handle array values (like status[]=active)
			if (Array.isArray(value) && value.length > 0) {
				query[`${key}[]`] = value;
			} else if (!Array.isArray(value)) {
				query[key] = value;
			}
		}
	}

	return query;
}

/**
 * Format amount for Paddle API (smallest unit, e.g., cents)
 */
export function formatAmount(amount: number, currency: string): string {
	// Currencies that don't use decimal places
	const noDecimalCurrencies = ['JPY', 'KRW', 'TWD', 'HUF'];

	if (noDecimalCurrencies.includes(currency.toUpperCase())) {
		return Math.round(amount).toString();
	}

	// Convert to cents (multiply by 100)
	return Math.round(amount * 100).toString();
}

/**
 * Parse amount from Paddle API (from smallest unit to decimal)
 */
export function parseAmount(amountStr: string, currency: string): number {
	const amount = parseInt(amountStr, 10);

	// Currencies that don't use decimal places
	const noDecimalCurrencies = ['JPY', 'KRW', 'TWD', 'HUF'];

	if (noDecimalCurrencies.includes(currency.toUpperCase())) {
		return amount;
	}

	// Convert from cents (divide by 100)
	return amount / 100;
}

/**
 * Build billing cycle object from parameters
 */
export function buildBillingCycle(
	frequency: number,
	interval: string,
): IDataObject {
	return {
		frequency,
		interval,
	};
}

/**
 * Build unit price object from parameters
 */
export function buildUnitPrice(amount: string, currencyCode: string): IDataObject {
	return {
		amount,
		currency_code: currencyCode,
	};
}

/**
 * Convert items array to Paddle format
 */
export function formatItems(
	items: Array<{ priceId: string; quantity: number }>,
): IDataObject[] {
	return items.map((item) => ({
		price_id: item.priceId,
		quantity: item.quantity,
	}));
}

/**
 * Build address object from parameters
 */
export function buildAddress(params: {
	countryCode: string;
	description?: string;
	firstLine?: string;
	secondLine?: string;
	city?: string;
	postalCode?: string;
	region?: string;
}): IDataObject {
	const address: IDataObject = {
		country_code: params.countryCode,
	};

	if (params.description) address.description = params.description;
	if (params.firstLine) address.first_line = params.firstLine;
	if (params.secondLine) address.second_line = params.secondLine;
	if (params.city) address.city = params.city;
	if (params.postalCode) address.postal_code = params.postalCode;
	if (params.region) address.region = params.region;

	return address;
}

/**
 * Build business contacts array
 */
export function buildContacts(
	contacts: Array<{ name: string; email: string }>,
): IDataObject[] {
	return contacts.map((contact) => ({
		name: contact.name,
		email: contact.email,
	}));
}

/**
 * Remove undefined/null values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const cleanedNested = cleanObject(value as IDataObject);
				if (Object.keys(cleanedNested).length > 0) {
					cleaned[key] = cleanedNested;
				}
			} else if (Array.isArray(value) && value.length > 0) {
				cleaned[key] = value;
			} else if (!Array.isArray(value)) {
				cleaned[key] = value;
			}
		}
	}

	return cleaned;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Implement exponential backoff for rate limiting
 */
export async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	initialDelay: number = 1000,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;

			// Check if it's a rate limit error (429)
			if (
				(error as { statusCode?: number }).statusCode === 429 &&
				attempt < maxRetries
			) {
				const delay = initialDelay * Math.pow(2, attempt);
				await sleep(Math.min(delay, 60000)); // Max 60 second delay
			} else {
				throw error;
			}
		}
	}

	throw lastError;
}

/**
 * Display licensing notice (called once per node load)
 */
let licenseNoticeDisplayed = false;
export function displayLicenseNotice(): void {
	if (!licenseNoticeDisplayed) {
		console.warn(
			'[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
			'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
			'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.',
		);
		licenseNoticeDisplayed = true;
	}
}
