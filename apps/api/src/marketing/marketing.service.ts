import { Injectable } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { marketingCampaigns, marketingSegments, leadScoringRules, leads } from '@smart-erp/database/schema';
import { eq, and, sql, desc } from '@smart-erp/database/drizzle';

@Injectable()
export class MarketingService {
  /**
   * Automatically process an event and update lead score
   */
  async processEvent(tenantId: string, leadId: string, event: string) {
    const [rule] = await db
      .select()
      .from(leadScoringRules)
      .where(and(eq(leadScoringRules.tenantId, tenantId), eq(leadScoringRules.event, event), eq(leadScoringRules.isActive, true)))
      .limit(1);

    if (rule) {
      await db.execute(sql`
        UPDATE leads 
        SET score = score + ${rule.points}, 
            updated_at = NOW() 
        WHERE id = ${leadId} AND tenant_id = ${tenantId}
      `);
    }
    return { success: true };
  }

  async getCampaignPerformance(tenantId: string) {
    return db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.tenantId, tenantId))
      .orderBy(desc(marketingCampaigns.createdAt));
  }

  async getSegments(tenantId: string) {
    return db
      .select()
      .from(marketingSegments)
      .where(eq(marketingSegments.tenantId, tenantId));
  }

  async createCampaign(tenantId: string, data: any) {
    const [campaign] = await db
      .insert(marketingCampaigns)
      .values({
        ...data,
        tenantId,
      })
      .returning();
    return campaign;
  }
}
