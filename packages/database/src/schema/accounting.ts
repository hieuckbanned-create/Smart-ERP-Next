import { pgTable, uuid, varchar, numeric, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  accountCode: varchar('account_code', { length: 50 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(), // revenue, expense, asset, liability, equity
  parentId: uuid('parent_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  voucherNumber: varchar('voucher_number', { length: 50 }).notNull(),
  description: text('description'),
  voucherDate: timestamp('voucher_date').notNull(),
  totalAmount: numeric('total_amount', { precision: 18, scale: 2 }).notNull().default('0'),
  isPosted: boolean('is_posted').default(false),
  createdBy: uuid('created_by'),
  approvedBy: uuid('approved_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const journalEntryLines = pgTable('journal_entry_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id),
  accountId: uuid('account_id').notNull().references(() => chartOfAccounts.id),
  debit: numeric('debit', { precision: 18, scale: 2 }).default('0'),
  credit: numeric('credit', { precision: 18, scale: 2 }).default('0'),
  lineDescription: text('line_description'),
  createdAt: timestamp('created_at').defaultNow(),
});