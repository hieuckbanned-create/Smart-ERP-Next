import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { customers, orders, invoices, payments, tickets } from '@smart-erp/database';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface CustomerPortalOrder {
  id: string;
  code: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
  canTrack: boolean;
}

export interface CustomerPortalInvoice {
  id: string;
  code: string;
  orderCode: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  lastMessage: string;
}

@Injectable()
export class CustomerPortalService {
  constructor(private readonly drizzle: DrizzleService) {}

  /** Get customer's orders */
  async getOrders(tenantId: string, customerId: string) {
    return this.drizzle.db.execute(
      sql`
        SELECT
          o.id,
          o.order_code as "code",
          o.status,
          o.total,
          (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id) as "items",
          o.created_at as "createdAt"
        FROM orders o
        WHERE o.tenant_id = ${tenantId}
          AND o.customer_id = ${customerId}
        ORDER BY o.created_at DESC
        LIMIT 50
      `,
    );
  }

  /** Get customer's invoices */
  async getInvoices(tenantId: string, customerId: string) {
    return this.drizzle.db.execute(
      sql`
        SELECT
          i.id,
          i.code,
          o.order_code as "orderCode",
          i.amount,
          i.status,
          i.due_date as "dueDate",
          i.created_at as "createdAt"
        FROM invoices i
        LEFT JOIN orders o ON o.id = i.order_id
        WHERE i.tenant_id = ${tenantId}
          AND o.customer_id = ${customerId}
        ORDER BY i.created_at DESC
        LIMIT 50
      `,
    );
  }

  /** Get customer's payment history */
  async getPaymentHistory(tenantId: string, customerId: string) {
    return this.drizzle.db.execute(
      sql`
        SELECT
          p.id,
          p.code,
          p.amount,
          p.method,
          p.status,
          p.paid_at as "paidAt",
          o.order_code as "orderCode"
        FROM payments p
        LEFT JOIN orders o ON o.id = p.order_id
        WHERE p.tenant_id = ${tenantId}
          AND o.customer_id = ${customerId}
        ORDER BY p.paid_at DESC
        LIMIT 50
      `,
    );
  }

  /** Get customer's support tickets */
  async getTickets(tenantId: string, customerId: string) {
    const result = await this.drizzle.db.execute(
      sql`
        SELECT
          t.id,
          t.subject,
          t.status,
          t.created_at as "createdAt",
          m.content as "lastMessage"
        FROM tickets t
        LEFT JOIN (
          SELECT ticket_id, content, created_at
          FROM ticket_messages
          ORDER BY created_at DESC
          LIMIT 1
        ) m ON m.ticket_id = t.id
        WHERE t.tenant_id = ${tenantId}
          AND t.customer_id = ${customerId}
        ORDER BY t.created_at DESC
        LIMIT 20
      `,
    );
    return result;
  }

  /** Get customer profile */
  async getProfile(tenantId: string, customerId: string) {
    const [customer] = await this.drizzle.db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
      .limit(1);

    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}