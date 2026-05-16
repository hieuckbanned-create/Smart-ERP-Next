import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { customers } from './customers';

export const omnichannelMessages = pgTable(
  'omnichannel_messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
      
    // Platform: facebook, zalo, web_chat, whatsapp
    platform: text('platform').notNull(),
    
    // ID của khách hàng trên nền tảng đó
    externalUserId: text('external_user_id').notNull(),
    
    // Tham chiếu đến khách hàng trong hệ thống (nếu có)
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    
    content: text('content').notNull(),
    
    // inbound (khách gửi) | outbound (nhân viên gửi)
    direction: text('direction', { enum: ['inbound', 'outbound'] }).notNull(),
    
    status: text('status', { enum: ['pending', 'sent', 'delivered', 'read', 'failed'] })
      .notNull()
      .default('pending'),
      
    sentAt: timestamp('sent_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('omnichannel_messages_tenant_idx').on(table.tenantId),
    customerIdx: index('omnichannel_messages_customer_idx').on(table.customerId),
    externalUserIdx: index('omnichannel_messages_external_user_idx').on(table.externalUserId),
  })
);

export type OmnichannelMessage = typeof omnichannelMessages.$inferSelect;
export type NewOmnichannelMessage = typeof omnichannelMessages.$inferInsert;
