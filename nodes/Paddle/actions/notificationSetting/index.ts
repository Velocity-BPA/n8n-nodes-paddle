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
import { WEBHOOK_EVENTS, NOTIFICATION_TYPES } from '../../constants';
import { cleanObject } from '../../utils';

export const notificationSettingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a notification destination',
				action: 'Create a notification setting',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a notification setting',
				action: 'Delete a notification setting',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a notification setting by ID',
				action: 'Get a notification setting',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many notification settings',
				action: 'Get many notification settings',
			},
			{
				name: 'Replay',
				value: 'replay',
				description: 'Replay a notification',
				action: 'Replay a notification',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a notification setting',
				action: 'Update a notification setting',
			},
		],
		default: 'getAll',
	},
];

export const notificationSettingFields: INodeProperties[] = [
	// ----------------------------------
	//         notificationSetting:get/update/delete
	// ----------------------------------
	{
		displayName: 'Notification Setting ID',
		name: 'notificationSettingId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The ID of the notification setting (ntfset_xxxxx)',
	},

	// ----------------------------------
	//         notificationSetting:replay
	// ----------------------------------
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['replay'],
			},
		},
		description: 'The ID of the notification to replay (ntf_xxxxx)',
	},

	// ----------------------------------
	//         notificationSetting:create
	// ----------------------------------
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['create'],
			},
		},
		description: 'Description of the notification setting',
	},
	{
		displayName: 'Destination',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['create'],
			},
		},
		description: 'Webhook URL or email address for notifications',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'url',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['create'],
			},
		},
		options: NOTIFICATION_TYPES,
		description: 'Type of notification destination',
	},
	{
		displayName: 'Subscribed Events',
		name: 'subscribedEvents',
		type: 'multiOptions',
		required: true,
		default: [],
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['create'],
			},
		},
		options: WEBHOOK_EVENTS,
		description: 'Events to subscribe to',
	},

	// ----------------------------------
	//         notificationSetting:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
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
				resource: ['notificationSetting'],
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

	// ----------------------------------
	//         notificationSetting:create additional
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['notificationSetting'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the notification setting is active',
			},
			{
				displayName: 'API Version',
				name: 'apiVersion',
				type: 'number',
				default: 1,
				description: 'API version for notification payloads',
			},
			{
				displayName: 'Include Sensitive Fields',
				name: 'includeSensitiveFields',
				type: 'boolean',
				default: false,
				description: 'Whether to include sensitive fields in payloads',
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
				resource: ['notificationSetting'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the notification setting is active',
			},
			{
				displayName: 'API Version',
				name: 'apiVersion',
				type: 'number',
				default: 1,
				description: 'API version for notification payloads',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the notification setting',
			},
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				description: 'Webhook URL or email address for notifications',
			},
			{
				displayName: 'Include Sensitive Fields',
				name: 'includeSensitiveFields',
				type: 'boolean',
				default: false,
				description: 'Whether to include sensitive fields in payloads',
			},
			{
				displayName: 'Subscribed Events',
				name: 'subscribedEvents',
				type: 'multiOptions',
				options: WEBHOOK_EVENTS,
				default: [],
				description: 'Events to subscribe to',
			},
		],
	},
];

export async function executeNotificationSettingOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'get') {
		const notificationSettingId = this.getNodeParameter('notificationSettingId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'GET',
			`/notification-settings/${notificationSettingId}`,
		);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		if (returnAll) {
			responseData = await paddleApiRequestAllItems.call(
				this,
				'GET',
				'/notification-settings',
				{},
				{},
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			const query: IDataObject = { per_page: limit };
			responseData = await paddleApiRequest.call(
				this,
				'GET',
				'/notification-settings',
				{},
				query,
			);
			if (Array.isArray(responseData)) {
				responseData = responseData.slice(0, limit);
			}
		}
	} else if (operation === 'create') {
		const description = this.getNodeParameter('description', index) as string;
		const destination = this.getNodeParameter('destination', index) as string;
		const type = this.getNodeParameter('type', index) as string;
		const subscribedEvents = this.getNodeParameter('subscribedEvents', index) as string[];
		const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

		const body: IDataObject = {
			description,
			destination,
			type,
			subscribed_events: subscribedEvents,
		};

		if (additionalFields.active !== undefined) {
			body.active = additionalFields.active;
		}
		if (additionalFields.apiVersion) {
			body.api_version = additionalFields.apiVersion;
		}
		if (additionalFields.includeSensitiveFields !== undefined) {
			body.include_sensitive_fields = additionalFields.includeSensitiveFields;
		}

		responseData = await paddleApiRequest.call(
			this,
			'POST',
			'/notification-settings',
			cleanObject(body),
		);
	} else if (operation === 'update') {
		const notificationSettingId = this.getNodeParameter('notificationSettingId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.description) {
			body.description = updateFields.description;
		}
		if (updateFields.destination) {
			body.destination = updateFields.destination;
		}
		if (updateFields.active !== undefined) {
			body.active = updateFields.active;
		}
		if (updateFields.apiVersion) {
			body.api_version = updateFields.apiVersion;
		}
		if (updateFields.includeSensitiveFields !== undefined) {
			body.include_sensitive_fields = updateFields.includeSensitiveFields;
		}
		if (updateFields.subscribedEvents && (updateFields.subscribedEvents as string[]).length > 0) {
			body.subscribed_events = updateFields.subscribedEvents;
		}

		responseData = await paddleApiRequest.call(
			this,
			'PATCH',
			`/notification-settings/${notificationSettingId}`,
			cleanObject(body),
		);
	} else if (operation === 'delete') {
		const notificationSettingId = this.getNodeParameter('notificationSettingId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'DELETE',
			`/notification-settings/${notificationSettingId}`,
		);
	} else if (operation === 'replay') {
		const notificationId = this.getNodeParameter('notificationId', index) as string;
		responseData = await paddleApiRequest.call(
			this,
			'POST',
			`/notifications/${notificationId}/replay`,
		);
	} else {
		throw new Error(
			`Operation "${operation}" is not supported for notificationSetting resource`,
		);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);

	return executionData;
}
