export type OrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'momo' | 'vnpay' | 'zalopay' | 'credit';
export type OrderChannel = 'pos' | 'online' | 'phone' | 'wholesale';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  unit: string | null;
  quantity: number;
  unitPrice: string;
  discountAmount: string | null;
  discountPercent: string | null;
  taxRate: string | null;
  lineTotal: string;
  notes: string | null;
  serialNumbers: string | null;
  batchNumber: string | null;
  expiryDate: Date | null;
}

export interface Order {
  id: string;
  tenantId: string;
  code: string;
  customerId: string | null;
  warehouseId: string | null;
  assignedTo: string | null;
  status: OrderStatus;
  channel: OrderChannel;
  subtotal: string;
  discountAmount: string | null;
  discountPercent: string | null;
  taxAmount: string | null;
  shippingFee: string | null;
  total: string;
  paidAmount: string | null;
  debtAmount: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  shippingAddress: string | null;
  shippingProvider: string | null;
  trackingCode: string | null;
  notes: string | null;
  tags: string | null;
  cancelReason: string | null;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export type CreateOrderInput = {
  customerId?: string;
  warehouseId?: string;
  channel?: OrderChannel;
  discountAmount?: number;
  discountPercent?: number;
  shippingFee?: number;
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  notes?: string;
  tags?: string[];
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    discountPercent?: number;
    taxRate?: number;
    notes?: string;
    batchNumber?: string;
  }[];
};
