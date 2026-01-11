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
import { BUSINESS_STATUSES } from '../../constants';
import { cleanObject } from '../../utils';

export const businessOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['business'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a business',
				action: 'Archive a business',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a business for a customer',
				action: 'Create a business',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a business by ID',
				action: 'Get a business',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many businesses for a customer',
				action: 'Get many businesses',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a business',
				action: 'Update a business',
			},
		],
		default: 'getAll',
	},
];

export const businessFields: INodeProperties[] = [
	// ----------------------------------
	//         business:all
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['business'],
				operation: ['get', 'getAll', 'create', 'update', 'archive'],
			},
		},
		description: 'The ID of the customer (ctm_xxxxx)',
	},

	// ----------------------------------
	//         business:get/update/archive
	// ----------------------------------
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['business'],
				operation: ['get', 'update', 'archive'],
			},
		},
		description: 'The ID of the business (biz_xxxxx)',
	},

	// ----------------------------------
	//         business:create
	// ----------------------------------
	{
		displayName: 'Business Name',
		name: 'businessName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['business'],
				operation: ['create'],
			},
		},
		description: 'Name of the business',
	},

	// ----------------------------------
	//         business:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['business'],
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
				resource: ['business'],
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
				resource: ['business'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: BUSINESS_STATUSES,
				default: [],
				description: 'Filter by business status',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search businesses by string',
			},
		],
	},

	// ----------------------------------
	//         business:create additional
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['business'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Company Number',
				name: 'companyNumber',
				type: 'string',
				default: '',
				description: 'Company registration number',
			},
			{
				displayName: 'Contacts',
				name: 'contacts',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Business contacts',
				options: [
					{
						name: 'contactValues',
						displayName: 'Contact',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Contact name',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'Contact email',
							},
						],
					},
				],
			},
			{
				displayName: 'Custom Data',
				name: 'customData',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Tax Identifier',
				name: 'taxIdentifier',
				type: 'string',
				default: '',
				description: 'Tax/VAT identification number',
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
				resource: ['business'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Business Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the business',
			},
			{
				displayName: 'Company Number',
				name: 'companyNumber',
				type: 'string',
				default: '',
				description: 'Company registration number',
			},
			{
				displayName: 'Contacts',
				name: 'contacts',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Business contacts',
				options: [
					{
						name: 'contactValues',
						displayName: 'Contact',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Contact name',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'Contact email',
							},
						],
					},
				],
			},
			{
				displayName: 'Custom Data',
				name: 'customData',
				type: 'json',
				default: '{}',
				description: 'Custom metadata as JSON',
			},
			{
				displayName: 'Tax Identifier',
				name: 'taxIdentifier',
				type: 'string',
				default: '',
				description: 'Tax/VAT identification number',
			},
		],
	},
];

export async function executeBusinessOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const customerId = this.getNodeParameter('customerId', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const businessId = this.getNodeParameter('businessId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/customers/${customerId}/businesses/${businessId}`,
		);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;
		const query: IDataObject = {};

		if (filters.status && (filters.status as string[]).length > 0) {
			query['status[]'] = filters.status;
		}
		if (filters.search) {
			query.search = filters.search;
		}

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(
				this,
				'GET',
				`/customers/${customerId}/businesses`,
				{},
				query,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}/businesses`,
				{},
				query,
			);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const businessName = this.getNodeParameter('businessName', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			name: businessName,
		};

		if (additionalFields.companyNumber) {
			body.company_number = additionalFields.companyNumber;
		}
		if (additionalFields.taxIdentifier) {
			body.tax_identifier = additionalFields.taxIdentifier;
		}
		if (additionalFields.contacts) {
			const contactsData = additionalFields.contacts as IDataObject;
			if (contactsData.contactValues) {
				body.contacts = (contactsData.contactValues as IDataObject[]).map((contact) => ({
					name: contact.name,
					email: contact.email,
				}));
			}
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

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/customers/${customerId}/businesses`,
			cleanObject(body),
		);
	} else if (operation === 'update') {
		const businessId = this.getNodeParameter('businessId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.name) {
			body.name = updateFields.name;
		}
		if (updateFields.companyNumber !== undefined) {
			body.company_number = updateFields.companyNumber;
		}
		if (updateFields.taxIdentifier !== undefined) {
			body.tax_identifier = updateFields.taxIdentifier;
		}
		if (updateFields.contacts) {
			const contactsData = updateFields.contacts as IDataObject;
			if (contactsData.contactValues) {
				body.contacts = (contactsData.contactValues as IDataObject[]).map((contact) => ({
					name: contact.name,
					email: contact.email,
				}));
			}
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
			`/customers/${customerId}/businesses/${businessId}`,
			cleanObject(body),
		);
	} else if (operation === 'archive') {
		const businessId = this.getNodeParameter('businessId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'DELETE',
			`/customers/${customerId}/businesses/${businessId}`,
		);
	} else {
		throw new Error(`Operation "${operation}" is not supported for business resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
