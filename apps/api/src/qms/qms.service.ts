import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class QmsService {
  constructor(private readonly drizzle: DrizzleService) {}

  // ── Inspection Plans ──

  async createPlan(tenantId: string, data: { productId: string; name: string; description?: string; samplingRule?: string; isActive?: boolean }) {
    const id = crypto.randomUUID();
    await this.drizzle.db.execute(
      sql`INSERT INTO qms_inspection_plans (id, tenant_id, product_id, name, description, sampling_rule, is_active)
          VALUES (${id}, ${tenantId}, ${data.productId}, ${data.name}, ${data.description || ''}, ${data.samplingRule || 'AQL 1.0'}, ${data.isActive ?? true})`
    );
    return { id, ...data, tenantId };
  }

  async getPlans(tenantId: string, productId?: string) {
    let query = sql`SELECT * FROM qms_inspection_plans WHERE tenant_id = ${tenantId}`;
    if (productId) query = sql`${query} AND product_id = ${productId}`;
    query = sql`${query} ORDER BY created_at DESC`;
    return this.drizzle.db.execute(query);
  }

  // ── Inspections ──

  async recordInspection(tenantId: string, userId: string, data: {
    planId: string;
    referenceType: string;
    referenceId: string;
    verdict: 'pass' | 'fail' | 'conditional';
    notes?: string;
    results: { characteristicId: string; measuredValue: number; passed: boolean }[];
  }) {
    const id = crypto.randomUUID();
    await this.drizzle.db.execute(
      sql`INSERT INTO qms_inspections (id, tenant_id, plan_id, reference_type, reference_id, verdict, notes, inspected_by, inspection_date)
          VALUES (${id}, ${tenantId}, ${data.planId}, ${data.referenceType}, ${data.referenceId}, ${data.verdict}, ${data.notes || ''}, ${userId}, NOW())`
    );
    for (const res of data.results) {
      await this.drizzle.db.execute(
        sql`INSERT INTO qms_inspection_results (id, inspection_id, characteristic_id, measured_value, passed)
            VALUES (${crypto.randomUUID()}, ${id}, ${res.characteristicId}, ${res.measuredValue}, ${res.passed})`
      );
    }
    return { id, ...data, tenantId };
  }

  async getInspections(tenantId: string, referenceType?: string, referenceId?: string) {
    let query = sql`SELECT * FROM qms_inspections WHERE tenant_id = ${tenantId}`;
    if (referenceType) query = sql`${query} AND reference_type = ${referenceType}`;
    if (referenceId) query = sql`${query} AND reference_id = ${referenceId}`;
    query = sql`${query} ORDER BY inspection_date DESC`;
    return this.drizzle.db.execute(query);
  }

  // ── NCR (Non-Conformance Reports) ──

  async createNCR(tenantId: string, userId: string, data: {
    productionOrderId: string;
    productId: string;
    defectCode: string;
    description: string;
    rootCause?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) {
    const id = crypto.randomUUID();
    const code = `NCR-${Date.now().toString(36).toUpperCase()}`;
    await this.drizzle.db.execute(
      sql`INSERT INTO qms_ncrs (id, tenant_id, code, production_order_id, product_id, defect_code, description, root_cause, severity, status, reported_by, reported_at)
          VALUES (${id}, ${tenantId}, ${code}, ${data.productionOrderId}, ${data.productId}, ${data.defectCode}, ${data.description}, ${data.rootCause || ''}, ${data.severity || 'medium'}, 'open', ${userId}, NOW())`
    );
    return { id, code, ...data, tenantId, status: 'open' };
  }

  async getNCRs(tenantId: string, status?: string) {
    let query = sql`SELECT * FROM qms_ncrs WHERE tenant_id = ${tenantId}`;
    if (status) query = sql`${query} AND status = ${status}`;
    query = sql`${query} ORDER BY reported_at DESC`;
    return this.drizzle.db.execute(query);
  }

  // ── CAPA (Corrective/Preventive Actions) ──

  async createCAPA(tenantId: string, userId: string, data: {
    ncrId: string;
    type: 'corrective' | 'preventive';
    action: string;
    targetDate?: string;
  }) {
    const id = crypto.randomUUID();
    await this.drizzle.db.execute(
      sql`INSERT INTO qms_capas (id, tenant_id, ncr_id, type, action, status, assigned_to, target_date, created_at)
          VALUES (${id}, ${tenantId}, ${data.ncrId}, ${data.type}, ${data.action}, 'open', ${userId}, ${data.targetDate || null}, NOW())`
    );
    return { id, ...data, tenantId, status: 'open' };
  }

  async getCAPAs(tenantId: string, ncrId?: string) {
    let query = sql`SELECT * FROM qms_capas WHERE tenant_id = ${tenantId}`;
    if (ncrId) query = sql`${query} AND ncr_id = ${ncrId}`;
    query = sql`${query} ORDER BY created_at DESC`;
    return this.drizzle.db.execute(query);
  }

  async completeCAPA(tenantId: string, capaId: string, userId: string) {
    await this.drizzle.db.execute(
      sql`UPDATE qms_capas SET status = 'completed', completed_at = NOW(), completed_by = ${userId}
          WHERE id = ${capaId} AND tenant_id = ${tenantId}`
    );
    return { id: capaId, status: 'completed' };
  }

  // ── Defect Codes ──

  async createDefectCode(tenantId: string, data: { code: string; name: string; description?: string }) {
    const id = crypto.randomUUID();
    await this.drizzle.db.execute(
      sql`INSERT INTO qms_defect_codes (id, tenant_id, code, name, description)
          VALUES (${id}, ${tenantId}, ${data.code}, ${data.name}, ${data.description || ''})`
    );
    return { id, ...data, tenantId };
  }

  async getDefectCodes(tenantId: string) {
    return this.drizzle.db.execute(
      sql`SELECT * FROM qms_defect_codes WHERE tenant_id = ${tenantId} ORDER BY code`
    );
  }

  // ── Quality Report ──

  async getQualityReport(tenantId: string, startDate: Date, endDate: Date) {
    const report = await this.drizzle.db.execute(sql`
      SELECT
        COUNT(*) as total_inspections,
        SUM(CASE WHEN verdict = 'pass' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN verdict = 'fail' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN verdict = 'conditional' THEN 1 ELSE 0 END) as conditional
      FROM qms_inspections
      WHERE tenant_id = ${tenantId}
        AND inspection_date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
    `);
    const rows = report as any;
    const total = Number(rows.total_inspections || 0);
    const passed = Number(rows.passed || 0);
    return {
      totalInspections: total,
      passed,
      failed: Number(rows.failed || 0),
      conditional: Number(rows.conditional || 0),
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
    };
  }

  // ── Supplier Quality Scoring ──

  async getSupplierQualityScore(tenantId: string, supplierId: string) {
    // Get all inspections for this supplier
    const inspections = await this.drizzle.db.execute(sql`
      SELECT verdict, inspection_date
      FROM qms_inspections
      WHERE tenant_id = ${tenantId}
        AND reference_type = 'supplier'
        AND reference_id = ${supplierId}
      ORDER BY inspection_date DESC
      LIMIT 100`
    );
    const inspData = inspections as any[];
    const total = inspData.length;
    const passed = inspData.filter((i: any) => i.verdict === 'pass').length;
    const failed = inspData.filter((i: any) => i.verdict === 'fail').length;

    // Get NCRs for this supplier
    const ncrs = await this.drizzle.db.execute(sql`
      SELECT severity, status FROM qms_ncrs
      WHERE tenant_id = ${tenantId} AND reference_id = ${supplierId}
      ORDER BY reported_at DESC LIMIT 50`
    );
    const ncrData = ncrs as any[];
    const openNCRs = ncrData.filter((n: any) => n.status === 'open').length;
    const criticalNCRs = ncrData.filter((n: any) => n.severity === 'critical').length;

    // Calculate score (0-100)
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const ncrPenalty = (openNCRs * 5) + (criticalNCRs * 15);
    const score = Math.max(0, Math.round(passRate - ncrPenalty));

    // Grade
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';

    return {
      supplierId,
      score,
      grade,
      totalInspections: total,
      passRate: Math.round(passRate * 100) / 100,
      failed,
      openNCRs,
      criticalNCRs,
      trend: inspData.slice(0, 10).map((i: any) => ({ date: i.inspection_date, verdict: i.verdict })),
    };
  }

  async getSupplierQualityReport(tenantId: string) {
    // Get all suppliers with inspections
    const suppliers = await this.drizzle.db.execute(sql`
      SELECT DISTINCT reference_id as supplier_id
      FROM qms_inspections
      WHERE tenant_id = ${tenantId} AND reference_type = 'supplier'`
    );
    const supplierIds = (suppliers as any[]).map((s: any) => s.supplier_id);

    const scores = [];
    for (const sid of supplierIds) {
      try {
        const score = await this.getSupplierQualityScore(tenantId, sid);
        scores.push(score);
      } catch (e) {
        // skip failed calculations
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    return scores;
  }
}