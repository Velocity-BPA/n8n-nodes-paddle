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
import { ADJUSTMENT_ACTIONS, ADJUSTMENT_STATUSES } from '../../constants';
import { cleanObject } from '../../utils';

export const adjustmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['adjustment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create an adjustment (refund/credit)',
				action: 'Create an adjustment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an adjustment by ID',
				action: 'Get an adjustment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many adjustments',
				action: 'Get many adjustments',
			},
			{
				name: 'Preview',
				value: 'preview',
				description: 'Preview an adjustment calculation',
				action: 'Preview an adjustment',
			},
		],
		default: 'getAll',
	},
];

export const adjustmentFields: INodeProperties[] = [
	// ----------------------------------
	//         adjustment:get
	// ----------------------------------
	{
		displayName: 'Adjustment ID',
		name: 'adjustmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['adjustment'],
				operation: ['get'],
			},
		},
		description: 'The ID of the adjustment (adj_xxxxx)',
	},

	// ----------------------------------
	//         adjustment:create/preview
	// ----------------------------------
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['adjustment'],
				operation: ['create', 'preview'],
			},
		},
		description: 'The ID of the transaction to adjust (txn_xxxxx)',
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		default: 'refund',
		displayOptions: {
			show: {
				resource: ['adjustment'],
				operation: ['create', 'preview'],
			},
		},
		options: ADJUSTMENT_ACTIONS,
		description: 'Type of adjustment action',
	},
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['adjustment'],
				operation: ['create', 'preview'],
			},
		},
		description: 'Reason for the adjustment',
	},
	{
		displayName: 'Items',
		name: 'items',
		type: 'fixedCollection',
		required: true,
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['adjustment'],
				operation: ['create', 'preview'],
			},
		},
		description: 'Items to adjust',
		options: [
			{
				name: 'itemValues',
				displayName: 'Item',
				values: [
					{
						displayName: 'Item ID',
						name: 'itemId',
						type: 'string',
						default: '',
						description: 'Transaction item ID to adjust (txnitm_xxxxx)',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Full', value: 'full' },
							{ name: 'Partial', value: 'partial' },
							{ name: 'Proration', value: 'proration' },
						],
						default: 'full',
						description: 'Type of adjustment for this item',
					},
					{
						displayName: 'Amount',
						name: 'amount',
						type: 'string',
						default: '',
						description: 'Amount to adjust (required for partial type)',
					},
				],
			},
		],
	},

	// ----------------------------------
	//         adjustment:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['adjustment'],
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
				resource: ['adjustment'],
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
				resource: ['adjustment'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'multiOptions',
				options: ADJUSTMENT_ACTIONS,
				default: [],
				description: 'Filter by adjustment action',
			},
			{
				displayName: 'Customer IDs',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs to filter by',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: ADJUSTMENT_STATUSES,
				default: [],
				description: 'Filter by adjustment status',
			},
			{
				displayName: 'Subscription IDs',
				name: 'subscription_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of subscription IDs to filter by',
			},
			{
				displayName: 'Transaction IDs',
				name: 'transaction_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of transaction IDs to filter by',
			},
		],
	},
];

export async function executeAdjustmentOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const adjustmentId = this.getNodeParameter('adjustmentId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/adjustments/${adjustmentId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status && (filters.status as string[]).length > 0) {
			query['status[]'] = filters.status;
		}
		if (filters.action && (filters.action as string[]).length > 0) {
			query['action[]'] = filters.action;
		}
		if (filters.customer_id) {
			query['customer_id[]'] = (filters.customer_id as string).split(',').map((id) => id.trim());
		}
		if (filters.subscription_id) {
			query['subscription_id[]'] = (filters.subscription_id as string)
				.split(',')
				.map((id) => id.trim());
		}
		if (filters.transaction_id) {
			query['transaction_id[]'] = (filters.transaction_id as string)
				.split(',')
				.map((id) => id.trim());
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/adjustments', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/adjustments', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;
		const action = this.getNodeParameter('action', index) as string;
		const reason = this.getNodeParameter('reason', index) as string;
		const itemsData = this.getNodeParameter('items', index) as IDataObject;

		const items: IDataObject[] = [];
		if (itemsData.itemValues) {
			for (const item of itemsData.itemValues as IDataObject[]) {
				const adjustmentItem: IDataObject = {
					item_id: item.itemId,
					type: item.type,
				};
				if (item.type === 'partial' && item.amount) {
					adjustmentItem.amount = item.amount;
				}
				items.push(adjustmentItem);
			}
		}

		const body: IDataObject = {
			transaction_id: transactionId,
			action,
			reason,
			items,
		};

		responseData = await paddleApiRequest.call(this, 'POST', '/adjustments', cleanObject(body));
	} else if (operation === 'preview') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;
		const action = this.getNodeParameter('action', index) as string;
		const reason = this.getNodeParameter('reason', index) as string;
		const itemsData = this.getNodeParameter('items', index) as IDataObject;

		const items: IDataObject[] = [];
		if (itemsData.itemValues) {
			for (const item of itemsData.itemValues as IDataObject[]) {
				const adjustmentItem: IDataObject = {
					item_id: item.itemId,
					type: item.type,
				};
				if (item.type === 'partial' && item.amount) {
					adjustmentItem.amount = item.amount;
				}
				items.push(adjustmentItem);
			}
		}

		const body: IDataObject = {
			transaction_id: transactionId,
			action,
			reason,
			items,
		};

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			'/adjustments/preview',
			cleanObject(body),
		);
	} else {
		throw new Error(`Operation "${operation}" is not supported for adjustment resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
