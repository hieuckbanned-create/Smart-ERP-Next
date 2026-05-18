import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const warehouseTasks = pgTable(
  'warehouse_tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    warehouseId: uuid('warehouse_id').notNull(),
    taskType: text('task_type'), // pick, pack, ship, receive, count
    type: text('type'), // alias for taskType used in service
    status: text('status').notNull().default('pending'),
    priority: text('priority').notNull().default('medium'),
    assignedTo: uuid('assigned_to'),
    referenceType: text('reference_type'), // e.g., 'sale_order', 'purchase_order'
    referenceId: text('reference_id'), // the id of the related record
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('warehouse_tasks_tenant_idx').on(table.tenantId),
    warehouseIdx: index('warehouse_tasks_warehouse_idx').on(table.warehouseId),
  })
);

export type WarehouseTask = typeof warehouseTasks.$inferSelect;
export type NewWarehouseTask = typeof warehouseTasks.$inferInsert;