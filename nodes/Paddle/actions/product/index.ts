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
import { TAX_CATEGORIES, PRODUCT_TYPES, STATUS_OPTIONS } from '../../constants';

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a product (soft delete)',
				action: 'Archive a product',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new product',
				action: 'Create a product',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a product by ID',
				action: 'Get a product',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many products',
				action: 'Get many products',
			},
			{
				name: 'Get Prices',
				value: 'getPrices',
				description: 'Get prices for a product',
				action: 'Get prices for a product',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a product',
				action: 'Update a product',
			},
		],
		default: 'getAll',
	},
];

export const productFields: INodeProperties[] = [
	// ----------------------------------
	//         product:get
	// ----------------------------------
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get', 'update', 'archive', 'getPrices'],
			},
		},
		description: 'The ID of the product (pro_xxxxx)',
	},

	// ----------------------------------
	//         product:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['product'],
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
				resource: ['product'],
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
				resource: ['product'],
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
				description: 'Filter by product status',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: PRODUCT_TYPES,
				default: '',
				description: 'Filter by product type',
			},
			{
				displayName: 'Tax Category',
				name: 'tax_category',
				type: 'options',
				options: TAX_CATEGORIES,
				default: '',
				description: 'Filter by tax category',
			},
			{
				displayName: 'Product IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of product IDs to filter by',
			},
		],
	},

	// ----------------------------------
	//         product:create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		description: 'Name of the product',
	},
	{
		displayName: 'Tax Category',
		name: 'taxCategory',
		type: 'options',
		required: true,
		options: TAX_CATEGORIES,
		default: 'saas',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		description: 'Tax category for the product',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the product',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				description: 'URL of the product image',
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
	//         product:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the product',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the product',
			},
			{
				displayName: 'Tax Category',
				name: 'tax_category',
				type: 'options',
				options: TAX_CATEGORIES,
				default: '',
				description: 'Tax category for the product',
			},
			{
				displayName: 'Image URL',
				name: 'image_url',
				type: 'string',
				default: '',
				description: 'URL of the product image',
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
	//         product:getPrices
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getPrices'],
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
				resource: ['product'],
				operation: ['getPrices'],
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

export async function executeProductOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const productId = this.getNodeParameter('productId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/products/${productId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status) query.status = filters.status;
		if (filters.type) query.type = filters.type;
		if (filters.tax_category) query.tax_category = filters.tax_category;
		if (filters.id) {
			query['id[]'] = (filters.id as string).split(',').map((id) => id.trim());
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/products', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/products', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const name = this.getNodeParameter('name', index) as string;
		const taxCategory = this.getNodeParameter('taxCategory', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			name,
			tax_category: taxCategory,
		};

		if (additionalFields.description) body.description = additionalFields.description;
		if (additionalFields.image_url) body.image_url = additionalFields.image_url;
		if (additionalFields.custom_data) {
			body.custom_data = parseCustomData(additionalFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'POST', '/products', cleanObject(body));
	} else if (operation === 'update') {
		const productId = this.getNodeParameter('productId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.description) body.description = updateFields.description;
		if (updateFields.tax_category) body.tax_category = updateFields.tax_category;
		if (updateFields.image_url) body.image_url = updateFields.image_url;
		if (updateFields.custom_data) {
			body.custom_data = parseCustomData(updateFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'PATCH', `/products/${productId}`, cleanObject(body));
	} else if (operation === 'archive') {
		const productId = this.getNodeParameter('productId', index) as string;
		responseData = await paddleApiRequest.call(this, 'POST', `/products/${productId}/archive`);
	} else if (operation === 'getPrices') {
		const productId = this.getNodeParameter('productId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const query: IDataObject = {
			'product_id[]': [productId],
		};

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
	} else {
		throw new Error(`Operation "${operation}" is not supported for product resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
