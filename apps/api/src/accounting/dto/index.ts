import { z } from 'zod';

export const createChartOfAccountSchema = z.object({
  accountCode: z.string().min(1).max(20),
  accountName: z.string().min(1).max(200),
  accountNameEn: z.string().max(200).optional(),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
  currency: z.string().length(3).default('VND'),
});

export const updateChartOfAccountSchema = createChartOfAccountSchema.partial();

export type CreateChartOfAccountDto = z.infer<typeof createChartOfAccountSchema>;
export type UpdateChartOfAccountDto = z.infer<typeof updateChartOfAccountSchema>;

// Journal Entry DTOs
export const journalEntryLineDto = z.object({
  accountId: z.string().uuid(),
  debit: z.number().min(0).optional(),
  credit: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
});

export const createJournalEntrySchema = z.object({
  voucherTypeId: z.string().uuid().optional().nullable(),
  voucherDate: z.coerce.date(),
  description: z.string().max(1000).optional(),
  reference: z.string().max(100).optional(),
  lines: z.array(journalEntryLineDto).min(2),
  attachments: z.array(z.string()).optional(),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: 'Entry must be balanced (total debit equals total credit)', path: ['lines'] }
);

export const createJournalEntryDto = createJournalEntrySchema;
export type CreateJournalEntryDto = z.infer<typeof createJournalEntrySchema>;