# Antilopay Node.js SDK

A TypeScript first SDK is designed to be used in Node.js (or equivalent environments) for Antilopay payment processor.

## Installation

`npm i antilopay-node`

## Features

- [x] Payment Creation
- [x] Payment Information
- [x] Webhook Notification
- [ ] Payment cancellation
- [ ] Withdraw creation
- [ ] Withdraw information
- [ ] Refund creation
- [ ] Refund information
- [ ] Project balance
- [ ] Error codes

## Example

```ts
const antilopay = AntilopayService.getInstance();

// Reading your secrets from an environment or a file...
const secretKey: string = fs.readFileSync("secretKey.txt", "utf-8");
const callbackKey: string = fs.readFileSync("callbackKey.txt", "utf-8");
const projectId: string = fs.readFileSync("projectId.txt", "utf-8");
const secretId: string = fs.readFileSync("secretId.txt", "utf-8");

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
  vat: 0,
});

// Payment intent response may something look like this:
{
  code: 0,
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
  // ... other details of the original payment
}
```
