/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Tax Categories
export const TAX_CATEGORIES = [
	{ name: 'Digital Goods', value: 'digital-goods' },
	{ name: 'E-books', value: 'ebooks' },
	{ name: 'Implementation Services', value: 'implementation-services' },
	{ name: 'Professional Services', value: 'professional-services' },
	{ name: 'SaaS', value: 'saas' },
	{ name: 'Software Programming Services', value: 'software-programming-services' },
	{ name: 'Standard', value: 'standard' },
	{ name: 'Training Services', value: 'training-services' },
	{ name: 'Website Hosting', value: 'website-hosting' },
];

// Currency Codes (Paddle supported currencies)
export const CURRENCY_CODES = [
	{ name: 'Australian Dollar (AUD)', value: 'AUD' },
	{ name: 'Brazilian Real (BRL)', value: 'BRL' },
	{ name: 'British Pound (GBP)', value: 'GBP' },
	{ name: 'Canadian Dollar (CAD)', value: 'CAD' },
	{ name: 'Czech Koruna (CZK)', value: 'CZK' },
	{ name: 'Danish Krone (DKK)', value: 'DKK' },
	{ name: 'Euro (EUR)', value: 'EUR' },
	{ name: 'Hong Kong Dollar (HKD)', value: 'HKD' },
	{ name: 'Hungarian Forint (HUF)', value: 'HUF' },
	{ name: 'Israeli Shekel (ILS)', value: 'ILS' },
	{ name: 'Japanese Yen (JPY)', value: 'JPY' },
	{ name: 'Mexican Peso (MXN)', value: 'MXN' },
	{ name: 'New Taiwan Dollar (TWD)', value: 'TWD' },
	{ name: 'New Zealand Dollar (NZD)', value: 'NZD' },
	{ name: 'Norwegian Krone (NOK)', value: 'NOK' },
	{ name: 'Polish Zloty (PLN)', value: 'PLN' },
	{ name: 'Singapore Dollar (SGD)', value: 'SGD' },
	{ name: 'South African Rand (ZAR)', value: 'ZAR' },
	{ name: 'South Korean Won (KRW)', value: 'KRW' },
	{ name: 'Swedish Krona (SEK)', value: 'SEK' },
	{ name: 'Swiss Franc (CHF)', value: 'CHF' },
	{ name: 'Thai Baht (THB)', value: 'THB' },
	{ name: 'US Dollar (USD)', value: 'USD' },
];

// Billing Intervals
export const BILLING_INTERVALS = [
	{ name: 'Day', value: 'day' },
	{ name: 'Week', value: 'week' },
	{ name: 'Month', value: 'month' },
	{ name: 'Year', value: 'year' },
];

// Product Types
export const PRODUCT_TYPES = [
	{ name: 'Standard', value: 'standard' },
	{ name: 'Custom', value: 'custom' },
];

// Status Options
export const STATUS_OPTIONS = [
	{ name: 'Active', value: 'active' },
	{ name: 'Archived', value: 'archived' },
];

// Address Statuses
export const ADDRESS_STATUSES = [
	{ name: 'Active', value: 'active' },
	{ name: 'Archived', value: 'archived' },
];

// Business Statuses
export const BUSINESS_STATUSES = [
	{ name: 'Active', value: 'active' },
	{ name: 'Archived', value: 'archived' },
];

// Supported Currencies (alias for CURRENCY_CODES)
export const SUPPORTED_CURRENCIES = [
	{ name: 'Australian Dollar (AUD)', value: 'AUD' },
	{ name: 'Brazilian Real (BRL)', value: 'BRL' },
	{ name: 'British Pound (GBP)', value: 'GBP' },
	{ name: 'Canadian Dollar (CAD)', value: 'CAD' },
	{ name: 'Czech Koruna (CZK)', value: 'CZK' },
	{ name: 'Danish Krone (DKK)', value: 'DKK' },
	{ name: 'Euro (EUR)', value: 'EUR' },
	{ name: 'Hong Kong Dollar (HKD)', value: 'HKD' },
	{ name: 'Hungarian Forint (HUF)', value: 'HUF' },
	{ name: 'Israeli Shekel (ILS)', value: 'ILS' },
	{ name: 'Japanese Yen (JPY)', value: 'JPY' },
	{ name: 'Mexican Peso (MXN)', value: 'MXN' },
	{ name: 'New Taiwan Dollar (TWD)', value: 'TWD' },
	{ name: 'New Zealand Dollar (NZD)', value: 'NZD' },
	{ name: 'Norwegian Krone (NOK)', value: 'NOK' },
	{ name: 'Polish Zloty (PLN)', value: 'PLN' },
	{ name: 'Singapore Dollar (SGD)', value: 'SGD' },
	{ name: 'South African Rand (ZAR)', value: 'ZAR' },
	{ name: 'South Korean Won (KRW)', value: 'KRW' },
	{ name: 'Swedish Krona (SEK)', value: 'SEK' },
	{ name: 'Swiss Franc (CHF)', value: 'CHF' },
	{ name: 'Thai Baht (THB)', value: 'THB' },
	{ name: 'US Dollar (USD)', value: 'USD' },
];

