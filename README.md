# Antilopay Node.js SDK

A TypeScript first SDK designed to be used in Node.js (or equivalent environments) for Antilopay payment processor.

[![CI](https://github.com/phyziyx/antilopay-node/actions/workflows/ci.yml/badge.svg)](https://github.com/phyziyx/antilopay-node/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/antilopay-node)](https://www.npmjs.com/package/antilopay-node)
[![License](https://img.shields.io/npm/l/antilopay-node)](https://www.npmjs.com/package/antilopay-node)

## Features

This SDK implements all the features outlined in their API document up-to version 1.53 (dated 25.09.2026):

- [x] Payment Creation (incl. recurrent payments, `direct_nspk`, `use_captcha`, `skip_success_page`)
- [x] Payment Information (incl. refunds)
- [x] Recurring Payment Information & Cancellation
- [x] Webhook Notification (payment, withdraw, refund, steam top-up)
- [x] Payment Cancellation (reverse)
- [x] Withdraw Creation (incl. SBP, merchant `comment`)
- [x] Withdraw Information
- [x] Withdraw Rate
- [x] Refund Creation
- [x] Refund Information
- [x] Project Balance (v1 and v2, single project and all projects)
- [x] Steam Top-up (account check, creation, status)
- [x] Signature Verification (local, remote, and for payouts)

## Installation

`npm i antilopay-node`

## Example

```ts
const antilopay = AntilopayService.getInstance();

// Reading your secrets from an environment or a secret manager
const secretKey: string = process.env.SECRET_KEY;
const callbackKey: string = process.env.CALLBACK_KEY;
const projectId: string = process.env.PROJECT_ID;
const secretId: string = process.env.SECRET_ID;

// Setting up the Antilopay
antilopay.init({
	projectId: projectId,
	secretId: secretId,
	secretKey: `-----BEGIN RSA PRIVATE KEY-----\n${secretKey}\n-----END RSA PRIVATE KEY-----`,
	callbackKey: `-----BEGIN PUBLIC KEY-----\n${callbackKey}\n-----END PUBLIC KEY-----`,
});

// Create a payment intent
const paymentIntent = await antilopay.createPaymentIntent({
  amount: 10,
  order_id: "TEST1747319801189" // `TEST` + Date.now().toString(),
  currency: "RUB",
  customer: new AntilopayCustomer({
    email: "customer@example.com",
    address: "Moscow",
    fullName: "Customer Name",
    ipAddress: "127.0.0.1",
  }),
  description: "Testing Antilopay SDK",
  product_name: "Test Product",
  product_type: "goods",
  fail_url: "https://example.com/payment-fail",
  success_url: "https://example.com/payment-success",
  merchant_extra: JSON.stringify({
    via: "Website"
  }),
  params: {
    direct_nspk: true,
  },
  prefer_methods: ["CARD_RU", "SBP", "SBER_PAY"],
  product_quantity: 1,
});

// The SDK throws `AntilopayApiError` whenever the API responds with a
// non-zero code or an HTTP error occurs — a successful response means
// `code` was 0.
//
// Payment intent response may something look like this:
{
  payment_id: 'APAYXXXXXXXXXXXXXXXXXXXXX',
  direct_nspk: true,
  payment_url: 'https://qr.nspk.ru/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  transaction_id: 'APAYXXXXXXXXXXXXXXXXXXXXXT705C074C07A4375F'
}

// Getting the payment status
const paymentStatus = await antilopay.getPaymentStatus("TEST1747319801189");

// The payment status response may look like this:
{
  amount: 9.65,
  original_amount: 10,
  fee: 0,
  refunds: [], // refunds of the payment, when there are any
  // ... other details of the original payment
}
```

## Testing

Run the test suite with Vitest after installing dev dependencies:

```bash
npm install
npm test
```

For watch mode use:

```bash
npm run test:watch
```
