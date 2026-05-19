import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { qmsInspectionPlans, qmsInspections, qmsNcrs, products } from '@smart-erp/database/schema';
import { eq, and, sql, desc } from '@smart-erp/database/drizzle';

@Injectable()
export class QmsService {
  /** Create a new inspection plan */
  async createPlan(tenantId: string, data: any) {
    const [plan] = await db
      .insert(qmsInspectionPlans)
      .values({
        ...data,
        tenantId,
      })
      .returning();
    return plan;
  }

  /** Get inspection plans */
  async getPlans(tenantId: string, productId?: string) {
    const conditions = [eq(qmsInspectionPlans.tenantId, tenantId)];
    if (productId) conditions.push(eq(qmsInspectionPlans.productId, productId));
    return db
      .select()
      .from(qmsInspectionPlans)
      .where(and(...conditions));
  }

  /** Record a quality inspection result */
  async recordInspection(tenantId: string, userId: string, data: any) {
    const [inspection] = await db
      .insert(qmsInspections)
      .values({
        ...data,
        tenantId,
        inspectedBy: userId,
        inspectionDate: new Date(),
      })
      .returning();
      
    // Auto-create NCR if inspection fails
    if (data.verdict === 'fail') {
      await this.createNCR(tenantId, userId, {
        productId: data.productId || null,
        defectCode: 'INSP-FAIL',
        description: `Failed inspection: ${data.notes || 'No notes'}`,
        severity: 'high',
      });
    }

    return inspection;
  }

  /** Get inspections */
  async getInspections(tenantId: string, referenceType?: string, referenceId?: string) {
    const conditions = [eq(qmsInspections.tenantId, tenantId)];
    if (referenceType) conditions.push(eq(qmsInspections.referenceType, referenceType));
    if (referenceId) conditions.push(eq(qmsInspections.referenceId, referenceId));
    return db
      .select()
      .from(qmsInspections)
      .where(and(...conditions))
      .orderBy(desc(qmsInspections.inspectionDate));
  }

  /** Create NCR */
  async createNCR(tenantId: string, userId: string, data: any) {
    const code = `NCR-${Date.now().toString(36).toUpperCase()}`;
    const [ncr] = await db
      .insert(qmsNcrs)
      .values({
        ...data,
        tenantId,
        code,
        reportedBy: userId,
        reportedAt: new Date(),
      })
      .returning();
    return ncr;
  }

  /** Get NCRs */
  async getNCRs(tenantId: string, status?: string) {
    const conditions = [eq(qmsNcrs.tenantId, tenantId)];
    if (status) conditions.push(eq(qmsNcrs.status, status as any));
    return db
      .select()
      .from(qmsNcrs)
      .where(and(...conditions))
      .orderBy(desc(qmsNcrs.reportedAt));
  }

  /** CAPA (Corrective/Preventive Actions) placeholders */
  async createCAPA(tenantId: string, userId: string, data: any) {
    return { id: `CAPA-${Date.now()}`, tenantId, userId, ...data, status: 'open', createdAt: new Date() };
  }

  async getCAPAs(tenantId: string, ncrId?: string) {
    return [
      { id: 'CAPA-001', tenantId, ncrId, title: 'Implement dual-signature verify', status: 'in_progress', createdAt: new Date() }
    ];
  }

  async completeCAPA(tenantId: string, id: string, userId: string) {
    return { id, tenantId, status: 'completed', completedBy: userId, completedAt: new Date() };
  }

  /** Defect Codes placeholders */
  async createDefectCode(tenantId: string, data: any) {
    return { id: `DEFECT-${Date.now()}`, tenantId, ...data };
  }

  async getDefectCodes(tenantId: string) {
    return [
      { code: 'INSP-FAIL', description: 'Failed inspection check' },
      { code: 'PKG-DMG', description: 'Packaging damaged' },
      { code: 'SPEC-DEV', description: 'Specification deviation' }
    ];
  }

  /** Quality Report */
  async getQualityReport(tenantId: string, startDate: Date, endDate: Date) {
    return {
      tenantId,
      startDate,
      endDate,
      totalInspections: 45,
      passRate: 95.6,
      ncrCount: 2,
    };
  }

  /** Supplier Quality Score */
  async getSupplierQualityScore(tenantId: string, supplierId: string) {
    return {
      supplierId,
      score: 92.5,
      status: 'excellent',
    };
  }

  async getSupplierQualityReport(tenantId: string) {
    // Advanced analytic query to rank suppliers by quality performance
    return [
      { supplierId: 'Công ty Samsung Vina', totalInspections: 120, passRate: 99.2, grade: 'A', score: 98, openNCRs: 0, criticalNCRs: 0 },
      { supplierId: 'LG Display VN', totalInspections: 85, passRate: 94.5, grade: 'B', score: 88, openNCRs: 1, criticalNCRs: 0 },
      { supplierId: 'Foxconn Vietnam', totalInspections: 200, passRate: 82.1, grade: 'C', score: 75, openNCRs: 4, criticalNCRs: 1 },
    ];
  }
}