import { pgTable, uuid, text, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const fixedAssets = pgTable(
  'fixed_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
      
    code: text('code').notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(), // e.g., 'machinery', 'vehicles', 'buildings'
    
    purchaseDate: timestamp('purchase_date').notNull(),
    purchaseCost: decimal('purchase_cost', { precision: 20, scale: 2 }).notNull().default('0'),
    
    usefulLifeMonths: integer('useful_life_months').notNull(),
    residualValue: decimal('residual_value', { precision: 20, scale: 2 }).notNull().default('0'),
    
    accumulatedDepreciation: decimal('accumulated_depreciation', { precision: 20, scale: 2 })
      .notNull()
      .default('0'),
      
    // Status: active, disposed, maintenance, under_repair
    status: text('status').notNull().default('active'),
    
    lastDepreciationDate: timestamp('last_depreciation_date'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('fixed_assets_tenant_idx').on(table.tenantId),
    codeIdx: index('fixed_assets_code_idx').on(table.code),
    categoryIdx: index('fixed_assets_category_idx').on(table.category),
  })
);

export const fixedAssetDepreciationLogs = pgTable(
  'fixed_asset_depreciation_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => fixedAssets.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
      
    amount: decimal('amount', { precision: 20, scale: 2 }).notNull(),
    depreciationDate: timestamp('depreciation_date').notNull(),
    
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    assetIdx: index('fixed_asset_dep_asset_idx').on(table.assetId),
    tenantIdx: index('fixed_asset_dep_tenant_idx').on(table.tenantId),
  })
);

export type FixedAsset = typeof fixedAssets.$inferSelect;
export type NewFixedAsset = typeof fixedAssets.$inferInsert;
export type FixedAssetDepreciationLog = typeof fixedAssetDepreciationLogs.$inferSelect;
export type NewFixedAssetDepreciationLog = typeof fixedAssetDepreciationLogs.$inferInsert;
