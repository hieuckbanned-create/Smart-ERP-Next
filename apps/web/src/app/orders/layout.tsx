import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'View and manage sales orders, POS transactions, and order fulfillment.',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
