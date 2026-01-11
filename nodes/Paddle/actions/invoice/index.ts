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
import { paddleApiRequest, paddleApiRequestAllItems, paddleApiDownloadFile } from '../../transport';
import { INVOICE_STATUSES } from '../../constants';

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel an invoice',
				action: 'Cancel an invoice',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an invoice by ID',
				action: 'Get an invoice',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many invoices',
				action: 'Get many invoices',
			},
			{
				name: 'Get PDF',
				value: 'getPdf',
				description: 'Download invoice PDF',
				action: 'Get invoice PDF',
			},
			{
				name: 'Issue',
				value: 'issue',
				description: 'Issue an invoice',
				action: 'Issue an invoice',
			},
		],
		default: 'getAll',
	},
];

export const invoiceFields: INodeProperties[] = [
	// ----------------------------------
	//         invoice:get
	// ----------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['get', 'issue', 'cancel', 'getPdf'],
			},
		},
		description: 'The ID of the invoice (inv_xxxxx)',
	},

	// ----------------------------------
	//         invoice:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['invoice'],
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
				resource: ['invoice'],
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
				resource: ['invoice'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: INVOICE_STATUSES,
				default: [],
				description: 'Filter by invoice status',
			},
			{
				displayName: 'Customer IDs',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs to filter by',
			},
			{
				displayName: 'Subscription IDs',
				name: 'subscription_id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of subscription IDs to filter by',
			},
		],
	},

	// ----------------------------------
	//         invoice:getPdf
	// ----------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getPdf'],
			},
		},
		description: 'Name of the binary property to store the PDF',
	},
];

export async function executeInvoiceOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const invoiceId = this.getNodeParameter('invoiceId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/invoices/${invoiceId}`);
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
		if (filters.subscription_id) {
			query['subscription_id[]'] = (filters.subscription_id as string)
				.split(',')
				.map((id) => id.trim());
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/invoices', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/invoices', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'issue') {
		const invoiceId = this.getNodeParameter('invoiceId', index) as string;
		responseData = await paddleApiRequest.call(this, 'POST', `/invoices/${invoiceId}/issue`);
	} else if (operation === 'cancel') {
		const invoiceId = this.getNodeParameter('invoiceId', index) as string;
		responseData = await paddleApiRequest.call(this, 'POST', `/invoices/${invoiceId}/cancel`);
	} else if (operation === 'getPdf') {
		const invoiceId = this.getNodeParameter('invoiceId', index) as string;
		const binaryProperty = this.getNodeParameter('binaryProperty', index) as string;

		const pdfBuffer = await paddleApiDownloadFile.call(this, `/invoices/${invoiceId}/pdf`);

		const executionData = this.helpers.constructExecutionMetaData(
			[
				{
					json: { invoiceId },
					binary: {
						[binaryProperty]: await this.helpers.prepareBinaryData(
							pdfBuffer,
							`invoice-${invoiceId}.pdf`,
							'application/pdf',
						),
					},
				},
			],
			{ itemData: { item: index } },
		);

		return executionData;
	} else {
		throw new Error(`Operation "${operation}" is not supported for invoice resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
