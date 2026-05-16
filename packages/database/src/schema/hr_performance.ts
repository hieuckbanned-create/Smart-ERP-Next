import { pgTable, uuid, text, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './users';

export const kpiDefinitions = pgTable(
  'kpi_definitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
      
    name: text('name').notNull(), // e.g., "Sales Target", "Code Quality"
    category: text('category'), // e.g., "Financial", "Operational", "Learning"
    unit: text('unit').default('percent'), // percent, currency, number
    
    weight: decimal('weight', { precision: 5, scale: 2 }).default('1.0'), // Importance weight
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    tenantIdx: index('kpi_def_tenant_idx').on(t.tenantId),
  })
);

export const employeeKpiTargets = pgTable(
  'employee_kpi_targets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kpiId: uuid('kpi_id')
      .notNull()
      .references(() => kpiDefinitions.id, { onDelete: 'cascade' }),
      
    period: text('period').notNull(), // e.g., "2026-05", "2026-Q2"
    targetValue: decimal('target_value', { precision: 20, scale: 2 }).notNull(),
    actualValue: decimal('actual_value', { precision: 20, scale: 2 }).default('0'),
    
    score: decimal('score', { precision: 5, scale: 2 }).default('0'), // Calculated score (0-100)
    
    status: text('status', { enum: ['open', 'submitted', 'reviewed'] }).default('open'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    tenantIdx: index('emp_kpi_tenant_idx').on(t.tenantId),
    employeeIdx: index('emp_kpi_employee_idx').on(t.employeeId),
    periodIdx: index('emp_kpi_period_idx').on(t.period),
  })
);

export const performanceReviews = pgTable(
  'performance_reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    reviewerId: uuid('reviewer_id')
      .notNull()
      .references(() => users.id),
      
    period: text('period').notNull(),
    
    selfAssessment: text('self_assessment'),
    managerFeedback: text('manager_feedback'),
    
    overallScore: decimal('overall_score', { precision: 5, scale: 2 }),
    
    status: text('status', { enum: ['draft', 'submitted', 'finalized'] }).default('draft'),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    tenantIdx: index('perf_review_tenant_idx').on(t.tenantId),
    employeeIdx: index('perf_review_employee_idx').on(t.employeeId),
  })
);

export type KpiDefinition = typeof kpiDefinitions.$inferSelect;
export type EmployeeKpiTarget = typeof employeeKpiTargets.$inferSelect;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
