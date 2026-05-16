import { pgTable, uuid, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { products } from './products';

export const billsOfMaterials = pgTable(
  'bills_of_materials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    componentProductId: uuid('component_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: numeric('quantity', { precision: 18, scale: 4 }).notNull(),
    unitCost: numeric('unit_cost', { precision: 18, scale: 2 }),
    wastagePercent: numeric('wastage_percent', { precision: 5, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('boms_tenant_idx').on(table.tenantId),
    productIdx: index('boms_product_idx').on(table.productId),
    componentIdx: index('boms_component_idx').on(table.componentProductId),
  })
);

export type BillOfMaterial = typeof billsOfMaterials.$inferSelect;
export type NewBillOfMaterial = typeof billsOfMaterials.$inferInsert;
