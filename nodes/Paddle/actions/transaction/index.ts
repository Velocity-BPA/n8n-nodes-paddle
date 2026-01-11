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
import { parseCustomData, cleanObject } from '../../utils';
import {
	TRANSACTION_STATUSES,
	TRANSACTION_ORIGINS,
	COLLECTION_MODES,
	CURRENCY_CODES,
} from '../../constants';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new transaction',
				action: 'Create a transaction',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a transaction by ID',
				action: 'Get a transaction',
			},
			{
				name: 'Get Invoice',
				value: 'getInvoice',
				description: 'Get invoice PDF for a transaction',
				action: 'Get invoice PDF',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many transactions',
				action: 'Get many transactions',
			},
			{
				name: 'Preview',
				value: 'preview',
				description: 'Preview transaction calculation',
				action: 'Preview a transaction',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a draft transaction',
				action: 'Update a transaction',
			},
		],
		default: 'getAll',
	},
];

export const transactionFields: INodeProperties[] = [
	// ----------------------------------
	//         transaction:get
	// ----------------------------------
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['get', 'update', 'getInvoice'],
			},
		},
		description: 'The ID of the transaction (txn_xxxxx)',
	},

	// ----------------------------------
	//         transaction:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['transaction'],
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
				resource: ['transaction'],
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
				resource: ['transaction'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: TRANSACTION_STATUSES,
				default: [],
				description: 'Filter by transaction status',
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
			{
				displayName: 'Invoice Number',
				name: 'invoice_number',
				type: 'string',
				default: '',
				description: 'Filter by invoice number',
			},
			{
				displayName: 'Origin',
				name: 'origin',
				type: 'options',
				options: TRANSACTION_ORIGINS,
				default: '',
				description: 'Filter by transaction origin',
			},
			{
				displayName: 'Collection Mode',
				name: 'collection_mode',
				type: 'options',
				options: COLLECTION_MODES,
				default: '',
				description: 'Filter by collection mode',
			},
		],
	},

	// ----------------------------------
	//         transaction:create
	// ----------------------------------
	{
		displayName: 'Items',
		name: 'items',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['create', 'preview'],
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
						description: 'ID of the price for this item',
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
		description: 'Items for the transaction',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'ID of the customer for this transaction',
			},
			{
				displayName: 'Address ID',
				name: 'address_id',
				type: 'string',
				default: '',
				description: 'ID of the address for this transaction',
			},
			{
				displayName: 'Business ID',
				name: 'business_id',
				type: 'string',
				default: '',
				description: 'ID of the business for this transaction',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'options',
				options: CURRENCY_CODES,
				default: 'USD',
				description: 'Currency for this transaction',
			},
			{
				displayName: 'Collection Mode',
				name: 'collection_mode',
				type: 'options',
				options: COLLECTION_MODES,
				default: 'automatic',
				description: 'Collection mode for the transaction',
			},
			{
				displayName: 'Discount ID',
				name: 'discount_id',
				type: 'string',
				default: '',
				description: 'ID of the discount to apply',
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
	//         transaction:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'ID of the customer for this transaction',
			},
			{
				displayName: 'Address ID',
				name: 'address_id',
				type: 'string',
				default: '',
				description: 'ID of the address for this transaction',
			},
			{
				displayName: 'Business ID',
				name: 'business_id',
				type: 'string',
				default: '',
				description: 'ID of the business for this transaction',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'options',
				options: CURRENCY_CODES,
				default: 'USD',
				description: 'Currency for this transaction',
			},
			{
				displayName: 'Collection Mode',
				name: 'collection_mode',
				type: 'options',
				options: COLLECTION_MODES,
				default: 'automatic',
				description: 'Collection mode for the transaction',
			},
			{
				displayName: 'Discount ID',
				name: 'discount_id',
				type: 'string',
				default: '',
				description: 'ID of the discount to apply',
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
	{
		displayName: 'Items',
		name: 'items',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['update'],
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
						description: 'ID of the price for this item',
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
		description: 'Items for the transaction',
	},

	// ----------------------------------
	//         transaction:preview
	// ----------------------------------
	{
		displayName: 'Preview Options',
		name: 'previewOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['preview'],
			},
		},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'ID of the customer for preview',
			},
			{
				displayName: 'Address ID',
				name: 'address_id',
				type: 'string',
				default: '',
				description: 'ID of the address for preview',
			},
			{
				displayName: 'Business ID',
				name: 'business_id',
				type: 'string',
				default: '',
				description: 'ID of the business for preview',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'options',
				options: CURRENCY_CODES,
				default: 'USD',
				description: 'Currency for preview',
			},
			{
				displayName: 'Discount ID',
				name: 'discount_id',
				type: 'string',
				default: '',
				description: 'ID of the discount to apply',
			},
			{
				displayName: 'Customer IP Address',
				name: 'customer_ip_address',
				type: 'string',
				default: '',
				description: 'IP address for tax calculation',
			},
			{
				displayName: 'Country Code',
				name: 'address_country_code',
				type: 'string',
				default: '',
				description: 'Country code for tax calculation (if no address)',
			},
			{
				displayName: 'Postal Code',
				name: 'address_postal_code',
				type: 'string',
				default: '',
				description: 'Postal code for tax calculation (if no address)',
			},
		],
	},

	// ----------------------------------
	//         transaction:getInvoice
	// ----------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getInvoice'],
			},
		},
		description: 'Name of the binary property to store the PDF',
	},
];

