import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { products, billsOfMaterials, productionOrders, inventoryTransactions } from '@smart-erp/database';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface BomItem {
  id: string;
  productId: string;
  componentProductId: string;
  componentProductName: string;
  quantity: number;
  unitCost?: number;
  wastagePercent?: number;
}

export interface ProductionOrder {
  id: string;
  orderCode: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  bomItems: BomItem[];
  createdAt: string;
}

export interface QCCheckpoint {
  id: string;
  productionOrderId: string;
  checkpoint: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
  checkedAt?: string;
}

@Injectable()
export class ManufacturingService {
  constructor(private readonly drizzle: DrizzleService) {}

  /** Get BOM for a product */
  async getBOM(productId: string, tenantId: string): Promise<BomItem[]> {
    const boms = await this.drizzle.db.execute(
      sql`
        SELECT
          b.id,
          b.product_id,
          cp.id as component_product_id,
          cp.name as component_product_name,
          b.quantity,
          b.unit_cost,
          b.wastage_percent
        FROM bills_of_materials b
        JOIN products cp ON cp.id = b.component_product_id
        WHERE b.product_id = ${productId}
          AND b.tenant_id = ${tenantId}
        ORDER BY b.id
      `,
    );
    return boms as BomItem[];
  }

  /** Create BOM item */
  async addBOMItem(tenantId: string, productId: string, data: {
    componentProductId: string;
    quantity: number;
    unitCost?: number;
    wastagePercent?: number;
  }) {
    const id = crypto.randomUUID();
    await this.drizzle.db.insert(billsOfMaterials).values({
      ...data,
      id,
      tenantId,
      productId,
    });
    return this.getBOM(productId, tenantId);
  }

