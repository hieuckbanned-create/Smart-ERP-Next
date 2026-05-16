import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { maintenanceOrders, maintenanceSchedules, fixedAssets } from '@smart-erp/database/schema';
import { eq, and, sql, desc, lte } from '@smart-erp/database/drizzle';

@Injectable()
export class MaintenanceService {
  /**
   * Automatically generate maintenance orders from due schedules
   */
  async processDueSchedules(tenantId: string) {
    const dueSchedules = await db
      .select()
      .from(maintenanceSchedules)
      .where(and(
        eq(maintenanceSchedules.tenantId, tenantId),
        eq(maintenanceSchedules.isActive, true),
        lte(maintenanceSchedules.nextMaintenanceDate, new Date())
      ));

    const generatedOrders = [];

    for (const schedule of dueSchedules) {
      const orderNumber = `PM-${Date.now().toString(36).toUpperCase()}`;
      
      const [order] = await db.insert(maintenanceOrders).values({
        tenantId,
        assetId: schedule.assetId,
        orderNumber,
        title: `Bảo trì định kỳ: ${schedule.name}`,
        type: 'preventive',
        status: 'pending',
        priority: 'medium',
      }).returning();

      // Update schedule for next run
      const nextDate = new Date();
      if (schedule.frequencyUnit === 'days') nextDate.setDate(nextDate.getDate() + schedule.frequencyInterval);
      if (schedule.frequencyUnit === 'weeks') nextDate.setDate(nextDate.getDate() + schedule.frequencyInterval * 7);
      if (schedule.frequencyUnit === 'months') nextDate.setMonth(nextDate.getMonth() + schedule.frequencyInterval);

      await db.update(maintenanceSchedules)
        .set({ 
          lastMaintenanceDate: new Date(),
          nextMaintenanceDate: nextDate,
          updatedAt: new Date()
        })
        .where(eq(maintenanceSchedules.id, schedule.id));

      generatedOrders.push(order);
    }

    return generatedOrders;
  }

  async createMaintenanceRequest(tenantId: string, data: any) {
    const orderNumber = `CM-${Date.now().toString(36).toUpperCase()}`;
    const [order] = await db
      .insert(maintenanceOrders)
      .values({
        ...data,
        tenantId,
        orderNumber,
        type: 'corrective',
        status: 'pending',
      })
      .returning();
      
    // Update asset status
    await db.update(fixedAssets)
      .set({ status: 'under_repair', updatedAt: new Date() })
      .where(eq(fixedAssets.id, data.assetId));

    return order;
  }

  async listOrders(tenantId: string) {
    return db
      .select({
        id: maintenanceOrders.id,
        orderNumber: maintenanceOrders.orderNumber,
        title: maintenanceOrders.title,
        status: maintenanceOrders.status,
        type: maintenanceOrders.type,
        assetName: fixedAssets.name,
        createdAt: maintenanceOrders.createdAt,
      })
      .from(maintenanceOrders)
      .innerJoin(fixedAssets, eq(maintenanceOrders.assetId, fixedAssets.id))
      .where(eq(maintenanceOrders.tenantId, tenantId))
      .orderBy(desc(maintenanceOrders.createdAt));
  }
}
