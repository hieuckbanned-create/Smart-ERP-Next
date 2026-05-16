import { pgTable, uuid, text, numeric, timestamp, index, integer, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { products } from './products';

/**
 * Bills of Materials (BOM) - Multi-level BOM support
 * Hỗ trợ cấu trúc BOM đa cấp, mỗi sản phẩm có thể chứa nhiều component,
 * mỗi component cũng có thể có BOM riêng (sub-assembly).
 */
export const billsOfMaterials = pgTable(
  'bills_of_materials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    /** Sản phẩm thành phẩm (parent) */
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    /** Nguyên vật liệu / bán thành phẩm (component) */
    componentProductId: uuid('component_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    /** Số lượng cần cho 1 đơn vị thành phẩm */
    quantity: numeric('quantity', { precision: 18, scale: 4 }).notNull(),
    /** Đơn giá nguyên vật liệu */
    unitCost: numeric('unit_cost', { precision: 18, scale: 2 }),
    /** Phần trăm hao hụt cho phép */
    wastagePercent: numeric('wastage_percent', { precision: 5, scale: 2 }).default('0'),
    /** Thứ tự lắp ráp / sản xuất */
    sequenceOrder: integer('sequence_order').default(0),
    /** Là bán thành phẩm (sub-assembly) — component có BOM riêng */
    isSubAssembly: boolean('is_sub_assembly').default(false),
    /** Ghi chú kỹ thuật (hướng dẫn lắp ráp, đặc tả kỹ thuật) */
    notes: text('notes'),
    /** Phiên bản BOM — dùng khi thay đổi công thức sản xuất */
    version: integer('version').default(1),
    /** BOM có đang active không */
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('boms_tenant_idx').on(table.tenantId),
    productIdx: index('boms_product_idx').on(table.productId),
    componentIdx: index('boms_component_idx').on(table.componentProductId),
    productVersionIdx: index('boms_product_version_idx').on(table.productId, table.version),
  })
);

export type BillOfMaterial = typeof billsOfMaterials.$inferSelect;
export type NewBillOfMaterial = typeof billsOfMaterials.$inferInsert;

/**
 * BOM Routing Operations — Quy trình sản xuất
 * Mỗi BOM có thể có nhiều bước (routing step) với thời gian ước tính,
 * work center, và chi phí nhân công.
 */
export const bomRoutings = pgTable(
  'bom_routings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    /** Liên kết với sản phẩm thành phẩm trong BOM */
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    /** Tên bước công đoạn (VD: Cắt, Hàn, Sơn, Kiểm tra) */
    operationName: text('operation_name').notNull(),
    /** Mô tả chi tiết */
    description: text('description'),
    /** Thứ tự thực hiện */
    sequenceOrder: integer('sequence_order').notNull().default(1),
    /** Tên work center / trạm làm việc */
    workCenter: text('work_center'),
    /** Thời gian setup (phút) */
    setupTimeMinutes: numeric('setup_time_minutes', { precision: 10, scale: 2 }).default('0'),
    /** Thời gian gia công mỗi đơn vị (phút) */
    cycleTimeMinutes: numeric('cycle_time_minutes', { precision: 10, scale: 2 }).notNull(),
    /** Chi phí nhân công mỗi giờ */
    laborCostPerHour: numeric('labor_cost_per_hour', { precision: 18, scale: 2 }).default('0'),
    /** Chi phí overhead mỗi giờ */
    overheadCostPerHour: numeric('overhead_cost_per_hour', { precision: 18, scale: 2 }).default('0'),
    /** Yêu cầu kiểm tra chất lượng sau bước này */
    requiresQC: boolean('requires_qc').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('bom_routings_tenant_idx').on(table.tenantId),
    productIdx: index('bom_routings_product_idx').on(table.productId),
    sequenceIdx: index('bom_routings_sequence_idx').on(table.productId, table.sequenceOrder),
  })
);

export type BomRouting = typeof bomRoutings.$inferSelect;
export type NewBomRouting = typeof bomRoutings.$inferInsert;
