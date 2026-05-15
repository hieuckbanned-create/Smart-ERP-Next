import { Controller, Get, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { SupplierCollaborationService } from './supplier-collaboration.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('supplier-portal')
@UseGuards(JwtAuthGuard)
export class SupplierCollaborationController {
  constructor(private readonly service: SupplierCollaborationService) {}

  @Get('orders')
  async getMyOrders(@Request() req: any) {
    return this.service.getSupplierOrders(req.user.sub, req.user.tenantId);
  }

  @Get('performance')
  async getMyPerformance(@Request() req: any) {
    return this.service.getSupplierPerformance(req.user.sub, req.user.tenantId);
  }

  @Patch('orders/:orderId/confirm-delivery')
  async confirmDelivery(
    @Request() req: any,
    @Param('orderId') orderId: string,
  ) {
    return this.service.confirmDelivery(req.user.sub, orderId, req.user.tenantId);
  }
}