/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { verifyWebhookSignature, cleanObject, formatAmount, parseCustomData } from '../../nodes/Paddle/utils';

describe('Paddle Utils', () => {
	describe('cleanObject', () => {
		it('should remove undefined values', () => {
			const input = { a: 1, b: undefined, c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove null values', () => {
			const input = { a: 1, b: null, c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove empty strings', () => {
			const input = { a: 1, b: '', c: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should keep zero values', () => {
			const input = { a: 0, b: 1 };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 0, b: 1 });
		});

		it('should keep false values', () => {
			const input = { a: false, b: true };
			const result = cleanObject(input);
			expect(result).toEqual({ a: false, b: true });
		});
	});

	describe('formatAmount', () => {
		it('should convert USD decimal amount to cents string', () => {
			expect(formatAmount(10.00, 'USD')).toBe('1000');
		});

		it('should convert EUR decimal amount to cents string', () => {
			expect(formatAmount(25.00, 'EUR')).toBe('2500');
		});

		it('should convert GBP decimal amount to cents string', () => {
			expect(formatAmount(9.99, 'GBP')).toBe('999');
		});

		it('should handle zero-decimal currencies (JPY) without conversion', () => {
			expect(formatAmount(1000, 'JPY')).toBe('1000');
		});

		it('should handle other currencies as decimal currencies', () => {
			expect(formatAmount(15.00, 'XYZ')).toBe('1500');
		});
	});

	describe('parseCustomData', () => {
		it('should parse valid JSON', () => {
			const result = parseCustomData('{"key": "value"}');
			expect(result).toEqual({ key: 'value' });
		});

		it('should return empty object for invalid JSON', () => {
			const result = parseCustomData('invalid json');
			expect(result).toEqual({});
		});

		it('should handle key=value format', () => {
			const result = parseCustomData('key1=value1,key2=value2');
			expect(result).toEqual({ key1: 'value1', key2: 'value2' });
		});

		it('should return empty object for empty string', () => {
			const result = parseCustomData('');
			expect(result).toEqual({});
		});
	});

	describe('verifyWebhookSignature', () => {
		it('should verify valid signature', () => {
			const payload = '{"event_type":"test"}';
			const timestamp = '1609459200';
			const secret = 'pdl_ntfset_test_secret';
			
			// Create a valid signature for testing
			const crypto = require('crypto');
			const signedPayload = `${timestamp}:${payload}`;
			const expectedHash = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
			const signature = `ts=${timestamp};h1=${expectedHash}`;
			
			const result = verifyWebhookSignature(payload, signature, timestamp, secret);
			expect(result).toBe(true);
		});

		it('should reject invalid signature', () => {
			const payload = '{"event_type":"test"}';
			const signature = 'ts=1609459200;h1=invalidsignature';
			const timestamp = '1609459200';
			const secret = 'pdl_ntfset_test_secret';
			
			const result = verifyWebhookSignature(payload, signature, timestamp, secret);
			expect(result).toBe(false);
		});
	});
});

describe('Paddle Constants', () => {
	const { 
		TAX_CATEGORIES,
		CURRENCY_CODES,
		BILLING_INTERVALS,
		WEBHOOK_EVENTS,
	} = require('../../nodes/Paddle/constants');

	it('should have valid tax categories', () => {
		expect(TAX_CATEGORIES.length).toBeGreaterThan(0);
		TAX_CATEGORIES.forEach((cat: { name: string; value: string }) => {
			expect(cat).toHaveProperty('name');
			expect(cat).toHaveProperty('value');
		});
	});

	it('should have valid currency codes', () => {
		expect(CURRENCY_CODES.length).toBeGreaterThan(0);
		const usd = CURRENCY_CODES.find((c: { value: string }) => c.value === 'USD');
		expect(usd).toBeDefined();
	});

	it('should have valid billing intervals', () => {
		expect(BILLING_INTERVALS).toContainEqual({ name: 'Month', value: 'month' });
		expect(BILLING_INTERVALS).toContainEqual({ name: 'Year', value: 'year' });
	});

	it('should have webhook events', () => {
		expect(WEBHOOK_EVENTS.length).toBeGreaterThan(0);
		const transactionBilled = WEBHOOK_EVENTS.find(
			(e: { value: string }) => e.value === 'transaction.billed'
		);
		expect(transactionBilled).toBeDefined();
	});
});
