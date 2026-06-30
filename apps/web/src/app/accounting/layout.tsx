import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounting',
  description: 'Chart of accounts, journal entries, VAT declaration, and financial reports.',
};

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
