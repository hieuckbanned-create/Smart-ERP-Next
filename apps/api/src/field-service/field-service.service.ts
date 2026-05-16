import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { serviceTickets } from '@smart-erp/database';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class FieldServiceService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getTickets(tenantId: string, technicianId?: string) {
    const conditions = [eq(serviceTickets.tenantId, tenantId)];
    if (technicianId) {
      conditions.push(eq(serviceTickets.assignedTechnicianId, technicianId));
    }
    
    return this.drizzle.db
      .select()
      .from(serviceTickets)
      .where(and(...conditions))
      .orderBy(desc(serviceTickets.createdAt));
  }

  async createTicket(tenantId: string, data: any) {
    const [ticket] = await this.drizzle.db
      .insert(serviceTickets)
      .values({
        tenantId,
        ...data,
      })
      .returning();
    return ticket;
  }

  async checkIn(tenantId: string, ticketId: string, location: any) {
    const [updated] = await this.drizzle.db
      .update(serviceTickets)
      .set({
        status: 'in_progress',
        checkInTime: new Date(),
        checkInLocation: location,
        updatedAt: new Date(),
      })
      .where(and(eq(serviceTickets.id, ticketId), eq(serviceTickets.tenantId, tenantId)))
      .returning();
      
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }

  async completeTicket(tenantId: string, ticketId: string, data: any) {
    const [updated] = await this.drizzle.db
      .update(serviceTickets)
      .set({
        status: 'completed',
        completedAt: new Date(),
        serviceReport: data.report,
        customerSignatureUrl: data.signatureUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(serviceTickets.id, ticketId), eq(serviceTickets.tenantId, tenantId)))
      .returning();
      
    if (!updated) throw new NotFoundException('Ticket not found');
    return updated;
  }
}
