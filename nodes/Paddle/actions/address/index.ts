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
import { ADDRESS_STATUSES, COUNTRY_CODES } from '../../constants';
import { cleanObject } from '../../utils';

export const addressOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['address'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive an address',
				action: 'Archive an address',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create an address for a customer',
				action: 'Create an address',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an address by ID',
				action: 'Get an address',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many addresses for a customer',
				action: 'Get many addresses',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an address',
				action: 'Update an address',
			},
		],
		default: 'getAll',
	},
];

export const addressFields: INodeProperties[] = [
	// ----------------------------------
	//         address:all
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['get', 'getAll', 'create', 'update', 'archive'],
			},
		},
		description: 'The ID of the customer (ctm_xxxxx)',
	},

	// ----------------------------------
	//         address:get/update/archive
	// ----------------------------------
	{
		displayName: 'Address ID',
		name: 'addressId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['get', 'update', 'archive'],
			},
		},
		description: 'The ID of the address (add_xxxxx)',
	},

	// ----------------------------------
	//         address:create
	// ----------------------------------
	{
		displayName: 'Country Code',
		name: 'countryCode',
		type: 'options',
		required: true,
		default: 'US',
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['create'],
			},
		},
		options: COUNTRY_CODES,
		description: 'ISO 3166-1 alpha-2 country code',
	},

	// ----------------------------------
	//         address:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['address'],
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
				resource: ['address'],
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
				resource: ['address'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: ADDRESS_STATUSES,
				default: [],
				description: 'Filter by address status',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search addresses by string',
			},
		],
	},

	// ----------------------------------
	//         address:create/update additional
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City name',
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
				description: 'Address description',
			},
			{
				displayName: 'First Line',
				name: 'firstLine',
				type: 'string',
				default: '',
				description: 'First line of the address (street address)',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'ZIP or postal code',
			},
			{
				displayName: 'Region',
				name: 'region',
				type: 'string',
				default: '',
				description: 'State, county, or region',
			},
			{
				displayName: 'Second Line',
				name: 'secondLine',
				type: 'string',
				default: '',
				description: 'Second line of the address',
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
				resource: ['address'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City name',
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'options',
				options: COUNTRY_CODES,
				default: 'US',
				description: 'ISO 3166-1 alpha-2 country code',
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
				description: 'Address description',
			},
			{
				displayName: 'First Line',
				name: 'firstLine',
				type: 'string',
				default: '',
				description: 'First line of the address (street address)',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'ZIP or postal code',
			},
			{
				displayName: 'Region',
				name: 'region',
				type: 'string',
				default: '',
				description: 'State, county, or region',
			},
			{
				displayName: 'Second Line',
				name: 'secondLine',
				type: 'string',
				default: '',
				description: 'Second line of the address',
			},
		],
	},
];

export async function executeAddressOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const customerId = this.getNodeParameter('customerId', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const addressId = this.getNodeParameter('addressId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/customers/${customerId}/addresses/${addressId}`,
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
				`/customers/${customerId}/addresses`,
				{},
				query,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			query.per_page = limit;
			responseData = await paddleApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}/addresses`,
				{},
				query,
			);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const countryCode = this.getNodeParameter('countryCode', index) as string;
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			country_code: countryCode,
		};

		if (additionalFields.description) {
			body.description = additionalFields.description;
		}
		if (additionalFields.firstLine) {
			body.first_line = additionalFields.firstLine;
		}
		if (additionalFields.secondLine) {
			body.second_line = additionalFields.secondLine;
		}
		if (additionalFields.city) {
			body.city = additionalFields.city;
		}
		if (additionalFields.postalCode) {
			body.postal_code = additionalFields.postalCode;
		}
		if (additionalFields.region) {
			body.region = additionalFields.region;
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
			`/customers/${customerId}/addresses`,
			cleanObject(body),
		);
	} else if (operation === 'update') {
		const addressId = this.getNodeParameter('addressId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.countryCode) {
			body.country_code = updateFields.countryCode;
		}
		if (updateFields.description !== undefined) {
			body.description = updateFields.description;
		}
		if (updateFields.firstLine !== undefined) {
			body.first_line = updateFields.firstLine;
		}
		if (updateFields.secondLine !== undefined) {
			body.second_line = updateFields.secondLine;
		}
		if (updateFields.city !== undefined) {
			body.city = updateFields.city;
		}
		if (updateFields.postalCode !== undefined) {
			body.postal_code = updateFields.postalCode;
		}
		if (updateFields.region !== undefined) {
			body.region = updateFields.region;
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
			`/customers/${customerId}/addresses/${addressId}`,
			cleanObject(body),
		);
	} else if (operation === 'archive') {
		const addressId = this.getNodeParameter('addressId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'DELETE',
			`/customers/${customerId}/addresses/${addressId}`,
		);
	} else {
		throw new Error(`Operation "${operation}" is not supported for address resource`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