export async function executeTransactionOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/transactions/${transactionId}`);
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
		if (filters.invoice_number) query.invoice_number = filters.invoice_number;
		if (filters.origin) query.origin = filters.origin;
		if (filters.collection_mode) query.collection_mode = filters.collection_mode;

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
	} else if (operation === 'create') {
		const items = this.getNodeParameter('items', index) as IDataObject;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {};

		if (items.itemValues && (items.itemValues as IDataObject[]).length > 0) {
			body.items = (items.itemValues as IDataObject[]).map((item) => ({
				price_id: item.price_id,
				quantity: item.quantity,
			}));
		}

		if (additionalFields.customer_id) body.customer_id = additionalFields.customer_id;
		if (additionalFields.address_id) body.address_id = additionalFields.address_id;
		if (additionalFields.business_id) body.business_id = additionalFields.business_id;
		if (additionalFields.currency_code) body.currency_code = additionalFields.currency_code;
		if (additionalFields.collection_mode) body.collection_mode = additionalFields.collection_mode;
		if (additionalFields.discount_id) body.discount_id = additionalFields.discount_id;
		if (additionalFields.custom_data) {
			body.custom_data = parseCustomData(additionalFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'POST', '/transactions', cleanObject(body));
	} else if (operation === 'update') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;
		const items = this.getNodeParameter('items', index) as IDataObject;

		const body: IDataObject = {};

		if (items.itemValues && (items.itemValues as IDataObject[]).length > 0) {
			body.items = (items.itemValues as IDataObject[]).map((item) => ({
				price_id: item.price_id,
				quantity: item.quantity,
			}));
		}

		if (updateFields.customer_id) body.customer_id = updateFields.customer_id;
		if (updateFields.address_id) body.address_id = updateFields.address_id;
		if (updateFields.business_id) body.business_id = updateFields.business_id;
		if (updateFields.currency_code) body.currency_code = updateFields.currency_code;
		if (updateFields.collection_mode) body.collection_mode = updateFields.collection_mode;
		if (updateFields.discount_id) body.discount_id = updateFields.discount_id;
		if (updateFields.custom_data) {
			body.custom_data = parseCustomData(updateFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(
			this,
			'PATCH',
			`/transactions/${transactionId}`,
			cleanObject(body),
		);
	} else if (operation === 'preview') {
		const items = this.getNodeParameter('items', index) as IDataObject;
		const previewOptions = this.getNodeParameter('previewOptions', index) as IDataObject;

		const body: IDataObject = {};

		if (items.itemValues && (items.itemValues as IDataObject[]).length > 0) {
			body.items = (items.itemValues as IDataObject[]).map((item) => ({
				price_id: item.price_id,
				quantity: item.quantity,
			}));
		}

		if (previewOptions.customer_id) body.customer_id = previewOptions.customer_id;
		if (previewOptions.address_id) body.address_id = previewOptions.address_id;
		if (previewOptions.business_id) body.business_id = previewOptions.business_id;
		if (previewOptions.currency_code) body.currency_code = previewOptions.currency_code;
		if (previewOptions.discount_id) body.discount_id = previewOptions.discount_id;
		if (previewOptions.customer_ip_address) {
			body.customer_ip_address = previewOptions.customer_ip_address;
		}

		// Build address for preview if provided
		if (previewOptions.address_country_code) {
			body.address = {
				country_code: previewOptions.address_country_code,
			};
			if (previewOptions.address_postal_code) {
				(body.address as IDataObject).postal_code = previewOptions.address_postal_code;
			}
		}

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			'/transactions/preview',
			cleanObject(body),
		);
	} else if (operation === 'getInvoice') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;
		const binaryProperty = this.getNodeParameter('binaryProperty', index) as string;

		const pdfBuffer = await paddleApiDownloadFile.call(
			this,
			`/transactions/${transactionId}/invoice`,
		);

		const executionData = this.helpers.constructExecutionMetaData(
			[
				{
					json: { transactionId },
					binary: {
						[binaryProperty]: await this.helpers.prepareBinaryData(
							pdfBuffer,
							`invoice-${transactionId}.pdf`,
							'application/pdf',
						),
					},
				},
			],
			{ itemData: { item: index } },
		);

		return executionData;
	} else {
		throw new Error(`Operation "${operation}" is not supported for transaction resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
