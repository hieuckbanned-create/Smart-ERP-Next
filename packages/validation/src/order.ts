import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().uuid('ID sản phẩm không hợp lệ'),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
  unitPrice: z.number().nonnegative('Đơn giá không được âm'),
  discountAmount: z.number().nonnegative().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  warehouseId: z.string().uuid().optional().nullable(),
  channel: z.enum(['pos', 'online', 'phone', 'wholesale']).default('pos'),
  discountAmount: z.number().nonnegative().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  shippingFee: z.number().nonnegative().optional(),
  paymentMethod: z
    .enum(['cash', 'bank_transfer', 'card', 'momo', 'vnpay', 'zalopay', 'credit'])
    .optional()
    .nullable(),
  shippingAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
