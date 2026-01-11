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
import { DISCOUNT_STATUSES, DISCOUNT_TYPES, SUPPORTED_CURRENCIES } from '../../constants';
import { cleanObject } from '../../utils';

export const discountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['discount'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a discount',
				action: 'Archive a discount',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new discount',
				action: 'Create a discount',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a discount by ID',
				action: 'Get a discount',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many discounts',
				action: 'Get many discounts',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a discount',
				action: 'Update a discount',
			},
		],
		default: 'getAll',
	},
];

export const discountFields: INodeProperties[] = [
	// ----------------------------------
	//         discount:get/update/archive
	// ----------------------------------
	{
		displayName: 'Discount ID',
		name: 'discountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['get', 'update', 'archive'],
			},
		},
		description: 'The ID of the discount (dsc_xxxxx)',
	},

	// ----------------------------------
	//         discount:create
	// ----------------------------------
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['create'],
			},
		},
		description: 'Amount of the discount. For percentage, use value like "10" for 10%. For flat, use amount in smallest unit.',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['create'],
			},
		},
		description: 'Description of the discount',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'percentage',
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['create'],
			},
		},
		options: DISCOUNT_TYPES,
		description: 'Type of discount',
	},

	// ----------------------------------
	//         discount:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['discount'],
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
				resource: ['discount'],
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
				resource: ['discount'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Filter by discount code',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: DISCOUNT_STATUSES,
				default: [],
				description: 'Filter by discount status',
			},
		],
	},

	// ----------------------------------
	//         discount:create additional
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Unique discount code that customers can use at checkout',
			},
			{
				displayName: 'Currency Code',
				name: 'currencyCode',
				type: 'options',
				options: SUPPORTED_CURRENCIES,
				default: 'USD',
				description: 'Currency code for flat discounts (required for flat types)',
			},
			{
				displayName: 'Custom Data',
				name: 'customData',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Enabled For Checkout',
				name: 'enabledForCheckout',
				type: 'boolean',
				default: true,
				description: 'Whether this discount can be used at checkout',
			},
			{
				displayName: 'Expires At',
				name: 'expiresAt',
				type: 'dateTime',
				default: '',
				description: 'Date and time when the discount expires (RFC 3339)',
			},
			{
				displayName: 'Maximum Recurring Intervals',
				name: 'maximumRecurringIntervals',
				type: 'number',
				default: 0,
				description: 'Maximum number of billing periods discount applies to (0 for unlimited)',
			},
			{
				displayName: 'Recur',
				name: 'recur',
				type: 'boolean',
				default: true,
				description: 'Whether discount applies to recurring payments after first billing period',
			},
			{
				displayName: 'Restrict To Price IDs',
				name: 'restrictTo',
				type: 'string',
				default: '',
				description: 'Comma-separated list of price IDs this discount is restricted to',
			},
			{
				displayName: 'Usage Limit',
				name: 'usageLimit',
				type: 'number',
				default: 0,
				description: 'Maximum number of times discount can be used (0 for unlimited)',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['discount'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				description: 'Amount of the discount',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Unique discount code that customers can use at checkout',
			},
			{
				displayName: 'Currency Code',
				name: 'currencyCode',
				type: 'options',
				options: SUPPORTED_CURRENCIES,
				default: 'USD',
				description: 'Currency code for flat discounts',
			},
			{
				displayName: 'Custom Data',
				name: 'customData',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the discount',
			},
			{
				displayName: 'Enabled For Checkout',
				name: 'enabledForCheckout',
				type: 'boolean',
				default: true,
				description: 'Whether this discount can be used at checkout',
			},
			{
				displayName: 'Expires At',
				name: 'expiresAt',
				type: 'dateTime',
				default: '',
				description: 'Date and time when the discount expires (RFC 3339)',
			},
			{
				displayName: 'Maximum Recurring Intervals',
				name: 'maximumRecurringIntervals',
				type: 'number',
				default: 0,
				description: 'Maximum number of billing periods discount applies to (0 for unlimited)',
			},
			{
				displayName: 'Recur',
				name: 'recur',
				type: 'boolean',
				default: true,
				description: 'Whether discount applies to recurring payments after first billing period',
			},
			{
				displayName: 'Restrict To Price IDs',
				name: 'restrictTo',
				type: 'string',
				default: '',
				description: 'Comma-separated list of price IDs this discount is restricted to',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Archived', value: 'archived' },
				],
				default: 'active',
				description: 'Status of the discount',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: DISCOUNT_TYPES,
				default: 'percentage',
				description: 'Type of discount',
			},
			{
				displayName: 'Usage Limit',
				name: 'usageLimit',
				type: 'number',
				default: 0,
				description: 'Maximum number of times discount can be used (0 for unlimited)',
			},
		],
	},
];

