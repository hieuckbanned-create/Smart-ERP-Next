jest.mock('@smart-erp/database', () => ({
  db: { select: jest.fn(), insert: jest.fn() },
}));
jest.mock('@smart-erp/database/schema', () => ({ customers: 'customers' }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn((f, v) => ({ op: 'eq', f, v })),
  and: jest.fn((...c: any[]) => ({ op: 'and', c })),
}));

import { CustomersService } from './customers.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';

const mockActivityService = { log: jest.fn() };

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CustomersService(mockActivityService as any);
  });

  it('is defined', () => expect(service).toBeDefined());

  it('create throws on duplicate code', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 'e' }]) }) });
    await expect(service.create('t1', 'u1', { code: 'DUP', name: 'T' } as any)).rejects.toThrow(ConflictException);
  });

  it('create succeeds with unique code', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'c-1' }]) }) });
    expect((await service.create('t1', 'u1', { code: 'C', name: 'T' } as any)).id).toBe('c-1');
  });

  it('findOne returns customer', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 'c-1' }]) }) });
    expect((await service.findOne('t1', 'c-1')).id).toBe('c-1');
  });

  it('findOne throws on missing', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    await expect(service.findOne('t1', 'x')).rejects.toThrow(NotFoundException);
  });
});
