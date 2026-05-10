import { pgTable, uuid, text, timestamp, boolean, numeric, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    ward: text('ward'),
    district: text('district'),
    province: text('province'),
    taxCode: text('tax_code'),
    contactPerson: text('contact_person'),
    bankAccount: text('bank_account'),
    bankName: text('bank_name'),
    paymentTermDays: numeric('payment_term_days', { precision: 5, scale: 0 }).default('30'),
    currentDebt: numeric('current_debt', { precision: 18, scale: 2 }).default('0'),
    totalPurchased: numeric('total_purchased', { precision: 18, scale: 2 }).default('0'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('suppliers_tenant_idx').on(table.tenantId),
    codeIdx: index('suppliers_code_idx').on(table.code),
  })
);

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
