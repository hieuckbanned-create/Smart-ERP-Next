import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().optional().nullable(),
  tenantId: z.string().uuid('Tenant ID không hợp lệ'),
});

export const updateUserSchema = createUserSchema.partial();

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
