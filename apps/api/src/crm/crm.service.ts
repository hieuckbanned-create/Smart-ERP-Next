import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { leads } from '@smart-erp/database';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class CrmService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getLeads(tenantId: string) {
    return this.drizzle.db
      .select()
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(tenantId: string, data: any) {
    const [lead] = await this.drizzle.db
      .insert(leads)
      .values({
        tenantId,
        ...data,
      })
      .returning();
    return lead;
  }

  async updateLeadStatus(tenantId: string, leadId: string, status: string) {
    const [updated] = await this.drizzle.db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
      
    if (!updated) {
      throw new NotFoundException('Lead not found');
    }
    return updated;
  }
}
