import { pgTable, text, uuid, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const schedulerLog = pgTable('scheduler_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobName: text('job_name').notNull(),
  success: boolean('success').notNull(),
  durationMs: integer('duration_ms').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  jobNameIdx: index('scheduler_log_job_name_idx').on(table.jobName),
  createdAtIdx: index('scheduler_log_created_at_idx').on(table.createdAt),
}));