  /** Create production order */
  async createProductionOrder(tenantId: string, userId: string, data: {
    productId: string;
    quantity: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ProductionOrder> {
    const code = `MO-${Date.now().toString(36).toUpperCase()}`;
    const [order] = await this.drizzle.db.insert(productionOrders).values({
      tenantId,
      orderCode: code,
      productId: data.productId,
      quantity: data.quantity,
      status: 'draft',
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate,
      createdBy: userId,
    }).returning();

    return this.getProductionOrderById(tenantId, order.id);
  }

  /** Start production — check materials and consume */
  async startProduction(tenantId: string, orderId: string, userId: string): Promise<ProductionOrder> {
    const [order] = await this.drizzle.db
      .select()
      .from(productionOrders)
      .where(and(eq(productionOrders.tenantId, tenantId), eq(productionOrders.id, orderId)))
      .limit(1);

    if (!order) throw new NotFoundException('Production order not found');
    if (order.status !== 'draft') throw new NotFoundException('Order must be in draft status');

    // Check and consume BOM materials
    const boms = await this.getBOM(order.productId, tenantId);

    for (const bom of boms) {
      const requiredQty = bom.quantity * order.quantity * (1 + (bom.wastagePercent || 0) / 100);

      // Check inventory
      const invResult = await this.drizzle.db.execute(
        sql`
          SELECT current_stock FROM inventory_summary
          WHERE tenant_id = ${tenantId} AND product_id = ${bom.componentProductId}
          LIMIT 1
        `,
      );

      const currentStock = (invResult as any[])?.[0]?.current_stock ?? 0;
      if (currentStock < requiredQty) {
        throw new Error(
          `Insufficient materials for ${bom.componentProductName}: need ${requiredQty.toFixed(2)}, current stock ${currentStock}`,
        );
      }

      // Consume material
      await this.drizzle.db.execute(
        sql`
          UPDATE inventory_summary
          SET current_stock = current_stock - ${requiredQty},
              updated_at = NOW()
          WHERE tenant_id = ${tenantId} AND product_id = ${bom.componentProductId}
        `,
      );

      // Log transaction
      await this.drizzle.db.insert(inventoryTransactions).values({
        tenantId,
        productId: bom.componentProductId,
        type: 'production_consumption',
        quantity: requiredQty,
        referenceType: 'production_order',
        referenceId: orderId,
        performedBy: userId,
        notes: `Production consumption for ${order.orderCode}`,
      });
    }

    // Update order status
    await this.drizzle.db
      .update(productionOrders)
      .set({ status: 'in_progress', startedAt: new Date() })
      .where(eq(productionOrders.id, orderId));

    return this.getProductionOrderById(tenantId, orderId);
  }

  /** Complete production */
  async completeProduction(tenantId: string, orderId: string, userId: string): Promise<ProductionOrder> {
    await this.drizzle.db
      .update(productionOrders)
      .set({ status: 'completed', completedAt: new Date() })
      .where(and(eq(productionOrders.tenantId, tenantId), eq(productionOrders.id, orderId)));

    // Add finished goods to inventory
    const [order] = await this.drizzle.db
      .select()
      .from(productionOrders)
      .where(eq(productionOrders.id, orderId))
      .limit(1);

    const addQty = (order as any).quantity;
    await this.drizzle.db.execute(
      sql`
        UPDATE inventory_summary
        SET current_stock = current_stock + ${addQty},
            updated_at = NOW()
        WHERE tenant_id = ${tenantId} AND product_id = ${(order as any).product_id}
      `,
    );

    await this.drizzle.db.insert(inventoryTransactions).values({
      tenantId,
      productId: (order as any).product_id,
      type: 'production_output',
      quantity: addQty,
      referenceType: 'production_order',
      referenceId: orderId,
      performedBy: userId,
      notes: `Production completed for ${order.orderCode}`,
    });

    return this.getProductionOrderById(tenantId, orderId);
  }

  /** Get production order details */
  async getProductionOrderById(tenantId: string, orderId: string): Promise<ProductionOrder> {
    const [order] = await this.drizzle.db.execute(
      sql`
        SELECT
          po.id,
          po.order_code,
          po.product_id,
          po.quantity,
          po.status,
          po.start_date,
          po.end_date,
          po.created_at,
          p.name as product_name
        FROM production_orders po
        JOIN products p ON p.id = po.product_id
        WHERE po.tenant_id = ${tenantId} AND po.id = ${orderId}
        LIMIT 1
      `,
    );

    if (!(order as any[]).length) throw new NotFoundException('Production order not found');

    const bom = await this.getBOM((order as any).product_id, tenantId);

    return {
      ...(order as any),
      bomItems: bom,
    };
  }

  /** List production orders */
  async listProductionOrders(tenantId: string, status?: string, limit = 20, page = 1) {
    const offset = (page - 1) * limit;

    let query = sql`
      SELECT po.*, p.name as product_name
      FROM production_orders po
      JOIN products p ON p.id = po.product_id
      WHERE po.tenant_id = ${tenantId}
    `;

    if (status) {
      query = sql`${query} AND po.status = ${status}`;
    }

    query = sql`${query} ORDER BY po.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    return this.drizzle.db.execute(query);
  }

  /** Get quality checkpoints for a production order */
  async getQCCheckpoints(orderId: string, tenantId: string): Promise<QCCheckpoint[]> {
    const checkpoints = await this.drizzle.db
      .select()
      .from(productionOrders) // Simplified: would use a qc_checkpoints table
      .where(eq(productionOrders.id, orderId))
      .limit(1);

    // Return default checkpoints
    const defaultCheckpoints = [
      { id: 'qc-1', productionOrderId: orderId, checkpoint: 'Kiểm tra nguyên liệu', status: 'pending' },
      { id: 'qc-2', productionOrderId: orderId, checkpoint: 'Kiểm tra quy trình', status: 'pending' },
      { id: 'qc-3', productionOrderId: orderId, checkpoint: 'Kiểm tra thành phẩm', status: 'pending' },
    ];

    return defaultCheckpoints;
  }

  /** Update QC checkpoint */
  async updateQCCheckpoint(orderId: string, checkpointId: string, status: 'passed' | 'failed', notes?: string) {
    // Simplified: would update qc_checkpoints table
    return { id: checkpointId, status, notes, checkedAt: new Date().toISOString() };
  }

  /** Calculate production cost */
  async calculateProductionCost(tenantId: string, productId: string, quantity: number) {
    const boms = await this.getBOM(productId, tenantId);
    let totalMaterialCost = 0;

    for (const bom of boms) {
      const requiredQty = bom.quantity * quantity * (1 + (bom.wastagePercent || 0) / 100);
      const costPerUnit = bom.unitCost || 0;
      totalMaterialCost += requiredQty * costPerUnit;
    }

    return {
      totalMaterialCost,
      unitCost: Math.round(totalMaterialCost / quantity),
      breakdown: boms.map((bom) => ({
        component: bom.componentProductName,
        quantity: bom.quantity * quantity * (1 + (bom.wastagePercent || 0) / 100),
        unitCost: bom.unitCost,
        subtotal: (bom.quantity * quantity * (1 + (bom.wastagePercent || 0) / 100)) * (bom.unitCost || 0),
      })),
    };
  }
}