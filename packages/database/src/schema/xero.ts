import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

// Xero integration connections
export const xeroConnections = pgTable(
  'xero_connections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    clientId: text('client_id').notNull(),
    clientSecret: text('client_secret').notNull(),
    refreshToken: text('refresh_token'),
    xeroTenantId: text('xero_tenant_id'),
    isActive: boolean('is_active').notNull().default(true),
    lastSyncAt: timestamp('last_sync_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('xero_connections_tenant_idx').on(table.tenantId),
  })
);

// Xero sync logs
export const xeroSyncLogs = pgTable(
  'xero_sync_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    syncType: text('sync_type').notNull(), // customers, invoices, etc.
    status: text('status').notNull(), // success, failed
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at').notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('xero_sync_logs_tenant_idx').on(table.tenantId),
  })
);

export type XeroConnection = typeof xeroConnections.$inferSelect;
export type NewXeroConnection = typeof xeroConnections.$inferInsert;
export type XeroSyncLog = typeof xeroSyncLogs.$inferSelect;
export type NewXeroSyncLog = typeof xeroSyncLogs.$inferInsert;
