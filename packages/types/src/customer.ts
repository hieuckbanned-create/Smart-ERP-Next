export interface Customer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  taxCode: string | null;
  contactPerson: string | null;
  customerGroup: string | null;
  debtLimit: string | null;
  currentDebt: string | null;
  totalPurchased: string | null;
  loyaltyPoints: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
