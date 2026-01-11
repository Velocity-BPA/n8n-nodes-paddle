/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Resource Types
export type PaddleResource =
	| 'product'
	| 'price'
	| 'customer'
	| 'subscription'
	| 'transaction'
	| 'invoice'
	| 'address'
	| 'business'
	| 'discount'
	| 'adjustment'
	| 'payout'
	| 'notificationSetting';

// Common Types
export interface PaddleApiResponse<T = IDataObject> {
	data: T;
	meta: {
		request_id: string;
		pagination?: {
			per_page: number;
			next?: string;
			has_more: boolean;
			estimated_total?: number;
		};
	};
}

export interface PaddleApiError {
	error: {
		type: string;
		code: string;
		detail: string;
		documentation_url: string;
	};
	meta: {
		request_id: string;
	};
}

export interface PaddleCustomData {
	[key: string]: string | number | boolean;
}

export interface PaddleBillingCycle {
	frequency: number;
	interval: 'day' | 'week' | 'month' | 'year';
}

export interface PaddleTimePeriod {
	starts_at: string;
	ends_at: string;
}

export interface PaddleMoney {
	amount: string;
	currency_code: string;
}

// Product Types
export interface PaddleProduct {
	id: string;
	name: string;
	description?: string;
	type: 'standard' | 'custom';
	tax_category: string;
	image_url?: string;
	custom_data?: PaddleCustomData;
	status: 'active' | 'archived';
	created_at: string;
	updated_at: string;
}

// Price Types
export interface PaddleUnitPrice {
	amount: string;
	currency_code: string;
}

export interface PaddleUnitPriceOverride {
	country_codes: string[];
	unit_price: PaddleUnitPrice;
}

export interface PaddleQuantity {
	minimum: number;
	maximum: number;
}

export interface PaddlePrice {
	id: string;
	product_id: string;
	name?: string;
	description?: string;
	type: 'standard' | 'custom';
	billing_cycle?: PaddleBillingCycle;
	trial_period?: PaddleBillingCycle;
	unit_price: PaddleUnitPrice;
	unit_price_overrides?: PaddleUnitPriceOverride[];
	quantity?: PaddleQuantity;
	custom_data?: PaddleCustomData;
	status: 'active' | 'archived';
	created_at: string;
	updated_at: string;
}

// Customer Types
export interface PaddleCustomer {
	id: string;
	email: string;
	name?: string;
	locale?: string;
	custom_data?: PaddleCustomData;
	status: 'active' | 'archived';
	marketing_consent: boolean;
	created_at: string;
	updated_at: string;
}

// Address Types
export interface PaddleAddress {
	id: string;
	customer_id: string;
	description?: string;
	first_line?: string;
	second_line?: string;
	city?: string;
	postal_code?: string;
	region?: string;
	country_code: string;
	status: 'active' | 'archived';
	created_at: string;
	updated_at: string;
}

// Business Types
export interface PaddleBusinessContact {
	name: string;
	email: string;
}

export interface PaddleBusiness {
	id: string;
	customer_id: string;
	name: string;
	company_number?: string;
	tax_identifier?: string;
	contacts?: PaddleBusinessContact[];
	status: 'active' | 'archived';
	created_at: string;
	updated_at: string;
}

// Subscription Types
export interface PaddleSubscriptionItem {
	price_id: string;
	quantity: number;
	status?: string;
	recurring?: boolean;
	created_at?: string;
	updated_at?: string;
	previously_billed_at?: string;
	next_billed_at?: string;
	trial_dates?: PaddleTimePeriod;
	price?: PaddlePrice;
}

export interface PaddleScheduledChange {
	action: 'cancel' | 'pause' | 'resume';
	effective_at: string;
	resume_at?: string;
}

export interface PaddleSubscription {
	id: string;
	customer_id: string;
	address_id: string;
	business_id?: string;
	currency_code: string;
	status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
	collection_mode: 'automatic' | 'manual';
	billing_details?: {
		enable_checkout: boolean;
		payment_terms: {
			interval: string;
			frequency: number;
		};
		purchase_order_number?: string;
	};
	current_billing_period?: PaddleTimePeriod;
	first_billed_at?: string;
	next_billed_at?: string;
	paused_at?: string;
	canceled_at?: string;
	items: PaddleSubscriptionItem[];
	discount?: {
		id: string;
		starts_at: string;
		ends_at?: string;
	};
	scheduled_change?: PaddleScheduledChange;
	management_urls?: {
		update_payment_method?: string;
		cancel?: string;
	};
	custom_data?: PaddleCustomData;
	created_at: string;
	updated_at: string;
}

// Transaction Types
export interface PaddleTransactionItem {
	price_id: string;
	quantity: number;
	price?: PaddlePrice;
	product?: PaddleProduct;
}

export interface PaddleTransactionDetails {
	tax_rates_used: Array<{
		tax_rate: string;
		totals: PaddleMoney;
	}>;
	totals: {
		subtotal: string;
		discount: string;
		tax: string;
		total: string;
		credit: string;
		balance: string;
		grand_total: string;
		currency_code: string;
	};
	adjusted_totals?: {
		subtotal: string;
		tax: string;
		total: string;
		grand_total: string;
		currency_code: string;
	};
	line_items: Array<{
		id: string;
		price_id: string;
		quantity: number;
		totals: {
			subtotal: string;
			tax: string;
			total: string;
		};
		product: PaddleProduct;
		price: PaddlePrice;
	}>;
}

