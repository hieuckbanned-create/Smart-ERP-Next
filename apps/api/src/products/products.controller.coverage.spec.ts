import { BadRequestException } from '@nestjs/common';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { ProductsController } from './products.controller';

describe('ProductsController coverage', () => {
  const req = { user: { tenantId: 'tenant-coverage', sub: 'user-coverage' } };
  const service = {
    adjustStock: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAllForExport: jest.fn(),
    findBySku: jest.fn(),
    findCategories: jest.fn(),
    findOne: jest.fn(),
    getTransactions: jest.fn(),
    importFromCsv: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };
  const controller = new ProductsController(service as any);

  const uploadDir = join(process.cwd(), 'uploads', 'products', req.user.tenantId);

  beforeEach(() => {
    jest.clearAllMocks();
    if (existsSync(uploadDir)) rmSync(uploadDir, { recursive: true, force: true });
  });

  afterAll(() => {
    if (existsSync(uploadDir)) rmSync(uploadDir, { recursive: true, force: true });
  });

  it('delegates product endpoints with tenant and user context', async () => {
    const product = { name: 'Coffee', sku: 'CF-1' };
    const query = { limit: 10, page: 2 };
    const update = { name: 'Tea' };
    const stock = { notes: 'restock', quantity: 5, reference: 'po-1', type: 'IN' as const };
    service.findAllForExport.mockResolvedValueOnce([product]);

    controller.create(req, product as any);
    controller.findAll(req, query as any);
    controller.findBySku(req, 'CF-1');
    await expect(controller.exportProducts(req, query as any)).resolves.toEqual({ items: [product] });
    controller.findCategories(req);
    controller.findOne(req, 'product-1', 'vi');
    controller.update(req, 'product-1', update as any);
    controller.remove(req, 'product-1');
    controller.adjustStock(req, 'product-1', stock);
    await controller.importProducts(req, { buffer: Buffer.from('sku,name\nCF-1,Coffee') });
    controller.getTransactions(req, 'product-1');

    expect(service.create).toHaveBeenCalledWith(req.user.tenantId, product, req.user.sub);
    expect(service.findAll).toHaveBeenCalledWith(req.user.tenantId, query);
    expect(service.findBySku).toHaveBeenCalledWith(req.user.tenantId, 'CF-1');
    expect(service.findAllForExport).toHaveBeenCalledWith(req.user.tenantId, query);
    expect(service.findCategories).toHaveBeenCalledWith(req.user.tenantId);
    expect(service.findOne).toHaveBeenCalledWith(req.user.tenantId, 'product-1', 'vi');
    expect(service.update).toHaveBeenCalledWith(req.user.tenantId, 'product-1', update, req.user.sub);
    expect(service.remove).toHaveBeenCalledWith(req.user.tenantId, 'product-1', req.user.sub);
    expect(service.adjustStock).toHaveBeenCalledWith(
      req.user.tenantId,
      'product-1',
      stock.quantity,
      stock.type,
      stock.notes,
      stock.reference,
      req.user.sub,
    );
    expect(service.importFromCsv).toHaveBeenCalledWith(
      req.user.tenantId,
      Buffer.from('sku,name\nCF-1,Coffee'),
    );
    expect(service.getTransactions).toHaveBeenCalledWith(req.user.tenantId, 'product-1');
  });

  it('stores uploaded product images under the tenant upload path', () => {
    const uploaded = controller.uploadImage(req, {
      buffer: Buffer.from('image-bytes'),
      mimetype: 'image/png',
      size: 11,
    } as any);

    expect(uploaded).toMatchObject({
      imageUrl: expect.stringMatching(/^\/uploads\/products\/tenant-coverage\/.+\.png$/),
      mimeType: 'image/png',
      size: 11,
    });
    expect(uploaded.filename).toMatch(/\.png$/);
    expect(existsSync(join(process.cwd(), uploaded.imageUrl))).toBe(true);
  });

  it('rejects missing and unsupported upload files', () => {
    expect(() => controller.uploadImage(req, undefined)).toThrow(BadRequestException);
    expect(() =>
      controller.uploadImage(req, {
        buffer: Buffer.from('not-image'),
        mimetype: 'text/plain',
        size: 9,
      } as any),
    ).toThrow('Only JPG, PNG, WEBP, and GIF images are allowed');
  });
});
