import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Stock levels, warehouse transfers, inventory adjustments, and lot tracking.',
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
