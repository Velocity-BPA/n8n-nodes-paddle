/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

import { WEBHOOK_EVENTS } from './constants';
import { paddleApiRequest } from './transport';
import { verifyWebhookSignature, displayLicenseNotice } from './utils';

// Display license notice on load
displayLicenseNotice();

export class PaddleTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paddle Trigger',
		name: 'paddleTrigger',
		icon: 'file:paddle.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].length > 0 ? $parameter["events"].join(", ") : "All Events"}}',
		description: 'Starts the workflow when Paddle events occur',
		defaults: {
			name: 'Paddle Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'paddleApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: WEBHOOK_EVENTS,
				default: [],
				required: true,
				description: 'The events to listen to. Leave empty to receive all events.',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Webhook Secret',
						name: 'webhookSecret',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Secret key used to verify webhook signatures. Find this in your Paddle dashboard under Developer Tools > Notifications.',
					},
					{
						displayName: 'Include Sensitive Fields',
						name: 'includeSensitiveFields',
						type: 'boolean',
						default: false,
						description: 'Whether webhook payloads should include sensitive fields',
					},
					{
						displayName: 'API Version',
						name: 'apiVersion',
						type: 'number',
						default: 1,
						description: 'API version for webhook payloads',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				// Check if we have a stored notification setting ID
				if (webhookData.notificationSettingId) {
					try {
						await paddleApiRequest.call(
							this,
							'GET',
							`/notification-settings/${webhookData.notificationSettingId}`,
						);
						return true;
					} catch {
						// Setting was deleted externally
						delete webhookData.notificationSettingId;
						return false;
					}
				}

				// Check if webhook already exists for this URL
				try {
					const response = await paddleApiRequest.call(
						this,
						'GET',
						'/notification-settings',
					);

					if (Array.isArray(response)) {
						const existingWebhook = response.find(
							(setting: IDataObject) => setting.destination === webhookUrl,
						);
						if (existingWebhook) {
							webhookData.notificationSettingId = existingWebhook.id;
							return true;
						}
					}
				} catch {
					// Ignore errors during check
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events', []) as string[];
				const options = this.getNodeParameter('options', {}) as IDataObject;
				const webhookData = this.getWorkflowStaticData('node');

				// Build subscribed events list
				let subscribedEvents: string[];
				if (events.length === 0) {
					// Subscribe to all events if none selected
					subscribedEvents = WEBHOOK_EVENTS.map((e) => e.value);
				} else {
					subscribedEvents = events;
				}

				const body: IDataObject = {
					description: `n8n Webhook - ${this.getWorkflow().name || 'Workflow'}`,
					destination: webhookUrl,
					type: 'url',
					subscribed_events: subscribedEvents,
					active: true,
				};

				if (options.includeSensitiveFields !== undefined) {
					body.include_sensitive_fields = options.includeSensitiveFields;
				}
				if (options.apiVersion) {
					body.api_version = options.apiVersion;
				}

				try {
					const response = (await paddleApiRequest.call(
						this,
						'POST',
						'/notification-settings',
						body,
					)) as IDataObject;

					webhookData.notificationSettingId = response.id;
					return true;
				} catch (error) {
					return false;
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.notificationSettingId) {
					try {
						await paddleApiRequest.call(
							this,
							'DELETE',
							`/notification-settings/${webhookData.notificationSettingId}`,
						);
					} catch {
						// Ignore errors during deletion
					}

					delete webhookData.notificationSettingId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Verify webhook signature if secret is provided
		if (options.webhookSecret) {
			const signature = req.headers['paddle-signature'] as string;
			const timestamp = signature?.split(';').find((p: string) => p.startsWith('ts='))?.slice(3);

			if (!signature || !timestamp) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Missing signature or timestamp' },
					},
				};
			}

			const rawBody = JSON.stringify(body);
			const isValid = verifyWebhookSignature(
				rawBody,
				signature,
				timestamp,
				options.webhookSecret as string,
			);

			if (!isValid) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Invalid signature' },
					},
				};
			}
		}

		// Filter by event type if specific events are selected
		const eventType = body.event_type as string;
		if (events.length > 0 && !events.includes(eventType)) {
			// Return empty response for non-matching events
			return {
				webhookResponse: {
					status: 200,
					body: { received: true, filtered: true },
				},
			};
		}

		// Return webhook data
		return {
			workflowData: [
				this.helpers.returnJsonArray({
					event_type: body.event_type,
					event_id: body.event_id,
					occurred_at: body.occurred_at,
					notification_id: body.notification_id,
					data: body.data,
				}),
			],
		};
	}
}
