import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'Customer database, contact history, CRM activities, and segmentation.',
};

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
