import { describe, it, expect } from 'vitest';
import { AntilopayCustomer, AntilopayService } from '../src/index.js';

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
  });
});

describe('AntilopayService', () => {
  it('singleton getInstance returns same instance and default baseUrl', () => {
    const a = AntilopayService.getInstance();
    const b = AntilopayService.getInstance();
    expect(a).toBe(b);
    expect(a.getBaseUrl()).toBe('https://lk.antilopay.com/api/v1');
    a.setBaseUrl('https://example.test');
    expect(a.getBaseUrl()).toBe('https://example.test');
  });
});
