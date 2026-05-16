import { pgTable, uuid, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { products } from './products';
import { users } from './users';

export const productionOrders = pgTable(
  'production_orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    orderCode: text('order_code').notNull(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    quantity: numeric('quantity', { precision: 18, scale: 4 }).notNull(),
    status: text('status', { enum: ['draft', 'in_progress', 'completed', 'cancelled'] }).notNull().default('draft'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('prod_orders_tenant_idx').on(table.tenantId),
    statusIdx: index('prod_orders_status_idx').on(table.status),
    productIdx: index('prod_orders_product_idx').on(table.productId),
    codeIdx: index('prod_orders_code_idx').on(table.orderCode),
  })
);

export type ProductionOrder = typeof productionOrders.$inferSelect;
export type NewProductionOrder = typeof productionOrders.$inferInsert;
