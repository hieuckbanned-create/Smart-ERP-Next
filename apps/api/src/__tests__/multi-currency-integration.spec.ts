jest.mock('@nestjs/axios', () => ({
  HttpService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((f: any, v: any) => ({ op: 'eq', field: f, value: v })),
  and: jest.fn((...c: any[]) => ({ op: 'and', conditions: c })),
  desc: jest.fn((f: any) => ({ op: 'desc', field: f })),
  lte: jest.fn((f: any, v: any) => ({ op: 'lte', field: f, value: v })),
  sql: jest.fn((s: any) => ({ op: 'sql', value: s })),
}));

const mockDb: any = { select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() };

jest.mock('@smart-erp/database', () => ({ db: mockDb }));
jest.mock('@smart-erp/database/schema', () => ({
  tenants: {},
  currencies: {},
  exchangeRates: {},
}));

import { ExchangeRateService } from '../currencies/exchange-rate.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

describe('Multi-Currency Integration', () => {
  let exchangeRateService: ExchangeRateService;
  let currenciesService: CurrenciesService;
  let settingsService: SettingsService;
  const TENANT_ID = 'tenant-1';

  const mockSelectChain = (resolveValue: any) => {
    const chain: any = {
      from: jest.fn(() => chain),
      where: jest.fn(() => chain),
      orderBy: jest.fn(() => chain),
      limit: jest.fn(() => chain),
      then: jest.fn((resolve: any) => Promise.resolve(resolveValue).then(resolve)),
    };
    return chain;
  };

  const mockWriteChain = () => {
    const chain: any = {
      values: jest.fn(() => chain),
      set: jest.fn(() => chain),
      where: jest.fn(() => chain),
      returning: jest.fn(),
    };
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    currenciesService = new CurrenciesService();
    settingsService = new SettingsService();
    exchangeRateService = new ExchangeRateService(
      new ConfigService(),
      new HttpService(),
      { db: mockDb } as any,
    );
  });

  describe('ExchangeRateService', () => {
    describe('getSupportedCurrencies', () => {
      it('returns a list of supported currencies with code, name, and symbol', () => {
        const result = exchangeRateService.getSupportedCurrencies();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('code');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('symbol');
      });

      it('includes VND, USD, EUR in supported currencies', () => {
        const result = exchangeRateService.getSupportedCurrencies();
        const codes = result.map((c: any) => c.code);
        expect(codes).toContain('VND');
        expect(codes).toContain('USD');
        expect(codes).toContain('EUR');
      });

      it('each currency has a non-empty symbol', () => {
        const result = exchangeRateService.getSupportedCurrencies();
        for (const currency of result) {
          expect(currency.symbol).toBeTruthy();
        }
      });
    });
  });

  describe('CurrenciesService - convertAmount', () => {
    it('returns the same amount when from and to currencies are the same', async () => {
      const result = await currenciesService.convertAmount(TENANT_ID, 100, 'VND', 'VND');
      expect(result).toBe(100);
    });

    it('throws NotFoundException when source currency does not exist', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]));

      await expect(
        currenciesService.convertAmount(TENANT_ID, 100, 'XXX', 'VND'),
      ).rejects.toThrow('Currency not found');
    });

    it('converts amount when exchange rate exists', async () => {
      const usdCurrency = { id: 'cur-usd', code: 'USD', tenantId: TENANT_ID };
      const vndCurrency = { id: 'cur-vnd', code: 'VND', tenantId: TENANT_ID };
      const rateRecord = { id: 'rate-1', fromCurrencyId: 'cur-usd', toCurrencyId: 'cur-vnd', rate: '25450', effectiveDate: new Date() };

      mockDb.select
        .mockReturnValueOnce(mockSelectChain([usdCurrency]))
        .mockReturnValueOnce(mockSelectChain([vndCurrency]))
        .mockReturnValueOnce(mockSelectChain([rateRecord]));

      const result = await currenciesService.convertAmount(TENANT_ID, 100, 'USD', 'VND');
      expect(result).toBe(2545000);
    });
  });

  describe('SettingsService - Default Currency', () => {
    describe('getDefaultCurrency', () => {
      it('returns VND when no default currency is set', async () => {
        const tenant = { id: TENANT_ID, name: 'Test', slug: 'test', defaultCurrency: 'VND' };
        mockDb.select.mockReturnValue(mockSelectChain([tenant]));

        const result = await settingsService.getDefaultCurrency(TENANT_ID);
        expect(result).toEqual({ currency: 'VND' });
      });

      it('returns the default currency when set', async () => {
        const tenant = { id: TENANT_ID, name: 'Test', slug: 'test', defaultCurrency: 'USD' };
        mockDb.select.mockReturnValue(mockSelectChain([tenant]));

        const result = await settingsService.getDefaultCurrency(TENANT_ID);
        expect(result).toEqual({ currency: 'USD' });
      });

      it('throws NotFoundException for non-existent tenant', async () => {
        mockDb.select.mockReturnValue(mockSelectChain([]));

        await expect(settingsService.getDefaultCurrency('non-existent'))
          .rejects.toThrow('Tenant not found');
      });
    });

    describe('setDefaultCurrency', () => {
      it('updates and returns the new default currency', async () => {
        const tenant = { id: TENANT_ID, name: 'Test', slug: 'test', defaultCurrency: 'VND' };
        mockDb.select.mockReturnValue(mockSelectChain([tenant]));
        const writeChain = mockWriteChain();
        writeChain.returning.mockResolvedValue([{ ...tenant, defaultCurrency: 'USD' }]);
        mockDb.update.mockReturnValue(writeChain);

        const result = await settingsService.setDefaultCurrency(TENANT_ID, 'USD');
        expect(result).toEqual({ currency: 'USD' });
      });

      it('throws NotFoundException for non-existent tenant on update', async () => {
        mockDb.select.mockReturnValue(mockSelectChain([]));

        await expect(settingsService.setDefaultCurrency('non-existent', 'USD'))
          .rejects.toThrow('Tenant not found');
      });

      it('default currency persists after being set', async () => {
        const tenantBefore = { id: TENANT_ID, name: 'Test', slug: 'test', defaultCurrency: 'VND' };
        const tenantAfter = { id: TENANT_ID, name: 'Test', slug: 'test', defaultCurrency: 'EUR' };
        const writeChain = mockWriteChain();
        writeChain.returning.mockResolvedValue([tenantAfter]);

        mockDb.select.mockReturnValue(mockSelectChain([tenantBefore]));
        mockDb.update.mockReturnValue(writeChain);

        const setResult = await settingsService.setDefaultCurrency(TENANT_ID, 'EUR');
        expect(setResult).toEqual({ currency: 'EUR' });

        mockDb.select.mockReset();
        mockDb.select.mockReturnValue(mockSelectChain([tenantAfter]));

        const getResult = await settingsService.getDefaultCurrency(TENANT_ID);
        expect(getResult).toEqual({ currency: 'EUR' });
      });
    });
  });
});
