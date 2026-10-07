import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  AntilopayCustomer,
  AntilopayService,
  AntilopaySignatureError,
} from '../src/index.js';

describe('AntilopayCustomer', () => {
  it('throws when neither email nor phone provided', () => {
    expect(
      () =>
        new AntilopayCustomer({
          address: 'addr',
          ipAddress: '127.0.0.1',
          fullName: 'Joe',
        }),
    ).toThrow();
  });

  it('allows omitting the optional fields', () => {
    const c = new AntilopayCustomer({ email: 'a@b.test' });
    expect(c.toJSON()).toMatchObject({ email: 'a@b.test' });
  });

  it('toJSON returns expected shape', () => {
    const c = new AntilopayCustomer({
      email: 'a@b.test',
      address: 'addr',
      ipAddress: '1.2.3.4',
      fullName: 'Jane',
    });
    const json = c.toJSON();
    expect(json).toHaveProperty('email', 'a@b.test');
    expect(json).toHaveProperty('address');
    expect(json).toHaveProperty('ip');
    expect(json).toHaveProperty('fullname');
    // fingerprint was removed from the API in documentation v1.42
    expect(json).not.toHaveProperty('fingerprint');
  });
});

describe('AntilopayService', () => {
  it('should create a client with valid configuration', () => {
    const service = AntilopayService.getInstance();

    service.init({
      secretKey: 'secret',
      callbackKey: 'callback',
      projectId: 'project',
      secretId: 'secretId',
      withdrawSecretKey: 'withdraw-secret',
    });
    service.setApiVersion(2);

    expect(service).toBeInstanceOf(AntilopayService);
    expect(service.getProjectId()).toBe('project');
    expect(service.getSecretId()).toBe('secretId');
    expect(service.getApiVersion()).toBe(2);
    expect(service.getWithdrawSecretKey()).toBe('withdraw-secret');
  });

  it('singleton getInstance returns same instance and default baseUrl', () => {
    const a = AntilopayService.getInstance();
    const b = AntilopayService.getInstance();
    expect(a).toBe(b);
    expect(a.getBaseUrl()).toBe('https://lk.antilopay.com/api/v1');
    a.setBaseUrl('https://example.test');
    expect(a.getBaseUrl()).toBe('https://example.test');
    a.setBaseUrl('https://lk.antilopay.com/api/v1');
  });
});

describe('signatures', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const sign = (payload: object): string => {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(JSON.stringify(payload));
    return signer.sign(privateKey, 'base64');
  };

  it('verifies a valid callback signature', async () => {
    const service = AntilopayService.getInstance();
    service.init({
      projectId: 'project',
      secretId: 'secretId',
      secretKey: privateKey,
      callbackKey: publicKey,
    });

    const payload = {
      type: 'payment',
      payment_id: 'APAY4AA6BB4B1701155257296',
      amount: 100,
    };

    await expect(service.verifySignature(payload, sign(payload))).resolves.toBe(
      true,
    );
  });

  it('rejects a tampered payload', async () => {
    const service = AntilopayService.getInstance();
    const payload = { type: 'payment', amount: 100 };

    await expect(
      service.verifySignature({ type: 'payment', amount: 999 }, sign(payload)),
    ).resolves.toBe(false);
  });

  it('processWebhook throws AntilopaySignatureError on invalid signature', async () => {
    const service = AntilopayService.getInstance();
    const invalidSignature = crypto.randomBytes(256).toString('base64');

    await expect(
      service.processWebhook({ type: 'payment' }, invalidSignature),
    ).rejects.toThrow(AntilopaySignatureError);
  });
});

describe('request validation', () => {
  const service = AntilopayService.getInstance();

  it('getPayoutStatus requires withdrawId or orderId', async () => {
    await expect(service.getPayoutStatus()).rejects.toThrow(
      'Either withdrawId or orderId must be provided.',
    );
  });

  it('getRefundStatus requires refundId or orderId', async () => {
    await expect(service.getRefundStatus()).rejects.toThrow(
      'Either refundId or orderId must be provided.',
    );
  });
});