export async function executeDiscountOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const discountId = this.getNodeParameter('discountId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/discounts/${discountId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status && (filters.status as string[]).length > 0) {
			query['status[]'] = filters.status;
		}
		if (filters.code) {
			query.code = filters.code;
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/discounts', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/discounts', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const amount = this.getNodeParameter('amount', index) as string;
		const description = this.getNodeParameter('description', index) as string;
		const type = this.getNodeParameter('type', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			amount,
			description,
			type,
		};

		if (additionalFields.enabledForCheckout !== undefined) {
			body.enabled_for_checkout = additionalFields.enabledForCheckout;
		}
		if (additionalFields.code) {
			body.code = additionalFields.code;
		}
		if (additionalFields.currencyCode) {
			body.currency_code = additionalFields.currencyCode;
		}
		if (additionalFields.recur !== undefined) {
			body.recur = additionalFields.recur;
		}
		if (additionalFields.maximumRecurringIntervals) {
			body.maximum_recurring_intervals = additionalFields.maximumRecurringIntervals;
		}
		if (additionalFields.usageLimit) {
			body.usage_limit = additionalFields.usageLimit;
		}
		if (additionalFields.restrictTo) {
			body.restrict_to = (additionalFields.restrictTo as string).split(',').map((id) => id.trim());
		}
		if (additionalFields.expiresAt) {
			body.expires_at = additionalFields.expiresAt;
		}
		if (additionalFields.customData) {
			try {
				body.custom_data =
					typeof additionalFields.customData === 'string'
						? JSON.parse(additionalFields.customData)
						: additionalFields.customData;
			} catch {
				body.custom_data = {};
			}
		}

		responseData = await paddleApiRequest.call(this, 'POST', '/discounts', cleanObject(body));
	} else if (operation === 'update') {
		const discountId = this.getNodeParameter('discountId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.amount) {
			body.amount = updateFields.amount;
		}
		if (updateFields.description) {
			body.description = updateFields.description;
		}
		if (updateFields.type) {
			body.type = updateFields.type;
		}
		if (updateFields.status) {
			body.status = updateFields.status;
		}
		if (updateFields.enabledForCheckout !== undefined) {
			body.enabled_for_checkout = updateFields.enabledForCheckout;
		}
		if (updateFields.code !== undefined) {
			body.code = updateFields.code;
		}
		if (updateFields.currencyCode) {
			body.currency_code = updateFields.currencyCode;
		}
		if (updateFields.recur !== undefined) {
			body.recur = updateFields.recur;
		}
		if (updateFields.maximumRecurringIntervals !== undefined) {
			body.maximum_recurring_intervals = updateFields.maximumRecurringIntervals;
		}
		if (updateFields.usageLimit !== undefined) {
			body.usage_limit = updateFields.usageLimit;
		}
		if (updateFields.restrictTo !== undefined) {
			if (updateFields.restrictTo) {
				body.restrict_to = (updateFields.restrictTo as string).split(',').map((id) => id.trim());
			} else {
				body.restrict_to = [];
			}
		}
		if (updateFields.expiresAt !== undefined) {
			body.expires_at = updateFields.expiresAt || null;
		}
		if (updateFields.customData) {
			try {
				body.custom_data =
					typeof updateFields.customData === 'string'
						? JSON.parse(updateFields.customData)
						: updateFields.customData;
			} catch {
				body.custom_data = {};
			}
		}

		responseData = await paddleApiRequest.call(
			this,
			'PATCH',
			`/discounts/${discountId}`,
			cleanObject(body),
		);
	} else if (operation === 'archive') {
		const discountId = this.getNodeParameter('discountId', index) as string;
		responseData = await paddleApiRequest.call(this, 'DELETE', `/discounts/${discountId}`);
	} else {
		throw new Error(`Operation "${operation}" is not supported for discount resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
