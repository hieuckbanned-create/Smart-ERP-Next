jest.mock('@smart-erp/database', () => {
  const db: any = () => db;
  const chainFn = jest.fn(() => db);

  db.select = chainFn;
  db.from = chainFn;
  db.where = chainFn;
  db.orderBy = chainFn;
  db.limit = chainFn;
  db.offset = chainFn;
  db.insert = chainFn;
  db.values = chainFn;
  db.update = chainFn;
  db.set = chainFn;
  db.delete = chainFn;
  db.execute = jest.fn();
  db.returning = jest.fn();
  db.then = jest.fn();
  db.innerJoin = chainFn;
  db.leftJoin = chainFn;
  db.groupBy = chainFn;

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ orders: {}, orderItems: {}, products: {}, customers: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  ilike: jest.fn(),
  sql: jest.fn(),
  desc: jest.fn(),
  inArray: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

describe('OrdersService (direct instantiation)', () => {
  let service: OrdersService;
  const mockNotifications = { broadcastToTenant: jest.fn() };
  const mockActivityService = { log: jest.fn() };
  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then = jest.fn((resolve: any) => resolve([]));
    (db as any).returning = jest.fn();
    (db as any).execute = jest.fn();
    mockNotifications.broadcastToTenant.mockResolvedValue(undefined);
    mockActivityService.log.mockResolvedValue(undefined);
    service = new (OrdersService as any)(mockNotifications, mockActivityService);
  });

  describe('validateOrderData', () => {
    it('throws when code is missing', () => {
      expect(() => service.validateOrderData({ customerName: 'Lan', total: 100, items: [{}] }))
        .toThrow(BadRequestException);
    });

    it('throws when customerName is missing', () => {
      expect(() => service.validateOrderData({ code: 'DH-001', total: 100, items: [{}] }))
        .toThrow(BadRequestException);
    });

    it('throws when total is negative', () => {
      expect(() => service.validateOrderData({ code: 'DH-001', customerName: 'Lan', total: -1, items: [{}] }))
        .toThrow(BadRequestException);
    });

    it('throws when items are empty', () => {
      expect(() => service.validateOrderData({ code: 'DH-001', customerName: 'Lan', total: 100, items: [] }))
        .toThrow(BadRequestException);
    });

    it('passes for valid data', () => {
      expect(() => service.validateOrderData({ code: 'DH-001', customerName: 'Lan', total: 100, items: [{}] }))
        .not.toThrow();
    });
  });

  describe('create', () => {
    const productList = [
      { id: 'product-1', name: 'Cafe den', sku: 'CAFE-001', unit: 'ly' },
    ];
    const orderRow = {
      id: 'order-1',
      code: 'DH-000001',
      tenantId: TENANT_ID,
      customerId: null,
      warehouseId: null,
      channel: 'pos',
      status: 'confirmed',
      subtotal: '25000',
      discountAmount: '0',
      discountPercent: '0',
      taxAmount: '0',
      shippingFee: '0',
      total: '25000',
      paidAmount: '25000',
      debtAmount: '0',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      shippingAddress: null,
      notes: null,
      confirmedAt: new Date(),
      createdAt: new Date(),
    };

    beforeEach(() => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve(productList))
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]));
      (db as any).returning.mockResolvedValue([orderRow]);
    });

    it('creates a POS order with cash payment', async () => {
      const result = await service.create(TENANT_ID, USER_ID, {
        channel: 'pos',
        paymentMethod: 'cash',
        items: [{ productId: 'product-1', quantity: 2, unitPrice: 12500, discountAmount: 0 }],
      } as any);

      expect(result.code).toBe('DH-000001');
      expect(result.total).toBe('25000');
      expect(result.paymentStatus).toBe('paid');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        productId: 'product-1',
        productName: 'Cafe den',
        quantity: 2,
        lineTotal: '25000',
      });
    });

    it('creates an unpaid credit order', async () => {
      (db as any).returning.mockResolvedValue([{
        ...orderRow,
        id: 'order-credit',
        code: 'DH-000001',
        paidAmount: '0',
        debtAmount: '25000',
        paymentStatus: 'unpaid',
        paymentMethod: 'credit',
      }]);

      const result = await service.create(TENANT_ID, USER_ID, {
        paymentMethod: 'credit',
        items: [{ productId: 'product-1', quantity: 2, unitPrice: 12500 }],
      } as any);

      expect(result.paymentStatus).toBe('unpaid');
      expect(result.debtAmount).toBe('25000');
      expect(result.paidAmount).toBe('0');
    });

    it('throws when no items provided', async () => {
      await expect(service.create(TENANT_ID, USER_ID, { items: [] } as any))
        .rejects.toThrow('Order must have at least 1 product');
    });

    it('throws when a product is not found in tenant catalog', async () => {
      (db as any).then.mockReset();
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([]));

      await expect(service.create(TENANT_ID, USER_ID, {
        items: [{ productId: 'missing', quantity: 1, unitPrice: 1000 }],
      } as any)).rejects.toThrow('Product missing not found');
    });

    it('logs activity and broadcasts notification', async () => {
      await service.create(TENANT_ID, USER_ID, {
        items: [{ productId: 'product-1', quantity: 2, unitPrice: 12500 }],
      } as any);

      expect(mockActivityService.log).toHaveBeenCalledWith(
        TENANT_ID, USER_ID, 'created', 'order', 'order-1',
        expect.objectContaining({ code: 'DH-000001', paymentStatus: 'paid' }),
      );
      expect(mockNotifications.broadcastToTenant).toHaveBeenCalledWith(
        TENANT_ID, 'order.created',
        expect.objectContaining({ id: 'order-1', code: 'DH-000001' }),
      );
    });

    it('handles discount and shipping fee in total calculation', async () => {
      (db as any).returning.mockResolvedValue([{
        ...orderRow,
        subtotal: '25000',
        discountAmount: '5000',
        shippingFee: '3000',
        total: '23000',
        paidAmount: '23000',
        debtAmount: '0',
        paymentStatus: 'paid',
      }]);

      const result = await service.create(TENANT_ID, USER_ID, {
        items: [{ productId: 'product-1', quantity: 2, unitPrice: 12500 }],
        discountAmount: 5000,
        shippingFee: 3000,
        paymentMethod: 'cash',
      } as any);

      expect(result.total).toBe('23000');
      expect(result.subtotal).toBe('25000');
      expect(result.discountAmount).toBe('5000');
    });

    it('applies default values for optional line item fields', async () => {
      const result = await service.create(TENANT_ID, USER_ID, {
        items: [{ productId: 'product-1', quantity: 1, unitPrice: 10000 }],
      } as any);

      expect(result.items[0]).toMatchObject({
        unit: 'ly',
        discountAmount: '0',
        discountPercent: '0',
        taxRate: '0',
        notes: null,
        batchNumber: null,
      });
    });

    it('generates correct order code based on existing count', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve(productList))
        .mockImplementationOnce((resolve: any) => resolve([{ count: 99 }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, code: 'DH-000100' }]);

      const result = await service.create(TENANT_ID, USER_ID, {
        items: [{ productId: 'product-1', quantity: 1, unitPrice: 5000 }],
      } as any);

      expect(result.code).toBe('DH-000100');
    });
  });

  describe('findAll', () => {
    const items = [
      { id: 'order-1', code: 'DH-001', tenantId: TENANT_ID, status: 'confirmed', paymentStatus: 'paid', channel: 'pos', createdAt: new Date('2026-01-01') },
      { id: 'order-2', code: 'DH-002', tenantId: TENANT_ID, status: 'processing', paymentStatus: 'unpaid', channel: 'online', createdAt: new Date('2026-01-02') },
    ];

    it('returns paginated list with defaults', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 2 }]))
        .mockImplementationOnce((resolve: any) => resolve(items));

      const result = await service.findAll(TENANT_ID, {});

      expect(result.items).toEqual(items);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('filters by search term on order code', async () => {
      const filtered = [items[0]];
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve(filtered));

      const result = await service.findAll(TENANT_ID, { search: 'DH-001' });

      expect(result.items).toEqual(filtered);
      expect(result.total).toBe(1);
    });

    it('filters by status', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve([items[0]]));

      const result = await service.findAll(TENANT_ID, { status: 'confirmed' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('confirmed');
    });

    it('filters by paymentStatus', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve([items[0]]));

      const result = await service.findAll(TENANT_ID, { paymentStatus: 'paid' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].paymentStatus).toBe('paid');
    });

    it('filters by channel', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 1 }]))
        .mockImplementationOnce((resolve: any) => resolve([items[0]]));

      const result = await service.findAll(TENANT_ID, { channel: 'pos' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].channel).toBe('pos');
    });

    it('caps limit at 100', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { limit: 200 });

      expect(result.limit).toBe(100);
    });

    it('returns empty result set', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{ count: 0 }]))
        .mockImplementationOnce((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { search: 'NONEXIST' });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findOne', () => {
    it('returns order with customer name and items', async () => {
      (db as any).then
        .mockImplementationOnce((resolve: any) => resolve([{
          order: { id: 'order-1', code: 'DH-001', customerId: 'customer-1' },
          customerName: 'Lan Nguyen',
        }]))
        .mockImplementationOnce((resolve: any) => resolve([{ id: 'item-1', productName: 'Cafe den' }]));

      const result = await service.findOne(TENANT_ID, 'order-1');

      expect(result.id).toBe('order-1');
      expect(result.code).toBe('DH-001');
      expect(result.customerName).toBe('Lan Nguyen');
      expect(result.items).toEqual([{ id: 'item-1', productName: 'Cafe den' }]);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(service.findOne(TENANT_ID, 'missing'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('generateEInvoiceXml', () => {
    it('generates valid XML with full fields', async () => {
      jest.spyOn(service as any, 'findOne').mockResolvedValue({
        code: 'DH-001',
        customerName: 'Lan Nguyen',
        shippingAddress: '123 Main St',
        total: '1000',
        paymentMethod: 'bank_transfer',
        items: [{ productName: 'Cafe den', quantity: 2, unit: 'ly', unitPrice: '500', lineTotal: '1000' }],
      } as any);

      const xml = await service.generateEInvoiceXml(TENANT_ID, 'order-1');

      expect(xml).toContain('<Invoice');
      expect(xml).toContain('<InvNo>DH-001</InvNo>');
      expect(xml).toContain('<BuyerName>Lan Nguyen</BuyerName>');
      expect(xml).toContain('<BuyerAddress>123 Main St</BuyerAddress>');
      expect(xml).toContain('<ItemName>Cafe den</ItemName>');
      expect(xml).toContain('<Quantity>2</Quantity>');
      expect(xml).toContain('<Amount>1000</Amount>');
      expect(xml).toContain('<TotalAmount>1000</TotalAmount>');
      expect(xml).toContain('<VATRate>10</VATRate>');
      expect(xml).toContain('<VATAmount>100</VATAmount>');
      expect(xml).toContain('<TotalAmountWithVAT>1100</TotalAmountWithVAT>');
      expect(xml).toContain('<PaymentMethod>bank_transfer</PaymentMethod>');
    });

    it('escapes special XML characters in item names', async () => {
      jest.spyOn(service as any, 'findOne').mockResolvedValue({
        code: 'DH-002',
        customerName: 'A&B <Corp>',
        total: '500',
        items: [{ productName: 'Cafe & "Milk"', quantity: 1, unit: 'ly', unitPrice: '500', lineTotal: '500' }],
      } as any);

      const xml = await service.generateEInvoiceXml(TENANT_ID, 'order-2');

      expect(xml).toContain('<ItemName>Cafe &amp; &quot;Milk&quot;</ItemName>');
    });

    it('uses fallbacks for missing customer name, address, and payment method', async () => {
      jest.spyOn(service as any, 'findOne').mockResolvedValue({
        code: 'DH-003',
        total: '300',
        items: [{ productName: 'Nuoc suoi', quantity: 1, unit: 'chai', unitPrice: '300', lineTotal: '300' }],
      } as any);

      const xml = await service.generateEInvoiceXml(TENANT_ID, 'order-3');

      expect(xml).toContain('<BuyerName>Walk-in Customer</BuyerName>');
      expect(xml).toContain('<BuyerAddress></BuyerAddress>');
      expect(xml).toContain('<PaymentMethod>Cash</PaymentMethod>');
    });
  });

  describe('updateStatus', () => {
    const orderRow = { id: 'order-1', code: 'DH-001', tenantId: TENANT_ID, status: 'confirmed' };

    it('transitions from confirmed to processing', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'confirmed' }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, status: 'processing' }]);

      const result = await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'processing');

      expect(result.status).toBe('processing');
    });

    it('throws NotFoundException for missing order', async () => {
      await expect(service.updateStatus(TENANT_ID, USER_ID, 'missing', 'confirmed'))
        .rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for invalid transition', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'delivered' }]));

      await expect(service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'confirmed'))
        .rejects.toThrow(BadRequestException);
    });

    it('sets confirmedAt when transitioning to confirmed', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'draft' }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, status: 'confirmed' }]);

      await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'confirmed');

      expect((db as any).set).toHaveBeenCalledWith(
        expect.objectContaining({ confirmedAt: expect.any(Date) }),
      );
    });

    it('sets shippedAt when transitioning to shipped', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'processing' }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, status: 'shipped' }]);

      await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'shipped');

      expect((db as any).set).toHaveBeenCalledWith(
        expect.objectContaining({ shippedAt: expect.any(Date) }),
      );
    });

    it('sets deliveredAt when transitioning to delivered', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'shipped' }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, status: 'delivered' }]);

      await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'delivered');

      expect((db as any).set).toHaveBeenCalledWith(
        expect.objectContaining({ deliveredAt: expect.any(Date) }),
      );
    });

    it('cancels with reason and sets cancelledAt', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'draft' }]));
      const cancelledOrder = { ...orderRow, id: 'order-1', status: 'cancelled', cancelReason: 'Out of stock', cancelledAt: new Date() };
      (db as any).returning.mockResolvedValue([cancelledOrder]);

      const result = await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'cancelled', 'Out of stock');

      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe('Out of stock');
    });

    it('logs activity and broadcasts notification on status change', async () => {
      (db as any).then.mockImplementationOnce((resolve: any) => resolve([{ ...orderRow, status: 'confirmed' }]));
      (db as any).returning.mockResolvedValue([{ ...orderRow, status: 'processing' }]);

      await service.updateStatus(TENANT_ID, USER_ID, 'order-1', 'processing');

      expect(mockActivityService.log).toHaveBeenCalledWith(
        TENANT_ID, USER_ID, 'updated', 'order', 'order-1',
        expect.objectContaining({ fromStatus: 'confirmed', toStatus: 'processing' }),
      );
      expect(mockNotifications.broadcastToTenant).toHaveBeenCalledWith(
        TENANT_ID, 'order.status_changed',
        expect.objectContaining({ status: 'processing' }),
      );
    });
  });
});
