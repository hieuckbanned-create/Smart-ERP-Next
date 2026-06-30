import { pgTable, text, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  flagKey: text('flag_key').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  description: text('description'),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
