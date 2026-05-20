const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

jest.mock("@smart-erp/database", () => ({ db: mockDb }));

jest.mock("@smart-erp/database/schema", () => ({
  orders: {
    id: "orders.id",
    tenantId: "orders.tenantId",
    code: "orders.code",
    status: "orders.status",
    paymentStatus: "orders.paymentStatus",
    channel: "orders.channel",
    createdAt: "orders.createdAt",
  },
  orderItems: {
    orderId: "orderItems.orderId",
  },
  products: {
    id: "products.id",
    tenantId: "products.tenantId",
    name: "products.name",
    sku: "products.sku",
  },
}));

jest.mock("@smart-erp/database/drizzle", () => ({
  eq: jest.fn((field, value) => ({ op: "eq", field, value })),
  and: jest.fn((...conditions) => ({ op: "and", conditions })),
  ilike: jest.fn((field, value) => ({ op: "ilike", field, value })),
  sql: jest.fn((strings, ...values) => ({ op: "sql", strings, values })),
  desc: jest.fn((field) => ({ op: "desc", field })),
  inArray: jest.fn((field, values) => ({ op: "inArray", field, values })),
}));

import { BadRequestException } from "@nestjs/common";
import { inArray } from "@smart-erp/database/drizzle";
import { products } from "@smart-erp/database/schema";
import { OrdersService } from "./orders.service";

const selectQueue: any[][] = [];
const insertReturningQueue: any[][] = [];

const makeSelectChain = (rows: any[]) => {
  const chain: any = {
    from: jest.fn(() => chain),
    where: jest.fn(() => Promise.resolve(rows)),
    orderBy: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    offset: jest.fn(() => Promise.resolve(rows)),
  };
  return chain;
};

const makeInsertChain = () => {
  const chain: any = {
    values: jest.fn(() => chain),
    returning: jest.fn(() => Promise.resolve(insertReturningQueue.shift() ?? [])),
  };
  return chain;
};

const createService = () => {
  const notifications = { broadcastToTenant: jest.fn() };
  const activityService = { log: jest.fn().mockResolvedValue(undefined) };
  return {
    activityService,
    notifications,
    service: new OrdersService(notifications as any, activityService as any),
  };
};

describe("OrdersService coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectQueue.length = 0;
    insertReturningQueue.length = 0;

    mockDb.select.mockImplementation(() => makeSelectChain(selectQueue.shift() ?? []));
    mockDb.insert.mockImplementation(() => makeInsertChain());
  });

  it("creates POS orders using an inArray product lookup", async () => {
    const { activityService, notifications, service } = createService();
    selectQueue.push(
      [{ id: "product-1", name: "Cafe sua da", sku: "CAFE-001", unit: "ly" }],
      [{ count: 3 }],
    );
    insertReturningQueue.push([
      {
        id: "order-1",
        code: "DH-000004",
        total: "25000",
        channel: "pos",
        paymentMethod: "cash",
        paymentStatus: "paid",
        createdAt: new Date("2026-05-20T00:00:00.000Z"),
      },
    ]);

    await expect(
      service.create("tenant-1", "user-1", {
        channel: "pos",
        paymentMethod: "cash",
        items: [{ productId: "product-1", quantity: 2, unitPrice: 12500, discountAmount: 0 }],
      } as any),
    ).resolves.toMatchObject({
      id: "order-1",
      code: "DH-000004",
      items: [
        expect.objectContaining({
          productId: "product-1",
          productName: "Cafe sua da",
          productSku: "CAFE-001",
          quantity: 2,
          lineTotal: "25000",
        }),
      ],
    });

    expect(inArray).toHaveBeenCalledWith(products.id, ["product-1"]);
    expect(mockDb.insert).toHaveBeenCalledTimes(2);

    const orderInsertChain = mockDb.insert.mock.results[0].value;
    expect(orderInsertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        code: "DH-000004",
        channel: "pos",
        subtotal: "25000",
        total: "25000",
        paidAmount: "25000",
        debtAmount: "0",
        paymentStatus: "paid",
        paymentMethod: "cash",
      }),
    );

    const itemInsertChain = mockDb.insert.mock.results[1].value;
    expect(itemInsertChain.values).toHaveBeenCalledWith([
      expect.objectContaining({
        orderId: "order-1",
        productId: "product-1",
        productName: "Cafe sua da",
      }),
    ]);

    expect(activityService.log).toHaveBeenCalledWith(
      "tenant-1",
      "user-1",
      "created",
      "order",
      "order-1",
      expect.objectContaining({ code: "DH-000004", paymentStatus: "paid" }),
    );
    expect(notifications.broadcastToTenant).toHaveBeenCalledWith(
      "tenant-1",
      "order.created",
      expect.objectContaining({ id: "order-1", code: "DH-000004" }),
    );
  });

  it("rejects orders whose products are not in the tenant catalog", async () => {
    const { service } = createService();
    selectQueue.push([]);

    await expect(
      service.create("tenant-1", "user-1", {
        items: [{ productId: "missing", quantity: 1, unitPrice: 1000 }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
