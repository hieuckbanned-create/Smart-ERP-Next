import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { fixedAssets } from '@smart-erp/database/schema';
import { eq, and, sql } from '@smart-erp/database/drizzle';

@Injectable()
export class FixedAssetsService {
  async create(tenantId: string, dto: any) {
    const existing = await db
      .select()
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.code, dto.code)));

    if (existing.length > 0) {
      throw new Error('Asset code already exists');
    }

    const [asset] = await db
      .insert(fixedAssets)
      .values({ ...dto, tenantId })
      .returning();

    return asset;
  }

  async findAll(tenantId: string, query: { page?: number; limit?: number; category?: string; status?: string }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(fixedAssets.tenantId, tenantId)];
    if (query.category) conditions.push(eq(fixedAssets.category, query.category));
    if (query.status) conditions.push(eq(fixedAssets.status, query.status));

    const where = and(...conditions);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fixedAssets)
      .where(where);

    const items = await db
      .select()
      .from(fixedAssets)
      .where(where)
      .orderBy(fixedAssets.code)
      .limit(limit)
      .offset(offset);

    return { items, total: count, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async findOne(tenantId: string, id: number) {
    const [asset] = await db
      .select()
      .from(fixedAssets)
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.id, id)));

    if (!asset) throw new NotFoundException('Fixed asset not found');
    return asset;
  }

  async calculateMonthlyDepreciation(tenantId: string, id: number) {
    const asset = await this.findOne(tenantId, id);
    const depreciableAmount = asset.purchaseCost - asset.residualValue;
    return depreciableAmount / asset.usefulLifeMonths;
  }

  async dispose(tenantId: string, id: number) {
    const [asset] = await db
      .update(fixedAssets)
      .set({ status: 'disposed', updatedAt: new Date() })
      .where(and(eq(fixedAssets.tenantId, tenantId), eq(fixedAssets.id, id)))
      .returning();

    if (!asset) throw new NotFoundException('Fixed asset not found');
    return asset;
  }
}