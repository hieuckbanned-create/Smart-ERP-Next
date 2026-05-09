export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTenantInput = Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTenantInput = Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>;
