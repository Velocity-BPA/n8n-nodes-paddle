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
import { STATUS_OPTIONS, LOCALES } from '../../constants';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a customer',
				action: 'Archive a customer',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Create Address',
				value: 'createAddress',
				description: 'Create an address for a customer',
				action: 'Create address for customer',
			},
			{
				name: 'Create Business',
				value: 'createBusiness',
				description: 'Create a business for a customer',
				action: 'Create business for customer',
			},
			{
				name: 'Generate Auth Token',
				value: 'generateAuthToken',
				description: 'Generate customer portal auth token',
				action: 'Generate auth token',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a customer by ID',
				action: 'Get a customer',
			},
			{
				name: 'Get Addresses',
				value: 'getAddresses',
				description: 'Get addresses for a customer',
				action: 'Get customer addresses',
			},
			{
				name: 'Get Businesses',
				value: 'getBusinesses',
				description: 'Get businesses for a customer',
				action: 'Get customer businesses',
			},
			{
				name: 'Get Credit Balances',
				value: 'getCreditBalances',
				description: 'Get credit balances for a customer',
				action: 'Get credit balances',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many customers',
				action: 'Get many customers',
			},
			{
				name: 'Get Subscriptions',
				value: 'getSubscriptions',
				description: 'Get subscriptions for a customer',
				action: 'Get customer subscriptions',
			},
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Get transactions for a customer',
				action: 'Get customer transactions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a customer',
				action: 'Update a customer',
			},
		],
		default: 'getAll',
	},
];

export const customerFields: INodeProperties[] = [
	// ----------------------------------
	//         customer:get
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: [
					'get',
					'update',
					'archive',
					'getAddresses',
					'createAddress',
					'getBusinesses',
					'createBusiness',
					'getSubscriptions',
					'getTransactions',
					'getCreditBalances',
					'generateAuthToken',
				],
			},
		},
		description: 'The ID of the customer (ctm_xxxxx)',
	},

	// ----------------------------------
	//         customer:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
				resource: ['customer'],
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
				description: 'Filter by customer status',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Filter by customer email',
			},
			{
				displayName: 'Customer IDs',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Comma-separated list of customer IDs to filter by',
			},
		],
	},

	// ----------------------------------
	//         customer:create
	// ----------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		description: 'Email address of the customer',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the customer',
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'options',
				options: LOCALES,
				default: 'en',
				description: 'Preferred locale for communications',
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
	//         customer:update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the customer',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Full name of the customer',
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'options',
				options: LOCALES,
				default: 'en',
				description: 'Preferred locale for communications',
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
	//         customer:createAddress
	// ----------------------------------
	{
		displayName: 'Country Code',
		name: 'countryCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createAddress'],
			},
		},
		description: 'ISO 3166-1 alpha-2 country code',
	},
	{
		displayName: 'Address Fields',
		name: 'addressFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createAddress'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description for this address',
			},
			{
				displayName: 'First Line',
				name: 'first_line',
				type: 'string',
				default: '',
				description: 'Street address line 1',
			},
			{
				displayName: 'Second Line',
				name: 'second_line',
				type: 'string',
				default: '',
				description: 'Street address line 2',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City',
			},
			{
				displayName: 'Postal Code',
				name: 'postal_code',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'Region',
				name: 'region',
				type: 'string',
				default: '',
				description: 'State/province/region',
			},
		],
	},

	// ----------------------------------
	//         customer:createBusiness
	// ----------------------------------
	{
		displayName: 'Business Name',
		name: 'businessName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createBusiness'],
			},
		},
		description: 'Name of the business',
	},
	{
		displayName: 'Business Fields',
		name: 'businessFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createBusiness'],
			},
		},
		options: [
			{
				displayName: 'Company Number',
				name: 'company_number',
				type: 'string',
				default: '',
				description: 'Company registration number',
			},
			{
				displayName: 'Tax Identifier',
				name: 'tax_identifier',
				type: 'string',
				default: '',
				description: 'Tax/VAT ID',
			},
		],
	},

	// ----------------------------------
	//         customer:list operations
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['getAddresses', 'getBusinesses', 'getSubscriptions', 'getTransactions'],
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
				resource: ['customer'],
				operation: ['getAddresses', 'getBusinesses', 'getSubscriptions', 'getTransactions'],
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

export async function executeCustomerOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		responseData = await paddleApiRequest.call(this, 'GET', `/customers/${customerId}`);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status) query.status = filters.status;
		if (filters.email) query.email = filters.email;
		if (filters.id) {
			query['id[]'] = (filters.id as string).split(',').map((id) => id.trim());
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(this, 'GET', '/customers', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(this, 'GET', '/customers', {}, query);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const email = this.getNodeParameter('email', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = { email };

		if (additionalFields.name) body.name = additionalFields.name;
		if (additionalFields.locale) body.locale = additionalFields.locale;
		if (additionalFields.custom_data) {
			body.custom_data = parseCustomData(additionalFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'POST', '/customers', cleanObject(body));
	} else if (operation === 'update') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.email) body.email = updateFields.email;
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.locale) body.locale = updateFields.locale;
		if (updateFields.custom_data) {
			body.custom_data = parseCustomData(updateFields.custom_data as string);
		}

		responseData = await paddleApiRequest.call(this, 'PATCH', `/customers/${customerId}`, cleanObject(body));
	} else if (operation === 'archive') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		responseData = await paddleApiRequest.call(this, 'POST', `/customers/${customerId}/archive`);
	} else if (operation === 'getAddresses') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(
				this,
				'GET',
				`/customers/${customerId}/addresses`,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			responseData = await paddleApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}/addresses`,
				{},
				{ per_page: limit },
			);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'createAddress') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const countryCode = this.getNodeParameter('countryCode', index) as string;
		const addressFields = this.getNodeParameter('addressFields', index) as IDataObject;

		const body: IDataObject = {
			country_code: countryCode,
		};

		if (addressFields.description) body.description = addressFields.description;
		if (addressFields.first_line) body.first_line = addressFields.first_line;
		if (addressFields.second_line) body.second_line = addressFields.second_line;
		if (addressFields.city) body.city = addressFields.city;
		if (addressFields.postal_code) body.postal_code = addressFields.postal_code;
		if (addressFields.region) body.region = addressFields.region;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/customers/${customerId}/addresses`,
			cleanObject(body),
		);
	} else if (operation === 'getBusinesses') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(
				this,
				'GET',
				`/customers/${customerId}/businesses`,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			responseData = await paddleApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}/businesses`,
				{},
				{ per_page: limit },
			);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'createBusiness') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const businessName = this.getNodeParameter('businessName', index) as string;
		const businessFields = this.getNodeParameter('businessFields', index) as IDataObject;

		const body: IDataObject = {
			name: businessName,
		};

		if (businessFields.company_number) body.company_number = businessFields.company_number;
		if (businessFields.tax_identifier) body.tax_identifier = businessFields.tax_identifier;

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/customers/${customerId}/businesses`,
			cleanObject(body),
		);
	} else if (operation === 'getSubscriptions') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const query: IDataObject = {
			'customer_id[]': [customerId],
		};

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
	} else if (operation === 'getTransactions') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const query: IDataObject = {
			'customer_id[]': [customerId],
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
	} else if (operation === 'getCreditBalances') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/customers/${customerId}/credit-balances`,
		);
	} else if (operation === 'generateAuthToken') {
		const customerId = this.getNodeParameter('customerId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/customers/${customerId}/auth-token`,
		);
	} else {
		throw new Error(`Operation "${operation}" is not supported for customer resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
