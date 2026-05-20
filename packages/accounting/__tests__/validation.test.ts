import {
  chartOfAccountSchema,
  moveAccountSchema,
  updateChartOfAccountSchema,
} from '../src/chart-of-accounts/validation';
import {
  journalEntryLineSchema,
  journalEntrySchema,
  postJournalEntrySchema,
  reverseJournalEntrySchema,
} from '../src/journal-entry/validation';

const accountId = '11111111-1111-4111-8111-111111111111';
const otherAccountId = '22222222-2222-4222-8222-222222222222';
const entryId = '33333333-3333-4333-8333-333333333333';

describe('accounting validation schemas', () => {
  it('validates chart of account creation defaults and constraints', () => {
    const parsed = chartOfAccountSchema.parse({
      accountCode: '111',
      accountName: 'Cash on hand',
      accountType: 'asset',
    });

    expect(parsed).toMatchObject({
      accountCode: '111',
      accountName: 'Cash on hand',
      accountType: 'asset',
      isActive: true,
      currency: 'VND',
    });
    expect(chartOfAccountSchema.safeParse({ accountCode: '', accountName: '', accountType: 'asset' }).success).toBe(false);
    expect(chartOfAccountSchema.safeParse({ accountCode: '111', accountName: 'Cash', accountType: 'invalid' }).success).toBe(false);
  });

  it('allows partial chart of account updates and validates move payloads', () => {
    expect(updateChartOfAccountSchema.parse({ accountName: 'Updated name' })).toEqual({ accountName: 'Updated name' });
    expect(moveAccountSchema.parse({ accountId, newParentId: null, newPosition: 0 })).toEqual({
      accountId,
      newParentId: null,
      newPosition: 0,
    });
    expect(moveAccountSchema.safeParse({ accountId: 'bad-id', newParentId: null }).success).toBe(false);
  });

  it('validates balanced journal entries', () => {
    const parsed = journalEntrySchema.parse({
      voucherDate: '2026-05-20',
      description: 'Opening balance',
      lines: [
        { accountId, debit: 1000, description: 'Debit cash' },
        { accountId: otherAccountId, credit: 1000, description: 'Credit equity' },
      ],
      attachments: ['opening.pdf'],
    });

    expect(parsed.voucherDate).toBeInstanceOf(Date);
    expect(parsed.lines).toHaveLength(2);
    expect(journalEntryLineSchema.parse({ accountId, debit: 0, credit: 10 }).credit).toBe(10);
  });

  it('rejects unbalanced or incomplete journal entries', () => {
    expect(
      journalEntrySchema.safeParse({
        voucherDate: '2026-05-20',
        lines: [
          { accountId, debit: 1000 },
          { accountId: otherAccountId, credit: 999 },
        ],
      }).success
    ).toBe(false);

    expect(journalEntrySchema.safeParse({ voucherDate: '2026-05-20', lines: [{ accountId, debit: 1000 }] }).success).toBe(false);
  });

  it('validates post and reverse journal entry commands', () => {
    expect(postJournalEntrySchema.parse({ entryId })).toEqual({ entryId });
    expect(reverseJournalEntrySchema.parse({ entryId, reverseDate: '2026-05-21', reason: 'Correction' })).toMatchObject({
      entryId,
      reason: 'Correction',
    });
    expect(reverseJournalEntrySchema.safeParse({ entryId: 'bad-id' }).success).toBe(false);
  });
});
