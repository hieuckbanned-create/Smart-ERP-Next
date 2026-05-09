import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên tối đa 100 ký tự'),
  slug: z.string()
    .min(1, 'Slug không được để trống')
    .max(50, 'Slug tối đa 50 ký tự')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
