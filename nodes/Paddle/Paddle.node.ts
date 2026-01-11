/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { displayLicenseNotice } from './utils';

// Import operations and fields
import { productOperations, productFields, executeProductOperation } from './actions/product';
import { priceOperations, priceFields, executePriceOperation } from './actions/price';
import { customerOperations, customerFields, executeCustomerOperation } from './actions/customer';
import {
	subscriptionOperations,
	subscriptionFields,
	executeSubscriptionOperation,
} from './actions/subscription';
import {
	transactionOperations,
	transactionFields,
	executeTransactionOperation,
} from './actions/transaction';
import { invoiceOperations, invoiceFields, executeInvoiceOperation } from './actions/invoice';
import { addressOperations, addressFields, executeAddressOperation } from './actions/address';
import { businessOperations, businessFields, executeBusinessOperation } from './actions/business';
import { discountOperations, discountFields, executeDiscountOperation } from './actions/discount';
import {
	adjustmentOperations,
	adjustmentFields,
	executeAdjustmentOperation,
} from './actions/adjustment';
import { payoutOperations, payoutFields, executePayoutOperation } from './actions/payout';
import {
	notificationSettingOperations,
	notificationSettingFields,
	executeNotificationSettingOperation,
} from './actions/notificationSetting';

// Display license notice on load
displayLicenseNotice();

export class Paddle implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paddle',
		name: 'paddle',
		icon: 'file:paddle.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Paddle Billing API for subscription management and payment processing',
		defaults: {
			name: 'Paddle',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'paddleApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Adjustment',
						value: 'adjustment',
					},
					{
						name: 'Business',
						value: 'business',
					},
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Discount',
						value: 'discount',
					},
					{
						name: 'Invoice',
						value: 'invoice',
					},
					{
						name: 'Notification Setting',
						value: 'notificationSetting',
					},
					{
						name: 'Payout',
						value: 'payout',
					},
					{
						name: 'Price',
						value: 'price',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Subscription',
						value: 'subscription',
					},
					{
						name: 'Transaction',
						value: 'transaction',
					},
				],
				default: 'product',
			},
			// Product
			...productOperations,
			...productFields,
			// Price
			...priceOperations,
			...priceFields,
			// Customer
			...customerOperations,
			...customerFields,
			// Subscription
			...subscriptionOperations,
			...subscriptionFields,
			// Transaction
			...transactionOperations,
			...transactionFields,
			// Invoice
			...invoiceOperations,
			...invoiceFields,
			// Address
			...addressOperations,
			...addressFields,
			// Business
			...businessOperations,
			...businessFields,
			// Discount
			...discountOperations,
			...discountFields,
			// Adjustment
			...adjustmentOperations,
			...adjustmentFields,
			// Payout
			...payoutOperations,
			...payoutFields,
			// Notification Setting
			...notificationSettingOperations,
			...notificationSettingFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'product':
						result = await executeProductOperation.call(this, i);
						break;
					case 'price':
						result = await executePriceOperation.call(this, i);
						break;
					case 'customer':
						result = await executeCustomerOperation.call(this, i);
						break;
					case 'subscription':
						result = await executeSubscriptionOperation.call(this, i);
						break;
					case 'transaction':
						result = await executeTransactionOperation.call(this, i);
						break;
					case 'invoice':
						result = await executeInvoiceOperation.call(this, i);
						break;
					case 'address':
						result = await executeAddressOperation.call(this, i);
						break;
					case 'business':
						result = await executeBusinessOperation.call(this, i);
						break;
					case 'discount':
						result = await executeDiscountOperation.call(this, i);
						break;
					case 'adjustment':
						result = await executeAdjustmentOperation.call(this, i);
						break;
					case 'payout':
						result = await executePayoutOperation.call(this, i);
						break;
					case 'notificationSetting':
						result = await executeNotificationSettingOperation.call(this, i);
						break;
					default:
						throw new Error(`Resource "${resource}" is not supported`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
