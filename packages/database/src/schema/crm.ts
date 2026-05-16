import { pgTable, uuid, text, numeric, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './users';

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    
    name: text('name').notNull(),
    company: text('company'),
    email: text('email'),
    phone: text('phone'),
    
    // Nguồn khách (Tiktok, Facebook, Zalo, Website, Khác)
    source: text('source').default('manual'),
    
    // Pipeline Status: new, contacted, qualified, proposal, won, lost
    status: text('status', {
      enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
    }).notNull().default('new'),
    
    // Giá trị ước tính (Nếu chốt được deal)
    estimatedValue: numeric('estimated_value', { precision: 15, scale: 2 }).default('0'),
    
    // Chấm điểm tiềm năng (AI Score hoặc Manual: 0 - 100)
    score: integer('score').default(0),

    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    tenantIdx: index('leads_tenant_idx').on(t.tenantId),
    statusIdx: index('leads_status_idx').on(t.status),
    assigneeIdx: index('leads_assignee_idx').on(t.assignedTo),
  })
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
