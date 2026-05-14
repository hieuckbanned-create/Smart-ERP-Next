import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { ecommerceStores } from './ecommerce_stores';
import { products } from './products';

// Inventory reservations for oversell prevention
export const inventoryReservations = pgTable(
  'inventory_reservations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    storeId: uuid('store_id')
      .notNull()
      .references(() => ecommerceStores.id, { onDelete: 'cascade' }),
    externalOrderId: text('external_order_id').notNull(), // Marketplace order ID
    productId: uuid('product_id').notNull(),
    quantityReserved: integer('quantity_reserved').notNull().default(0),
    // status: reserved (when order imported), consumed (when fulfilled), released (when cancelled)
    status: text('status').notNull().default('reserved'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('inventory_reservations_tenant_idx').on(table.tenantId),
    storeIdx: index('inventory_reservations_store_idx').on(table.storeId),
    externalOrderIdx: index('inventory_reservations_external_order_idx').on(table.externalOrderId),
    productIdx: index('inventory_reservations_product_idx').on(table.productId),
    statusIdx: index('inventory_reservations_status_idx').on(table.status),
  })
);

export type InventoryReservation = typeof inventoryReservations.$inferSelect;
export type NewInventoryReservation = typeof inventoryReservations.$inferInsert;
