import { Injectable } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { featureFlags } from '@smart-erp/database/schema';
import { eq, and } from '@smart-erp/database/drizzle';

@Injectable()
export class FeatureFlagsService {
  async isEnabled(tenantId: string, flagKey: string): Promise<boolean> {
    const [flag] = await db.select().from(featureFlags).where(
      and(eq(featureFlags.tenantId, tenantId), eq(featureFlags.flagKey, flagKey)),
    );
    return flag?.enabled ?? false;
  }

  async getAllFlags(tenantId: string): Promise<{ flagKey: string; enabled: boolean; description?: string }[]> {
    const rows = await db.select().from(featureFlags).where(eq(featureFlags.tenantId, tenantId));
    return rows.map((r) => ({ flagKey: r.flagKey, enabled: r.enabled, description: r.description ?? undefined }));
  }

  async setFlag(tenantId: string, flagKey: string, enabled: boolean, updatedBy: string) {
    const [existing] = await db.select().from(featureFlags).where(
      and(eq(featureFlags.tenantId, tenantId), eq(featureFlags.flagKey, flagKey)),
    );
    if (existing) {
      await db.update(featureFlags).set({ enabled, updatedBy }).where(eq(featureFlags.id, existing.id));
    } else {
      await db.insert(featureFlags).values({ tenantId, flagKey, enabled, updatedBy });
    }
  }
}
