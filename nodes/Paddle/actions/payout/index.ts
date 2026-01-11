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
import { PAYOUT_STATUSES } from '../../constants';

export const payoutOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['payout'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a payout by ID',
				action: 'Get a payout',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many payouts',
				action: 'Get many payouts',
			},
		],
		default: 'getAll',
	},
];

export const payoutFields: INodeProperties[] = [
	// ----------------------------------
	//         payout:get
	// ----------------------------------
	{
		displayName: 'Payout ID',
		name: 'payoutId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['payout'],
				operation: ['get'],
			},
		},
		description: 'The ID of the payout (pay_xxxxx)',
	},

	// ----------------------------------
	//         payout:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['payout'],
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
				resource: ['payout'],
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
				resource: ['payout'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: PAYOUT_STATUSES,
				default: [],
				description: 'Filter by payout status',
			},
		],
	},
];

export async function executePayoutOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const payoutId = this.getNodeParameter('payoutId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/payouts/${payoutId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status && (filters.status as string[]).length > 0) {
			query['status[]'] = filters.status;
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/payouts', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/payouts', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else {
		throw new Error(`Operation "${operation}" is not supported for payout resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
