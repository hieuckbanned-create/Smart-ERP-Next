import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Manage product catalog, SKUs, pricing, and inventory.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
