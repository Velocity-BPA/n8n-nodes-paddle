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
import { CURRENCY_CODES, BILLING_INTERVALS, STATUS_OPTIONS } from '../../constants';

export const priceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['price'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a price',
				action: 'Archive a price',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new price',
				action: 'Create a price',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a price by ID',
				action: 'Get a price',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many prices',
				action: 'Get many prices',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a price',
				action: 'Update a price',
			},
		],
		default: 'getAll',
	},
];

export const priceFields: INodeProperties[] = [
	// ----------------------------------
	//         price:get
	// ----------------------------------
	{
		displayName: 'Price ID',
		name: 'priceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['get', 'update', 'archive'],
			},
		},
		description: 'The ID of the price (pri_xxxxx)',
	},

	// ----------------------------------
	//         price:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['price'],
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
				resource: ['price'],
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
				resource: ['price'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: STATUS_OPTIONS,
				default: 'active',
				description: 'Filter by price status',
			},
			{
				displayName: 'Product IDs',
				name: 'product_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of product IDs to filter by',
			},
			{
				displayName: 'Recurring',
				name: 'recurring',
				type: 'boolean',
				default: true,
				description: 'Whether to filter by recurring prices only',
			},
		],
	},

	// ----------------------------------
	//         price:create
	// ----------------------------------
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['create'],
			},
		},
		description: 'ID of the product this price is for',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['create'],
			},
		},
		description: 'Price amount in the smallest currency unit (e.g., cents)',
	},
	{
		displayName: 'Currency',
		name: 'currencyCode',
		type: 'options',
		required: true,
		options: CURRENCY_CODES,
		default: 'USD',
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['create'],
			},
		},
		description: 'Currency code for this price',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['create'],
			},
		},
		description: 'Internal description for this price',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of this price shown to customers',
			},
			{
				displayName: 'Billing Cycle Frequency',
				name: 'billingCycleFrequency',
				type: 'number',
				default: 1,
				description: 'Number of intervals between billing',
			},
			{
				displayName: 'Billing Cycle Interval',
				name: 'billingCycleInterval',
				type: 'options',
				options: BILLING_INTERVALS,
				default: 'month',
				description: 'Interval for billing cycle',
			},
			{
				displayName: 'Trial Frequency',
				name: 'trialFrequency',
				type: 'number',
				default: 0,
				description: 'Number of intervals for trial period',
			},
			{
				displayName: 'Trial Interval',
				name: 'trialInterval',
				type: 'options',
				options: BILLING_INTERVALS,
				default: 'day',
				description: 'Interval for trial period',
			},
			{
				displayName: 'Minimum Quantity',
				name: 'quantityMin',
				type: 'number',
				default: 1,
				description: 'Minimum quantity for this price',
			},
			{
				displayName: 'Maximum Quantity',
				name: 'quantityMax',
				type: 'number',
				default: 1,
				description: 'Maximum quantity for this price',
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
	//         price:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['price'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Internal description for this price',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of this price shown to customers',
			},
			{
				displayName: 'Billing Cycle Frequency',
				name: 'billingCycleFrequency',
				type: 'number',
				default: 1,
				description: 'Number of intervals between billing',
			},
			{
				displayName: 'Billing Cycle Interval',
				name: 'billingCycleInterval',
				type: 'options',
				options: BILLING_INTERVALS,
				default: 'month',
				description: 'Interval for billing cycle',
			},
			{
				displayName: 'Trial Frequency',
				name: 'trialFrequency',
				type: 'number',
				default: 0,
				description: 'Number of intervals for trial period',
			},
			{
				displayName: 'Trial Interval',
				name: 'trialInterval',
				type: 'options',
				options: BILLING_INTERVALS,
				default: 'day',
				description: 'Interval for trial period',
			},
			{
				displayName: 'Minimum Quantity',
				name: 'quantityMin',
				type: 'number',
				default: 1,
				description: 'Minimum quantity for this price',
			},
			{
				displayName: 'Maximum Quantity',
				name: 'quantityMax',
				type: 'number',
				default: 1,
				description: 'Maximum quantity for this price',
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
];

export async function executePriceOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const priceId = this.getNodeParameter('priceId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/prices/${priceId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status) query.status = filters.status;
		if (filters.product_id) {
			query['product_id[]'] = (filters.product_id as string).split(',').map((id) => id.trim());
		}
		if (filters.recurring !== undefined) query.recurring = filters.recurring;

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/prices', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/prices', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const productId = this.getNodeParameter('productId', index) as string;
		const amount = this.getNodeParameter('amount', index) as string;
		const currencyCode = this.getNodeParameter('currencyCode', index) as string;
		const description = this.getNodeParameter('description', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			product_id: productId,
			description,
			unit_price: {
				amount,
				currency_code: currencyCode,
			},
		};

		if (additionalFields.name) body.name = additionalFields.name;

		// Build billing cycle if provided
		if (additionalFields.billingCycleFrequency && additionalFields.billingCycleInterval) {
			body.billing_cycle = {
				frequency: additionalFields.billingCycleFrequency,
				interval: additionalFields.billingCycleInterval,
			};
		}

		// Build trial period if provided
		if (additionalFields.trialFrequency && additionalFields.trialInterval) {
			body.trial_period = {
				frequency: additionalFields.trialFrequency,
				interval: additionalFields.trialInterval,
			};
		}

		// Build quantity if provided
		if (additionalFields.quantityMin || additionalFields.quantityMax) {
			body.quantity = {
				minimum: additionalFields.quantityMin || 1,
				maximum: additionalFields.quantityMax || 1,
			};
		}

		if (additionalFields.custom_data) {
			body.custom_data = parseCustomData(additionalFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'POST', '/prices', cleanObject(body));
	} else if (operation === 'update') {
		const priceId = this.getNodeParameter('priceId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.description) body.description = updateFields.description;
		if (updateFields.name) body.name = updateFields.name;

		// Build billing cycle if provided
		if (updateFields.billingCycleFrequency && updateFields.billingCycleInterval) {
			body.billing_cycle = {
				frequency: updateFields.billingCycleFrequency,
				interval: updateFields.billingCycleInterval,
			};
		}

		// Build trial period if provided
		if (updateFields.trialFrequency && updateFields.trialInterval) {
			body.trial_period = {
				frequency: updateFields.trialFrequency,
				interval: updateFields.trialInterval,
			};
		}

		// Build quantity if provided
		if (updateFields.quantityMin || updateFields.quantityMax) {
			body.quantity = {
				minimum: updateFields.quantityMin || 1,
				maximum: updateFields.quantityMax || 1,
			};
		}

		if (updateFields.custom_data) {
			body.custom_data = parseCustomData(updateFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'PATCH', `/prices/${priceId}`, cleanObject(body));
	} else if (operation === 'archive') {
		const priceId = this.getNodeParameter('priceId', index) as string;
		responseData = await paddleApiRequest.call(this, 'POST', `/prices/${priceId}/archive`);
	} else {
		throw new Error(`Operation "${operation}" is not supported for price resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
