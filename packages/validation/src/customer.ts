import { z } from 'zod';

export const createCustomerSchema = z.object({
  code: z.string().min(1, 'Mã khách hàng không được để trống'),
  name: z.string().min(1, 'Tên khách hàng không được để trống'),
  phone: z.string().regex(/^[0-9+\-\s()]{7,15}$/, 'Số điện thoại không hợp lệ').optional().nullable(),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  address: z.string().optional().nullable(),
  ward: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  customerGroup: z.enum(['retail', 'wholesale', 'vip']).default('retail'),
  debtLimit: z.number().nonnegative().optional(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
