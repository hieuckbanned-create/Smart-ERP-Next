import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { sql } from 'drizzle-orm';

export interface KPIResult {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  lowStockCount: number;
  productionInProgress: number;
  qualityPassRate: number;
  periodComparison: {
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
  };
}

@Injectable()
export class AnalyticsDashboardService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getKPIs(tenantId: string, period: 'today' | 'week' | 'month' | 'quarter' = 'month'): Promise<KPIResult> {
    const { startDate, prevStartDate, prevEndDate } = this.getPeriodDates(period);

    // Current period metrics
    const current = await this.drizzle.db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('confirmed','delivered','completed') THEN total ELSE 0 END), 0) as revenue,
        COUNT(CASE WHEN status IN ('confirmed','delivered','completed') THEN 1 END) as orders
      FROM orders
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${startDate.toISOString()}`
    );
    const curr = (current as any[])[0] || { revenue: 0, orders: 0 };

    // Previous period metrics
    const previous = await this.drizzle.db.execute(sql`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('confirmed','delivered','completed') THEN total ELSE 0 END), 0) as revenue,
        COUNT(CASE WHEN status IN ('confirmed','delivered','completed') THEN 1 END) as orders
      FROM orders
      WHERE tenant_id = ${tenantId}
        AND created_at >= ${prevStartDate.toISOString()}
        AND created_at < ${prevEndDate.toISOString()}`
    );
    const prev = (previous as any[])[0] || { revenue: 0, orders: 0 };

    // Customer count
    const customers = await this.drizzle.db.execute(sql`
      SELECT COUNT(*) as total FROM customers WHERE tenant_id = ${tenantId} AND is_active = true`
    );
    const totalCustomers = Number((customers as any[])?.[0]?.total || 0);

    // Low stock count
    const lowStock = await this.drizzle.db.execute(sql`
      SELECT COUNT(*) as total FROM products
      WHERE tenant_id = ${tenantId} AND is_active = true
        AND current_stock <= min_stock`
    );
    const lowStockCount = Number((lowStock as any[])?.[0]?.total || 0);

    // Production in progress
    const production = await this.drizzle.db.execute(sql`
      SELECT COUNT(*) as total FROM production_orders
      WHERE tenant_id = ${tenantId} AND status = 'in_progress'`
    );
    const productionInProgress = Number((production as any[])?.[0]?.total || 0);

    // Quality pass rate
    const quality = await this.drizzle.db.execute(sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN verdict = 'pass' THEN 1 ELSE 0 END) as passed
      FROM qms_inspections
      WHERE tenant_id = ${tenantId}
        AND inspection_date >= ${startDate.toISOString()}`
    );
    const qual = (quality as any[])[0] || { total: 0, passed: 0 };
    const qualityPassRate = qual.total > 0 ? Math.round((Number(qual.passed) / Number(qual.total)) * 10000) / 100 : 0;

    // Period comparison
    const revenueChange = prev.revenue > 0 ? Math.round(((Number(curr.revenue) - Number(prev.revenue)) / Number(prev.revenue)) * 10000) / 100 : 0;
    const ordersChange = prev.orders > 0 ? Math.round(((Number(curr.orders) - Number(prev.orders)) / Number(prev.orders)) * 10000) / 100 : 0;

    return {
      totalRevenue: Number(curr.revenue),
      totalOrders: Number(curr.orders),
      avgOrderValue: Number(curr.orders) > 0 ? Math.round(Number(curr.revenue) / Number(curr.orders)) : 0,
      totalCustomers,
      lowStockCount,
      productionInProgress,
      qualityPassRate,
      periodComparison: {
        revenueChange,
        ordersChange,
        customersChange: 0,
      },
    };
  }

  async getRevenueChart(tenantId: string, days: number = 30) {
    return this.drizzle.db.execute(sql`
      SELECT
        DATE(created_at) as date,
        SUM(CASE WHEN status IN ('confirmed','delivered','completed') THEN total ELSE 0 END) as revenue,
        COUNT(CASE WHEN status IN ('confirmed','delivered','completed') THEN 1 END) as orders
      FROM orders
      WHERE tenant_id = ${tenantId}
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );
  }

  async getTopProducts(tenantId: string, limit: number = 10) {
    return this.drizzle.db.execute(sql`
      SELECT
        p.id, p.name, p.sku,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.tenant_id = ${tenantId}
        AND o.status IN ('confirmed','delivered','completed')
        AND o.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_revenue DESC
      LIMIT ${limit}`
    );
  }

  private getPeriodDates(period: string) {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevEndDate = new Date(startDate);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        prevEndDate = new Date(startDate);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        prevStartDate = new Date(startDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 3);
        prevEndDate = new Date(startDate);
        break;
      default: // month
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        prevStartDate = new Date(startDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
        prevEndDate = new Date(startDate);
    }

    return { startDate, prevStartDate, prevEndDate };
  }
}