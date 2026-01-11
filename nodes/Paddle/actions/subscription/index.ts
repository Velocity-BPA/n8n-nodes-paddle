/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { paddleApiRequest, paddleApiRequestAllItems } from '../../transport';
import { parseCustomData, cleanObject } from '../../utils';
import {
	SUBSCRIPTION_STATUSES,
	COLLECTION_MODES,
	SCHEDULED_CHANGE_ACTIONS,
	BILLING_INTERVALS,
} from '../../constants';

export const subscriptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['subscription'],
			},
		},
		options: [
			{
				name: 'Activate',
				value: 'activate',
				description: 'Activate a trialing subscription',
				action: 'Activate a subscription',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a subscription',
				action: 'Cancel a subscription',
			},
			{
				name: 'Create One-Time Charge',
				value: 'createOneTimeCharge',
				description: 'Add a one-time charge to subscription',
				action: 'Create one-time charge',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a subscription by ID',
				action: 'Get a subscription',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many subscriptions',
				action: 'Get many subscriptions',
			},
			{
				name: 'Get Next Transaction',
				value: 'getNextTransaction',
				description: 'Preview next transaction',
				action: 'Get next transaction preview',
			},
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Get subscription transactions',
				action: 'Get subscription transactions',
			},
			{
				name: 'Pause',
				value: 'pause',
				description: 'Pause a subscription',
				action: 'Pause a subscription',
			},
			{
				name: 'Preview Update',
				value: 'previewUpdate',
				description: 'Preview subscription update',
				action: 'Preview subscription update',
			},
			{
				name: 'Resume',
				value: 'resume',
				description: 'Resume a paused subscription',
				action: 'Resume a subscription',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a subscription',
				action: 'Update a subscription',
			},
			{
				name: 'Update Payment Method',
				value: 'updatePaymentMethod',
				description: 'Get URL to update payment method',
				action: 'Update payment method',
			},
		],
		default: 'getAll',
	},
];

