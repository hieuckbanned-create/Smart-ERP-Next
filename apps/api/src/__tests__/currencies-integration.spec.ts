jest.mock('drizzle-orm', () => ({
  eq: jest.fn((f: any, v: any) => ({ op: 'eq', field: f, value: v })),
  and: jest.fn((...c: any[]) => ({ op: 'and', conditions: c })),
  desc: jest.fn((f: any) => ({ op: 'desc', field: f })),
  gte: jest.fn((f: any, v: any) => ({ op: 'gte', field: f, value: v })),
  lte: jest.fn((f: any, v: any) => ({ op: 'lte', field: f, value: v })),
}));

const mockDb: any = { select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() };

jest.mock('@smart-erp/database', () => ({ db: mockDb }));
jest.mock('@smart-erp/database/schema', () => ({ currencies: {}, exchangeRates: {} }));

import { CurrenciesService } from '../currencies/currencies.service';

describe('CurrenciesService (integration)', () => {
  let service: CurrenciesService;
  const TENANT_ID = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CurrenciesService();
  });

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

  describe('create', () => {
    it('creates and returns a new currency', async () => {
      const dto = { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isBaseCurrency: false };
      const expected = { id: 'cur-1', tenantId: TENANT_ID, ...dto, decimalPlaces: '2', createdAt: expect.any(Date), updatedAt: expect.any(Date) };

      mockDb.select.mockReturnValue(mockSelectChain([]));
      const writeChain = mockWriteChain();
      writeChain.returning.mockResolvedValue([expected]);
      mockDb.insert.mockReturnValue(writeChain);

      const result = await service.create(TENANT_ID, dto as any);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('throws ConflictException when currency code already exists', async () => {
      const dto = { code: 'USD', name: 'US Dollar', symbol: '$' };
      mockDb.select.mockReturnValue(mockSelectChain([{ id: 'existing', code: 'USD' }]));

      await expect(service.create(TENANT_ID, dto as any)).rejects.toThrow('Currency code already exists for this tenant');
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('defaults decimalPlaces to "2" when not provided', async () => {
      const dto = { code: 'EUR', name: 'Euro', symbol: '€', isBaseCurrency: false };
      mockDb.select.mockReturnValue(mockSelectChain([]));
      const writeChain = mockWriteChain();
      writeChain.returning.mockResolvedValue([{ id: 'cur-2', decimalPlaces: '2' }]);
      mockDb.insert.mockReturnValue(writeChain);

      const result = await service.create(TENANT_ID, dto as any);

      expect(result.decimalPlaces).toBe('2');
    });
  });

  describe('findAll', () => {
    it('returns all currencies for a tenant', async () => {
      const currencies = [
        { id: 'cur-1', code: 'USD', name: 'US Dollar', symbol: '$', tenantId: TENANT_ID },
        { id: 'cur-2', code: 'VND', name: 'Vietnamese Dong', symbol: '₫', tenantId: TENANT_ID },
      ];
      mockDb.select.mockReturnValue(mockSelectChain(currencies));

      const result = await service.findAll(TENANT_ID);

      expect(result).toEqual(currencies);
    });

    it('returns empty array when no currencies exist', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]));

      const result = await service.findAll(TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns a currency by id', async () => {
      const currency = { id: 'cur-1', code: 'USD', name: 'US Dollar', symbol: '$', tenantId: TENANT_ID };
      mockDb.select.mockReturnValue(mockSelectChain([currency]));

      const result = await service.findOne(TENANT_ID, 'cur-1');

      expect(result).toEqual(currency);
    });

    it('throws NotFoundException when not found', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]));

      await expect(service.findOne(TENANT_ID, 'missing')).rejects.toThrow('Currency not found');
    });
  });

  describe('update', () => {
    it('updates and returns the currency', async () => {
      const existing = { id: 'cur-1', code: 'USD', name: 'US Dollar', symbol: '$', tenantId: TENANT_ID };
      mockDb.select.mockReturnValue(mockSelectChain([existing]));

      const updated = { ...existing, name: 'Updated Dollar' };
      const writeChain = mockWriteChain();
      writeChain.returning.mockResolvedValue([updated]);
      mockDb.update.mockReturnValue(writeChain);

      const result = await service.update(TENANT_ID, 'cur-1', { name: 'Updated Dollar' } as any);

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Dollar');
    });

    it('throws NotFoundException when currency not found', async () => {
      mockDb.select.mockReturnValue(mockSelectChain([]));

      await expect(service.update(TENANT_ID, 'missing', { name: 'Nope' } as any))
        .rejects.toThrow('Currency not found');
    });
  });

  describe('remove', () => {
    it('removes a non-base currency', async () => {
      const existing = { id: 'cur-1', code: 'USD', tenantId: TENANT_ID, isBaseCurrency: false };
      mockDb.select.mockReturnValue(mockSelectChain([existing]));

      const deleteChain = mockWriteChain();
      deleteChain.where.mockResolvedValue(undefined);
      mockDb.delete.mockReturnValue(deleteChain);

      const result = await service.remove(TENANT_ID, 'cur-1');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('throws ConflictException when removing base currency', async () => {
      const existing = { id: 'cur-base', code: 'VND', tenantId: TENANT_ID, isBaseCurrency: true };
      mockDb.select.mockReturnValue(mockSelectChain([existing]));

      await expect(service.remove(TENANT_ID, 'cur-base'))
        .rejects.toThrow('Cannot delete the base currency of the tenant');
    });
  });
});
