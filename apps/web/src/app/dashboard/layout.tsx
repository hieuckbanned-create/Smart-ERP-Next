import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Business overview, revenue chart, top products, and recent orders.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
