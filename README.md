# n8n-nodes-paddle

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for [Paddle](https://paddle.com), the complete payments infrastructure platform that acts as a Merchant of Record (MoR) for SaaS businesses. This node enables workflow automation for subscription management, transaction processing, customer lifecycle, and global tax compliance.

![n8n.io - Workflow Automation](https://img.shields.io/badge/n8n-community--node-brightgreen)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## Features

- **12 Resource Categories** - Products, Prices, Customers, Subscriptions, Transactions, Invoices, Addresses, Businesses, Discounts, Adjustments, Payouts, and Notification Settings
- **70+ Operations** - Full CRUD operations plus specialized actions like pause/resume subscriptions, preview calculations, and PDF generation
- **Webhook Trigger** - Real-time event notifications with HMAC-SHA256 signature verification
- **Cursor-Based Pagination** - Efficiently handle large datasets with automatic pagination
- **Full TypeScript Support** - Complete type definitions for all Paddle API entities
- **PDF Generation** - Download invoice and transaction PDFs directly
- **Global Tax Compliance** - Support for 200+ markets with automatic tax calculation

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-paddle`
5. Agree to the risks and select **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node
npm install n8n-nodes-paddle

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-paddle.git
cd n8n-nodes-paddle

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-paddle

# Restart n8n
n8n start
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **API Key** | Your Paddle API key (starts with `pdl_apikey_`) |
| **Environment** | Select `Sandbox` for testing or `Production` for live |

### Obtaining API Credentials

1. Log in to your [Paddle Dashboard](https://vendors.paddle.com)
2. Navigate to **Developer Tools** > **Authentication**
3. Create a new API key with appropriate permissions
4. Copy the key (69 characters, prefixed with `pdl_`)

## Resources & Operations

### Product
| Operation | Description |
|-----------|-------------|
| Create | Create a new product |
| Get | Get a product by ID |
| Get Many | List all products |
| Update | Update product details |
| Archive | Archive a product (soft delete) |
| Get Prices | Get prices for a product |

### Price
| Operation | Description |
|-----------|-------------|
| Create | Create a new price |
| Get | Get a price by ID |
| Get Many | List all prices |
| Update | Update price details |
| Archive | Archive a price |

### Customer
| Operation | Description |
|-----------|-------------|
| Create | Create a new customer |
| Get | Get a customer by ID |
| Get Many | List all customers |
| Update | Update customer details |
| Archive | Archive a customer |
| Get Addresses | List customer addresses |
| Create Address | Add an address |
| Get Businesses | List customer businesses |
| Create Business | Add a business |
| Get Subscriptions | List subscriptions |
| Get Transactions | List transactions |
| Get Credit Balances | View credit balances |
| Generate Auth Token | Generate portal auth token |

### Subscription
| Operation | Description |
|-----------|-------------|
| Get | Get a subscription by ID |
| Get Many | List all subscriptions |
| Update | Update subscription |
| Pause | Pause a subscription |
| Resume | Resume a paused subscription |
| Cancel | Cancel a subscription |
| Activate | Activate a trialing subscription |
| Get Next Transaction | Preview next billing |
| Preview Update | Preview subscription changes |
| Get Transactions | List subscription transactions |
| Create One-Time Charge | Add a one-time charge |
| Update Payment Method | Change payment method |

### Transaction
| Operation | Description |
|-----------|-------------|
| Create | Create a new transaction |
| Get | Get a transaction by ID |
| Get Many | List all transactions |
| Update | Update transaction (draft only) |
| Preview | Preview transaction calculation |
| Get Invoice | Download invoice PDF |

### Invoice
| Operation | Description |
|-----------|-------------|
| Get | Get an invoice by ID |
| Get Many | List all invoices |
| Issue | Issue an invoice |
| Cancel | Cancel an invoice |
| Get PDF | Download invoice PDF |

### Address
| Operation | Description |
|-----------|-------------|
| Create | Create address for customer |
| Get | Get an address by ID |
| Get Many | List customer addresses |
| Update | Update address details |
| Archive | Archive an address |

### Business
| Operation | Description |
|-----------|-------------|
| Create | Create business for customer |
| Get | Get a business by ID |
| Get Many | List customer businesses |
| Update | Update business details |
| Archive | Archive a business |

### Discount
| Operation | Description |
|-----------|-------------|
| Create | Create a new discount |
| Get | Get a discount by ID |
| Get Many | List all discounts |
| Update | Update discount |
| Archive | Archive a discount |

### Adjustment
| Operation | Description |
|-----------|-------------|
| Create | Create an adjustment (refund/credit) |
| Get | Get an adjustment by ID |
| Get Many | List all adjustments |
| Preview | Preview adjustment calculation |

### Payout
| Operation | Description |
|-----------|-------------|
| Get | Get a payout by ID |
| Get Many | List all payouts |

### Notification Setting
| Operation | Description |
|-----------|-------------|
| Create | Create notification destination |
| Get | Get a notification setting |
| Get Many | List notification settings |
| Update | Update notification setting |
| Delete | Delete notification setting |
| Replay | Replay a notification |

## Trigger Node

The **Paddle Trigger** node listens for webhook events from Paddle. Supported events include:

- **Transaction Events**: billed, canceled, completed, created, paid, past_due, payment_failed, ready, updated
- **Subscription Events**: activated, canceled, created, imported, past_due, paused, resumed, trialing, updated
- **Customer Events**: created, imported, updated
- **Address Events**: created, imported, updated
- **Business Events**: created, imported, updated
- **Adjustment Events**: created, updated
- **Payout Events**: created, paid
- **Product Events**: created, updated, imported
- **Price Events**: created, updated, imported
- **Discount Events**: created, updated, imported

### Webhook Verification

The trigger node supports HMAC-SHA256 signature verification. Provide your webhook secret from the Paddle dashboard to enable verification.

## Usage Examples

### Create a Product with Prices

```javascript
// 1. Create Product node
{
  "resource": "product",
  "operation": "create",
  "name": "Pro Plan",
  "taxCategory": "saas"
}

// 2. Create Price node (monthly)
{
  "resource": "price",
  "operation": "create",
  "productId": "{{$node['Create Product'].json.id}}",
  "description": "Monthly subscription",
  "unitPrice": "2999",
  "currencyCode": "USD",
  "billingCycleInterval": "month",
  "billingCycleFrequency": 1
}
```

### Handle Subscription Events

Use the Paddle Trigger to capture subscription lifecycle events and automate responses like sending emails, updating CRM, or provisioning access.

## Paddle Concepts

### Merchant of Record (MoR)
Paddle acts as the seller of your software, handling all payment processing, tax calculation, compliance, and fraud protection.

### Billing Cycles
Subscriptions can be billed on various intervals: daily, weekly, monthly, or yearly.

### Collection Modes
- **Automatic**: Paddle automatically charges the customer's payment method
- **Manual**: You control when transactions are created and completed

### Tax Categories
Products must be assigned a tax category for proper tax calculation:
- `digital-goods`, `ebooks`, `saas`, `professional-services`, etc.

## Error Handling

The node provides detailed error messages from the Paddle API:

```json
{
  "error": {
    "type": "request_error",
    "code": "not_found",
    "detail": "Customer with ID 'ctm_xxxxx' not found",
    "documentation_url": "https://developer.paddle.com/errors/not_found"
  }
}
```

Common error codes:
- `bad_request`: Invalid request format
- `invalid_field`: Field validation error
- `not_found`: Resource not found
- `conflict`: Resource state conflict
- `too_many_requests`: Rate limit exceeded

## Security Best Practices

1. **Use Environment Variables**: Store API keys securely in n8n credentials, never hardcode them
2. **Sandbox First**: Test all workflows in sandbox environment before going live
3. **Webhook Verification**: Always enable signature verification for webhook triggers
4. **Least Privilege**: Create API keys with only the permissions needed
5. **Monitor Activity**: Review API logs in Paddle dashboard regularly

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode during development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please read our contribution guidelines before submitting pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-paddle/issues)
- **Paddle Documentation**: [developer.paddle.com](https://developer.paddle.com)
- **n8n Documentation**: [docs.n8n.io](https://docs.n8n.io)

## Acknowledgments

- [Paddle](https://paddle.com) for their comprehensive Billing API
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for continuous feedback and support
