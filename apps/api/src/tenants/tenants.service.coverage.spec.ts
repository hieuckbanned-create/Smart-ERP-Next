jest.mock('@smart-erp/database', () => ({ db: { select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() } }));
jest.mock('@smart-erp/database/schema', () => ({ tenants: 'tenants' }));
jest.mock('@smart-erp/database/drizzle', () => ({ eq: jest.fn((f, v) => ({ op: 'eq', f, v })) }));

import { TenantsService } from './tenants.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { db } from '@smart-erp/database';

function mockChain(base: any, methods: string[], finalResult: any) {
  let current = base;
  for (let i = 0; i < methods.length - 1; i++) {
    current[methods[i]] = jest.fn().mockReturnThis();
    current = current[methods[i]]();
  }
  if (methods.length > 0) {
    current[methods[methods.length - 1]] = jest.fn().mockResolvedValue(finalResult);
  }
}

describe('TenantsService', () => {
  let service: TenantsService;

  beforeEach(() => { jest.clearAllMocks(); service = new TenantsService(); });

  it('create throws on duplicate slug', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{}]) }) });
    await expect(service.create({ slug: 'dup', name: 'T' } as any)).rejects.toThrow(ConflictException);
  });

  it('create succeeds', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    (db.insert as jest.Mock).mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 't-1' }]) }) });
    expect((await service.create({ slug: 't', name: 'T' } as any)).id).toBe('t-1');
  });

  it('findAll returns list', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockResolvedValue([{ id: 't-1' }, { id: 't-2' }]) });
    const r = await service.findAll();
    expect(r).toHaveLength(2);
  });

  it('findOne returns tenant', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 't-1' }]) }) });
    expect((await service.findOne('t-1')).id).toBe('t-1');
  });

  it('findOne throws NotFoundException', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findBySlug returns tenant or undefined', async () => {
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 't-1' }]) }) });
    expect((await service.findBySlug('test')).id).toBe('t-1');
    (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }) });
    expect(await service.findBySlug('none')).toBeUndefined();
  });

  it('update modifies tenant', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 't-1', name: 'Updated' }]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    (db.update as jest.Mock).mockReturnValue({ set });
    const r = await service.update('t-1', { name: 'Updated' } as any);
    expect(r.name).toBe('Updated');
  });

  it('update throws NotFoundException', async () => {
    const returning = jest.fn().mockResolvedValue([]);
    (db.update as jest.Mock).mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning }) }) });
    await expect(service.update('x', {} as any)).rejects.toThrow(NotFoundException);
  });
});
