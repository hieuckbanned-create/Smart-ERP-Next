import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { omnichannelMessages } from '@smart-erp/database';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class OmnichannelService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getMessages(tenantId: string, externalUserId?: string) {
    const conditions = [eq(omnichannelMessages.tenantId, tenantId)];
    if (externalUserId) {
      conditions.push(eq(omnichannelMessages.externalUserId, externalUserId));
    }
    
    return this.drizzle.db
      .select()
      .from(omnichannelMessages)
      .where(and(...conditions))
      .orderBy(desc(omnichannelMessages.sentAt))
      .limit(100);
  }

  async sendMessage(tenantId: string, data: any) {
    const [msg] = await this.drizzle.db
      .insert(omnichannelMessages)
      .values({
        tenantId,
        platform: data.platform,
        externalUserId: data.externalUserId,
        customerId: data.customerId,
        content: data.content,
        direction: 'outbound',
        status: 'sent',
      })
      .returning();
      
    // Simulation: Call external platform API (Zalo/FB) here
    
    return msg;
  }

  async receiveWebhookMessage(tenantId: string, payload: any) {
    // Logic to handle incoming webhook from Zalo/FB
    const [msg] = await this.drizzle.db
      .insert(omnichannelMessages)
      .values({
        tenantId,
        platform: payload.platform,
        externalUserId: payload.fromId,
        content: payload.text,
        direction: 'inbound',
        status: 'delivered',
      })
      .returning();
      
    return msg;
  }
}
