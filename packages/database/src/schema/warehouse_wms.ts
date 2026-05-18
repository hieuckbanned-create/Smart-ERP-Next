import { pgTable, uuid, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const warehouseLocations = pgTable(
  'warehouse_locations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    warehouseId: uuid('warehouse_id').notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    type: text('type'), // e.g., 'storage', 'receiving', 'shipping'
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('warehouse_locations_tenant_idx').on(table.tenantId),
    warehouseIdx: index('warehouse_locations_warehouse_idx').on(table.warehouseId),
  })
);

export const warehouseTaskItems = pgTable(
  'warehouse_task_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').notNull(),
    productId: uuid('product_id').notNull(),
    quantity: text('quantity').notNull(),
    pickedQuantity: text('picked_quantity'),
    fromLocationId: uuid('from_location_id'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index('warehouse_task_items_task_idx').on(table.taskId),
  })
);