export const subscriptionFields: INodeProperties[] = [
	// ----------------------------------
	//         subscription:get
	// ----------------------------------
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: [
					'get',
					'update',
					'pause',
					'resume',
					'cancel',
					'activate',
					'getNextTransaction',
					'previewUpdate',
					'getTransactions',
					'createOneTimeCharge',
					'updatePaymentMethod',
				],
			},
		},
		description: 'The ID of the subscription (sub_xxxxx)',
	},

	// ----------------------------------
	//         subscription:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: SUBSCRIPTION_STATUSES,
				default: [],
				description: 'Filter by subscription status',
			},
			{
				displayName: 'Customer IDs',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs to filter by',
			},
			{
				displayName: 'Price IDs',
				name: 'price_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of price IDs to filter by',
			},
			{
				displayName: 'Collection Mode',
				name: 'collection_mode',
				type: 'options',
				options: COLLECTION_MODES,
				default: '',
				description: 'Filter by collection mode',
			},
			{
				displayName: 'Scheduled Change Action',
				name: 'scheduled_change_action',
				type: 'options',
				options: SCHEDULED_CHANGE_ACTIONS,
				default: '',
				description: 'Filter by scheduled change action',
			},
		],
	},

	// ----------------------------------
	//         subscription:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Proration Billing Mode',
				name: 'proration_billing_mode',
				type: 'options',
				options: [
					{ name: 'Prorated Immediately', value: 'prorated_immediately' },
					{ name: 'Prorated Next Billing Period', value: 'prorated_next_billing_period' },
					{ name: 'Full Immediately', value: 'full_immediately' },
					{ name: 'Full Next Billing Period', value: 'full_next_billing_period' },
					{ name: 'Do Not Bill', value: 'do_not_bill' },
				],
				default: 'prorated_immediately',
				description: 'How to handle proration for this change',
			},
			{
				displayName: 'Collection Mode',
				name: 'collection_mode',
				type: 'options',
				options: COLLECTION_MODES,
				default: 'automatic',
				description: 'Collection mode for subscription',
			},
			{
				displayName: 'Billing Cycle Frequency',
				name: 'billing_cycle_frequency',
				type: 'number',
				default: 1,
				description: 'New billing cycle frequency',
			},
			{
				displayName: 'Billing Cycle Interval',
				name: 'billing_cycle_interval',
				type: 'options',
				options: BILLING_INTERVALS,
				default: 'month',
				description: 'New billing cycle interval',
			},
			{
				displayName: 'Custom Data',
				name: 'custom_data',
				type: 'string',
				default: '',
				description: 'Custom metadata as JSON string or key=value pairs',
			},
		],
	},

	// ----------------------------------
	//         subscription:update items
	// ----------------------------------
	{
		displayName: 'Items',
		name: 'items',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['update', 'previewUpdate'],
			},
		},
		default: {},
		options: [
			{
				name: 'itemValues',
				displayName: 'Item',
				values: [
					{
						displayName: 'Price ID',
						name: 'price_id',
						type: 'string',
						default: '',
						description: 'ID of the price to add or update',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						description: 'Quantity for this item',
					},
				],
			},
		],
		description: 'Items to add or update on the subscription',
	},

	// ----------------------------------
	//         subscription:pause
	// ----------------------------------
	{
		displayName: 'Pause Options',
		name: 'pauseOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['pause'],
			},
		},
		options: [
			{
				displayName: 'Effective From',
				name: 'effective_from',
				type: 'options',
				options: [
					{ name: 'Immediately', value: 'immediately' },
					{ name: 'Next Billing Period', value: 'next_billing_period' },
				],
				default: 'next_billing_period',
				description: 'When the pause should take effect',
			},
			{
				displayName: 'Resume At',
				name: 'resume_at',
				type: 'dateTime',
				default: '',
				description: 'When to automatically resume the subscription',
			},
		],
	},

	// ----------------------------------
	//         subscription:resume
	// ----------------------------------
	{
		displayName: 'Resume Options',
		name: 'resumeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['resume'],
			},
		},
		options: [
			{
				displayName: 'Effective From',
				name: 'effective_from',
				type: 'options',
				options: [
					{ name: 'Immediately', value: 'immediately' },
					{ name: 'Next Billing Period', value: 'next_billing_period' },
				],
				default: 'immediately',
				description: 'When the resume should take effect',
			},
		],
	},

	// ----------------------------------
	//         subscription:cancel
	// ----------------------------------
	{
		displayName: 'Cancel Options',
		name: 'cancelOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancel'],
			},
		},
		options: [
			{
				displayName: 'Effective From',
				name: 'effective_from',
				type: 'options',
				options: [
					{ name: 'Immediately', value: 'immediately' },
					{ name: 'Next Billing Period', value: 'next_billing_period' },
				],
				default: 'next_billing_period',
				description: 'When the cancellation should take effect',
			},
		],
	},

	// ----------------------------------
	//         subscription:createOneTimeCharge
	// ----------------------------------
	{
		displayName: 'Price ID',
		name: 'priceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['createOneTimeCharge'],
			},
		},
		description: 'ID of the price for the one-time charge',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['createOneTimeCharge'],
			},
		},
		description: 'Quantity for the one-time charge',
	},
	{
		displayName: 'Charge Options',
		name: 'chargeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['createOneTimeCharge'],
			},
		},
		options: [
			{
				displayName: 'Effective From',
				name: 'effective_from',
				type: 'options',
				options: [
					{ name: 'Immediately', value: 'immediately' },
					{ name: 'Next Billing Period', value: 'next_billing_period' },
				],
				default: 'next_billing_period',
				description: 'When to bill the charge',
			},
		],
	},

	// ----------------------------------
	//         subscription:getTransactions
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getTransactions'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getTransactions'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

