import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Business analytics, forecast reports, cashflow projections, and custom reports.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
