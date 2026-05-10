import { apiClient } from './api-client';

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export const productsApi = {
  getAll: async (params?: ProductQueryParams) => {
    const response = await apiClient.get<ProductsResponse>('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
  getBySku: async (sku: string) => {
    const response = await apiClient.get<Product>(`/products/sku/${sku}`);
    return response.data;
  },
  create: async (data: Omit<Product, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },
  adjustStock: async (id: string, quantity: number) => {
    const response = await apiClient.patch<Product>(`/products/${id}/stock`, { quantity });
    return response.data;
  },
};