export interface PaddlePayment {
	payment_method_id: string;
	amount: string;
	status: string;
	error_code?: string;
	method_details: IDataObject;
	stored: boolean;
	created_at: string;
}

export interface PaddleTransaction {
	id: string;
	customer_id?: string;
	subscription_id?: string;
	address_id?: string;
	business_id?: string;
	currency_code: string;
	status: 'draft' | 'ready' | 'billed' | 'paid' | 'completed' | 'canceled';
	origin: 'api' | 'subscription_charge' | 'subscription_payment_method_change' | 'subscription_recurring' | 'subscription_update' | 'web';
	collection_mode: 'automatic' | 'manual';
	items: PaddleTransactionItem[];
	details?: PaddleTransactionDetails;
	payments?: PaddlePayment[];
	checkout?: {
		url?: string;
	};
	invoice_id?: string;
	invoice_number?: string;
	billed_at?: string;
	custom_data?: PaddleCustomData;
	created_at: string;
	updated_at: string;
}

// Invoice Types
export interface PaddleInvoice {
	id: string;
	transaction_id: string;
	customer_id: string;
	subscription_id?: string;
	status: 'draft' | 'issued' | 'paid' | 'canceled';
	invoice_number?: string;
	billed_at?: string;
	due_at?: string;
	paid_at?: string;
	details?: {
		line_items: Array<{
			id: string;
			price_id: string;
			quantity: number;
			totals: {
				subtotal: string;
				tax: string;
				total: string;
			};
		}>;
		totals: {
			subtotal: string;
			tax: string;
			total: string;
			credit: string;
			balance: string;
			grand_total: string;
			currency_code: string;
		};
	};
	currency_code: string;
	created_at: string;
	updated_at: string;
}

// Discount Types
export interface PaddleDiscount {
	id: string;
	amount: string;
	type: 'flat' | 'flat_per_seat' | 'percentage';
	description: string;
	enabled_for_checkout: boolean;
	code?: string;
	currency_code?: string;
	recur: boolean;
	maximum_recurring_intervals?: number;
	usage_limit?: number;
	times_used?: number;
	restrict_to?: string[];
	expires_at?: string;
	status: 'active' | 'archived' | 'expired' | 'used';
	created_at: string;
	updated_at: string;
}

// Adjustment Types
export interface PaddleAdjustmentItem {
	item_id: string;
	type: 'full' | 'partial' | 'proration';
	amount?: string;
}

export interface PaddleAdjustment {
	id: string;
	transaction_id: string;
	subscription_id?: string;
	customer_id: string;
	action: 'refund' | 'credit' | 'chargeback' | 'chargeback_warning' | 'chargeback_reverse';
	reason: string;
	items: PaddleAdjustmentItem[];
	totals: {
		subtotal: string;
		tax: string;
		total: string;
		fee: string;
		earnings: string;
		currency_code: string;
	};
	payout_totals?: {
		subtotal: string;
		tax: string;
		total: string;
		fee: string;
		earnings: string;
		currency_code: string;
	};
	status: 'pending_approval' | 'approved' | 'rejected' | 'reversed';
	currency_code: string;
	created_at: string;
	updated_at: string;
}

// Payout Types
export interface PaddlePayout {
	id: string;
	amount: string;
	currency_code: string;
	status: 'unpaid' | 'paid';
	occurred_at: string;
}

// Notification Setting Types
export interface PaddleNotificationSetting {
	id: string;
	description: string;
	destination: string;
	type: 'url' | 'email';
	active: boolean;
	api_version: number;
	include_sensitive_fields: boolean;
	subscribed_events: string[];
	endpoint_secret_key?: string;
	created_at: string;
	updated_at: string;
}

// Webhook Event Types
export interface PaddleWebhookEvent {
	event_id: string;
	event_type: string;
	occurred_at: string;
	notification_id: string;
	data: IDataObject;
}

// Operation Parameters
export interface PaddleFilterParams {
	status?: string;
	id?: string[];
	after?: string;
	per_page?: number;
	order_by?: string;
}

export interface PaddleProductFilterParams extends PaddleFilterParams {
	type?: string;
	tax_category?: string;
}

export interface PaddlePriceFilterParams extends PaddleFilterParams {
	product_id?: string[];
	type?: string;
	recurring?: boolean;
}

export interface PaddleCustomerFilterParams extends PaddleFilterParams {
	email?: string;
}

export interface PaddleSubscriptionFilterParams extends PaddleFilterParams {
	customer_id?: string[];
	price_id?: string[];
	collection_mode?: string;
	scheduled_change_action?: string;
}

export interface PaddleTransactionFilterParams extends PaddleFilterParams {
	customer_id?: string[];
	subscription_id?: string[];
	invoice_number?: string;
	origin?: string;
	collection_mode?: string;
	billed_at?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PaddleAdjustmentFilterParams extends PaddleFilterParams {
	customer_id?: string;
	transaction_id?: string;
	subscription_id?: string;
	action?: string;
}
