---
'antilopay-node': major
---

Bring the SDK fully in line with the Antilopay API documentation v1.53.

New features:

- Steam top-up API: `checkSteamAccount`, `createSteamTopup`, `getSteamTopupStatus` plus Steam top-up types and callback support.
- V2 / plural balance endpoints: `getAllProjectBalances()`, `getProjectBalanceV2()`, `getAllProjectBalancesV2()`.
- Optional `withdrawSecretKey` config for signing `withdraw/create` (falls back to `secretKey`), per Section 6.1.
- `X-Apay-Request-Id` capture via `getLastRequestId()` and `AntilopayApiError.requestId`.
- Top-up callbacks (`IAntilopayWebhookTopupResponse`) added to the webhook union; payment status and callbacks now type `refunds` and `customer`.
- `getPayoutStatus` / `getRefundStatus` accept either identifier; `createPayout`-adjacent payloads follow the documented `order_id` / `fee_type` field names.

Breaking changes (the old fields were silently ignored by the API or removed from the docs):

- `IAntilopayRecurrentPaymentIntent` is now a discriminated union.
- `IAntilopayRecurringPaymentCancel` now rejects passing `recurrentId` and `transactionId` together.
- Removed `fingerprint` from `IAntilopayCustomer` (dropped in doc v1.42).
- `IAntilopayPayout`: `orderId` → `order_id`, `feeType` → `fee_type`.
- Recurrent payment `type`: `'DAY'` removed (documented values are WEEK/MONTH/QUARTER/YEAR).
- `IAntilopayRecurringPaymentStatusResponse`: `payment_method` → `pay_method`.
