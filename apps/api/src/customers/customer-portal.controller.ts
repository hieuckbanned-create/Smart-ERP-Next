import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('customer-portal')
@UseGuards(JwtAuthGuard)
export class CustomerPortalController {
  constructor(private readonly service: CustomerPortalService) {}

  @Get('orders')
  async getOrders(@Request() req: any) {
    return this.service.getOrders(req.user.tenantId, req.user.sub);
  }

  @Get('invoices')
  async getInvoices(@Request() req: any) {
    return this.service.getInvoices(req.user.tenantId, req.user.sub);
  }

  @Get('payments')
  async getPayments(@Request() req: any) {
    return this.service.getPaymentHistory(req.user.tenantId, req.user.sub);
  }

  @Get('tickets')
  async getTickets(@Request() req: any) {
    return this.service.getTickets(req.user.tenantId, req.user.sub);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.service.getProfile(req.user.tenantId, req.user.sub);
  }
}