// Subscription Statuses
export const SUBSCRIPTION_STATUSES = [
	{ name: 'Active', value: 'active' },
	{ name: 'Canceled', value: 'canceled' },
	{ name: 'Past Due', value: 'past_due' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Trialing', value: 'trialing' },
];

// Transaction Statuses
export const TRANSACTION_STATUSES = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Ready', value: 'ready' },
	{ name: 'Billed', value: 'billed' },
	{ name: 'Paid', value: 'paid' },
	{ name: 'Completed', value: 'completed' },
	{ name: 'Canceled', value: 'canceled' },
];

// Transaction Origins
export const TRANSACTION_ORIGINS = [
	{ name: 'API', value: 'api' },
	{ name: 'Subscription Charge', value: 'subscription_charge' },
	{ name: 'Subscription Payment Method Change', value: 'subscription_payment_method_change' },
	{ name: 'Subscription Recurring', value: 'subscription_recurring' },
	{ name: 'Subscription Update', value: 'subscription_update' },
	{ name: 'Web', value: 'web' },
];

// Collection Modes
export const COLLECTION_MODES = [
	{ name: 'Automatic', value: 'automatic' },
	{ name: 'Manual', value: 'manual' },
];

// Invoice Statuses
export const INVOICE_STATUSES = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Issued', value: 'issued' },
	{ name: 'Paid', value: 'paid' },
	{ name: 'Canceled', value: 'canceled' },
];

// Discount Types
export const DISCOUNT_TYPES = [
	{ name: 'Flat', value: 'flat' },
	{ name: 'Flat Per Seat', value: 'flat_per_seat' },
	{ name: 'Percentage', value: 'percentage' },
];

// Discount Statuses
export const DISCOUNT_STATUSES = [
	{ name: 'Active', value: 'active' },
	{ name: 'Archived', value: 'archived' },
	{ name: 'Expired', value: 'expired' },
	{ name: 'Used', value: 'used' },
];

// Adjustment Actions
export const ADJUSTMENT_ACTIONS = [
	{ name: 'Refund', value: 'refund' },
	{ name: 'Credit', value: 'credit' },
	{ name: 'Chargeback', value: 'chargeback' },
	{ name: 'Chargeback Warning', value: 'chargeback_warning' },
	{ name: 'Chargeback Reverse', value: 'chargeback_reverse' },
];

// Adjustment Statuses
export const ADJUSTMENT_STATUSES = [
	{ name: 'Pending Approval', value: 'pending_approval' },
	{ name: 'Approved', value: 'approved' },
	{ name: 'Rejected', value: 'rejected' },
	{ name: 'Reversed', value: 'reversed' },
];

// Payout Statuses
export const PAYOUT_STATUSES = [
	{ name: 'Unpaid', value: 'unpaid' },
	{ name: 'Paid', value: 'paid' },
];

// Notification Types
export const NOTIFICATION_TYPES = [
	{ name: 'URL (Webhook)', value: 'url' },
	{ name: 'Email', value: 'email' },
];

// Scheduled Change Actions
export const SCHEDULED_CHANGE_ACTIONS = [
	{ name: 'Cancel', value: 'cancel' },
	{ name: 'Pause', value: 'pause' },
	{ name: 'Resume', value: 'resume' },
];

