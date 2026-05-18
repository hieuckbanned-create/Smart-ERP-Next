import { pgTable, uuid, text, timestamp, boolean, numeric, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const customers = pgTable(
  'customers',
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
    externalId: text('external_id'),
    externalPlatform: text('external_platform'),
    customerGroup: text('customer_group').default('retail'), // retail, wholesale, vip
    debtLimit: numeric('debt_limit', { precision: 18, scale: 2 }).default('0'),
    currentDebt: numeric('current_debt', { precision: 18, scale: 2 }).default('0'),
    totalPurchased: numeric('total_purchased', { precision: 18, scale: 2 }).default('0'),
    loyaltyPoints: numeric('loyalty_points', { precision: 10, scale: 0 }).default('0'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('customers_tenant_idx').on(table.tenantId),
    codeIdx: index('customers_code_idx').on(table.code),
    phoneIdx: index('customers_phone_idx').on(table.phone),
  })
);

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
