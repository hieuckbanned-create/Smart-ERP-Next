export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  description: string | null;
  category: string | null;
  unit: string | null;
  price: string; // numeric as string from DB
  cost: string | null;
  stock: number;
  minStock: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductInput = Omit<Product, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;