// Webhook Event Types
export const WEBHOOK_EVENTS = [
	// Transaction Events
	{ name: 'Transaction Billed', value: 'transaction.billed' },
	{ name: 'Transaction Canceled', value: 'transaction.canceled' },
	{ name: 'Transaction Completed', value: 'transaction.completed' },
	{ name: 'Transaction Created', value: 'transaction.created' },
	{ name: 'Transaction Paid', value: 'transaction.paid' },
	{ name: 'Transaction Past Due', value: 'transaction.past_due' },
	{ name: 'Transaction Payment Failed', value: 'transaction.payment_failed' },
	{ name: 'Transaction Ready', value: 'transaction.ready' },
	{ name: 'Transaction Updated', value: 'transaction.updated' },
	// Subscription Events
	{ name: 'Subscription Activated', value: 'subscription.activated' },
	{ name: 'Subscription Canceled', value: 'subscription.canceled' },
	{ name: 'Subscription Created', value: 'subscription.created' },
	{ name: 'Subscription Imported', value: 'subscription.imported' },
	{ name: 'Subscription Past Due', value: 'subscription.past_due' },
	{ name: 'Subscription Paused', value: 'subscription.paused' },
	{ name: 'Subscription Resumed', value: 'subscription.resumed' },
	{ name: 'Subscription Trialing', value: 'subscription.trialing' },
	{ name: 'Subscription Updated', value: 'subscription.updated' },
	// Customer Events
	{ name: 'Customer Created', value: 'customer.created' },
	{ name: 'Customer Imported', value: 'customer.imported' },
	{ name: 'Customer Updated', value: 'customer.updated' },
	// Address Events
	{ name: 'Address Created', value: 'address.created' },
	{ name: 'Address Imported', value: 'address.imported' },
	{ name: 'Address Updated', value: 'address.updated' },
	// Business Events
	{ name: 'Business Created', value: 'business.created' },
	{ name: 'Business Imported', value: 'business.imported' },
	{ name: 'Business Updated', value: 'business.updated' },
	// Adjustment Events
	{ name: 'Adjustment Created', value: 'adjustment.created' },
	{ name: 'Adjustment Updated', value: 'adjustment.updated' },
	// Payout Events
	{ name: 'Payout Created', value: 'payout.created' },
	{ name: 'Payout Paid', value: 'payout.paid' },
	// Product Events
	{ name: 'Product Created', value: 'product.created' },
	{ name: 'Product Updated', value: 'product.updated' },
	{ name: 'Product Imported', value: 'product.imported' },
	// Price Events
	{ name: 'Price Created', value: 'price.created' },
	{ name: 'Price Updated', value: 'price.updated' },
	{ name: 'Price Imported', value: 'price.imported' },
	// Discount Events
	{ name: 'Discount Created', value: 'discount.created' },
	{ name: 'Discount Updated', value: 'discount.updated' },
	{ name: 'Discount Imported', value: 'discount.imported' },
	// Report Events
	{ name: 'Report Created', value: 'report.created' },
	{ name: 'Report Updated', value: 'report.updated' },
];

// Country Codes (ISO 3166-1 alpha-2)
export const COUNTRY_CODES = [
	{ name: 'United States', value: 'US' },
	{ name: 'United Kingdom', value: 'GB' },
	{ name: 'Canada', value: 'CA' },
	{ name: 'Australia', value: 'AU' },
	{ name: 'Germany', value: 'DE' },
	{ name: 'France', value: 'FR' },
	{ name: 'Italy', value: 'IT' },
	{ name: 'Spain', value: 'ES' },
	{ name: 'Netherlands', value: 'NL' },
	{ name: 'Belgium', value: 'BE' },
	{ name: 'Austria', value: 'AT' },
	{ name: 'Switzerland', value: 'CH' },
	{ name: 'Sweden', value: 'SE' },
	{ name: 'Norway', value: 'NO' },
	{ name: 'Denmark', value: 'DK' },
	{ name: 'Finland', value: 'FI' },
	{ name: 'Ireland', value: 'IE' },
	{ name: 'Portugal', value: 'PT' },
	{ name: 'Poland', value: 'PL' },
	{ name: 'Czech Republic', value: 'CZ' },
	{ name: 'Japan', value: 'JP' },
	{ name: 'South Korea', value: 'KR' },
	{ name: 'Singapore', value: 'SG' },
	{ name: 'Hong Kong', value: 'HK' },
	{ name: 'Taiwan', value: 'TW' },
	{ name: 'New Zealand', value: 'NZ' },
	{ name: 'Brazil', value: 'BR' },
	{ name: 'Mexico', value: 'MX' },
	{ name: 'India', value: 'IN' },
	{ name: 'South Africa', value: 'ZA' },
	{ name: 'Israel', value: 'IL' },
	{ name: 'United Arab Emirates', value: 'AE' },
];

// Locales
export const LOCALES = [
	{ name: 'English (US)', value: 'en' },
	{ name: 'English (UK)', value: 'en-GB' },
	{ name: 'German', value: 'de' },
	{ name: 'French', value: 'fr' },
	{ name: 'Spanish', value: 'es' },
	{ name: 'Italian', value: 'it' },
	{ name: 'Portuguese', value: 'pt' },
	{ name: 'Dutch', value: 'nl' },
	{ name: 'Swedish', value: 'sv' },
	{ name: 'Norwegian', value: 'no' },
	{ name: 'Danish', value: 'da' },
	{ name: 'Finnish', value: 'fi' },
	{ name: 'Polish', value: 'pl' },
	{ name: 'Czech', value: 'cs' },
	{ name: 'Japanese', value: 'ja' },
	{ name: 'Korean', value: 'ko' },
	{ name: 'Chinese (Simplified)', value: 'zh-Hans' },
	{ name: 'Chinese (Traditional)', value: 'zh-Hant' },
];