export async function executeSubscriptionOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/subscriptions/${subscriptionId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status && (filters.status as string[]).length > 0) {
			query['status[]'] = filters.status;
		}
		if (filters.customer_id) {
			query['customer_id[]'] = (filters.customer_id as string).split(',').map((id) => id.trim());
		}
		if (filters.price_id) {
			query['price_id[]'] = (filters.price_id as string).split(',').map((id) => id.trim());
		}
		if (filters.collection_mode) query.collection_mode = filters.collection_mode;
		if (filters.scheduled_change_action) {
			query.scheduled_change_action = filters.scheduled_change_action;
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/subscriptions', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/subscriptions', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'update') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;
		const items = this.getNodeParameter('items', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.proration_billing_mode) {
			body.proration_billing_mode = updateFields.proration_billing_mode;
		}
		if (updateFields.collection_mode) body.collection_mode = updateFields.collection_mode;

		if (updateFields.billing_cycle_frequency && updateFields.billing_cycle_interval) {
			body.billing_cycle = {
				frequency: updateFields.billing_cycle_frequency,
				interval: updateFields.billing_cycle_interval,
			};
		}

		if (updateFields.custom_data) {
			body.custom_data = parseCustomData(updateFields.custom_data as string);
		}

		if (items.itemValues && (items.itemValues as IDataObject[]).length > 0) {
			body.items = (items.itemValues as IDataObject[]).map((item) => ({
				price_id: item.price_id,
				quantity: item.quantity,
			}));
		}

		responseData = await paddleApiRequest.call(
			this,
			'PATCH',
			`/subscriptions/${subscriptionId}`,
			cleanObject(body),
		);
	} else if (operation === 'pause') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const pauseOptions = this.getNodeParameter('pauseOptions', index) as IDataObject;

		const body: IDataObject = {};

		if (pauseOptions.effective_from) body.effective_from = pauseOptions.effective_from;
		if (pauseOptions.resume_at) body.resume_at = pauseOptions.resume_at;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/subscriptions/${subscriptionId}/pause`,
			cleanObject(body),
		);
	} else if (operation === 'resume') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const resumeOptions = this.getNodeParameter('resumeOptions', index) as IDataObject;

		const body: IDataObject = {};

		if (resumeOptions.effective_from) body.effective_from = resumeOptions.effective_from;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/subscriptions/${subscriptionId}/resume`,
			cleanObject(body),
		);
	} else if (operation === 'cancel') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const cancelOptions = this.getNodeParameter('cancelOptions', index) as IDataObject;

		const body: IDataObject = {};

		if (cancelOptions.effective_from) body.effective_from = cancelOptions.effective_from;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/subscriptions/${subscriptionId}/cancel`,
			cleanObject(body),
		);
	} else if (operation === 'activate') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/subscriptions/${subscriptionId}/activate`,
		);
	} else if (operation === 'getNextTransaction') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/subscriptions/${subscriptionId}/update-payment-method-transaction`,
		);
	} else if (operation === 'previewUpdate') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const items = this.getNodeParameter('items', index) as IDataObject;

		const body: IDataObject = {};

		if (items.itemValues && (items.itemValues as IDataObject[]).length > 0) {
			body.items = (items.itemValues as IDataObject[]).map((item) => ({
				price_id: item.price_id,
				quantity: item.quantity,
			}));
		}

		responseData = await paddleApiRequest.call(
			this,
			'PATCH',
			`/subscriptions/${subscriptionId}/preview`,
			cleanObject(body),
		);
	} else if (operation === 'getTransactions') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const query: IDataObject = {
			'subscription_id[]': [subscriptionId],
		};

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/transactions', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/transactions', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'createOneTimeCharge') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		const priceId = this.getNodeParameter('priceId', index) as string;
		const quantity = this.getNodeParameter('quantity', index) as number;
		const chargeOptions = this.getNodeParameter('chargeOptions', index) as IDataObject;

		const body: IDataObject = {
			items: [
				{
					price_id: priceId,
					quantity,
				},
			],
		};

		if (chargeOptions.effective_from) body.effective_from = chargeOptions.effective_from;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/subscriptions/${subscriptionId}/charge`,
			cleanObject(body),
		);
	} else if (operation === 'updatePaymentMethod') {
		const subscriptionId = this.getNodeParameter('subscriptionId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/subscriptions/${subscriptionId}/update-payment-method-transaction`,
		);
	} else {
		throw new Error(`Operation "${operation}" is not supported for subscription resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
