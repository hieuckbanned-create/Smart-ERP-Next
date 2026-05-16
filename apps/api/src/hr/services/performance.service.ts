import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { kpiDefinitions, employeeKpiTargets, performanceReviews } from '@smart-erp/database/schema';
import { eq, and, desc } from '@smart-erp/database/drizzle';

@Injectable()
export class PerformanceService {
  async getEmployeeKPIs(tenantId: string, employeeId: string, period?: string) {
    const conditions = [
      eq(employeeKpiTargets.tenantId, tenantId),
      eq(employeeKpiTargets.employeeId, employeeId),
    ];
    if (period) conditions.push(eq(employeeKpiTargets.period, period));

    return db
      .select({
        id: employeeKpiTargets.id,
        kpiName: kpiDefinitions.name,
        targetValue: employeeKpiTargets.targetValue,
        actualValue: employeeKpiTargets.actualValue,
        score: employeeKpiTargets.score,
        period: employeeKpiTargets.period,
        status: employeeKpiTargets.status,
      })
      .from(employeeKpiTargets)
      .innerJoin(kpiDefinitions, eq(employeeKpiTargets.kpiId, kpiDefinitions.id))
      .where(and(...conditions))
      .orderBy(desc(employeeKpiTargets.period));
  }

  async updateKpiProgress(tenantId: string, employeeId: string, targetId: string, actualValue: number) {
    const [target] = await db
      .select()
      .from(employeeKpiTargets)
      .where(and(eq(employeeKpiTargets.id, targetId), eq(employeeKpiTargets.tenantId, tenantId)));

    if (!target) throw new NotFoundException('KPI target not found');

    const score = (actualValue / parseFloat(target.targetValue)) * 100;

    const [updated] = await db
      .update(employeeKpiTargets)
      .set({
        actualValue: actualValue.toString(),
        score: Math.min(score, 120).toString(), // Cap score at 120%
        updatedAt: new Date(),
      })
      .where(eq(employeeKpiTargets.id, targetId))
      .returning();

    return updated;
  }

  async createPerformanceReview(tenantId: string, data: any) {
    const [review] = await db
      .insert(performanceReviews)
      .values({
        ...data,
        tenantId,
      })
      .returning();
    return review;
  }
}
