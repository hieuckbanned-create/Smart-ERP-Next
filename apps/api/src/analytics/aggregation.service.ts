import { Injectable } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { orders, orderItems, products } from '@smart-erp/database/schema';
import { eq, and, gte, lte, sql } from '@smart-erp/database/drizzle';

@Injectable()
export class AggregationService {
  async dailyRevenue(tenantId: string, days: number) {
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await db.select({
      date: sql<string>`DATE(created_at)`,
      revenue: sql<string>`SUM(total)`,
    }).from(orders)
      .where(and(eq(orders.tenantId, tenantId), gte(orders.createdAt, start)))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);
    return rows.map((r: any) => ({ date: r.date, revenue: Number(r.revenue) }));
  }

  async topProducts(tenantId: string, limit = 10) {
    const rows = await db.select({
      productId: orderItems.productId,
      name: products.name,
      totalSold: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<string>`SUM(${orderItems.lineTotal}::numeric)`,
    }).from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.tenantId, tenantId))
      .groupBy(orderItems.productId, products.name)
      .orderBy(sql`SUM(${orderItems.lineTotal}::numeric) DESC`)
      .limit(limit);
    return rows.map((r: any) => ({ ...r, revenue: Number(r.revenue) }));
  }

  async orderStats(tenantId: string, from: string, to: string) {
    const rows = await db.select({
      status: orders.status,
      count: sql<number>`COUNT(*)`,
    }).from(orders)
      .where(and(
        eq(orders.tenantId, tenantId),
        gte(orders.createdAt, new Date(from)),
        lte(orders.createdAt, new Date(to)),
      ))
      .groupBy(orders.status);
    return rows;
  }
}
