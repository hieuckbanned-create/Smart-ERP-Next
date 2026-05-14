import { Controller, Get, Post, Patch, Delete, UseGuards, Request, Body, Param, Query } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('manufacturing')
@UseGuards(JwtAuthGuard)
export class ManufacturingController {
  constructor(private readonly service: ManufacturingService) {}

  @Get('bom/:productId')
  async getBOM(@Request() req: any, @Param('productId') productId: string) {
    return this.service.getBOM(productId, req.user.tenantId);
  }

  @Post('bom')
  async addBOMItem(@Request() req: any, @Body() body: { productId: string } & any) {
    return this.service.addBOMItem(req.user.tenantId, body.productId, body);
  }

  @Get('orders')
  async listOrders(@Request() req: any, @Query('status') status?: string, @Query('page') page?: number) {
    return this.service.listProductionOrders(req.user.tenantId, status, 20, Number(page) || 1);
  }

  @Post('orders')
  async createOrder(@Request() req: any, @Body() body: any) {
    return this.service.createProductionOrder(req.user.tenantId, req.user.sub, body);
  }

  @Patch('orders/:id/start')
  async startOrder(@Request() req: any, @Param('id') id: string) {
    return this.service.startProduction(req.user.tenantId, id, req.user.sub);
  }

  @Patch('orders/:id/complete')
  async completeOrder(@Request() req: any, @Param('id') id: string) {
    return this.service.completeProduction(req.user.tenantId, id, req.user.sub);
  }

  @Get('orders/:id')
  async getOrder(@Request() req: any, @Param('id') id: string) {
    return this.service.getProductionOrderById(req.user.tenantId, id);
  }

  @Get('orders/:id/qc')
  async getQCCheckpoints(@Request() req: any, @Param('id') id: string) {
    return this.service.getQCCheckpoints(id, req.user.tenantId);
  }

  @Patch('orders/:id/qc/:checkpointId')
  async updateQCCheckpoint(@Request() req: any, @Param('id') orderId: string, @Param('checkpointId') checkpointId: string, @Body() body: any) {
    return this.service.updateQCCheckpoint(orderId, checkpointId, body.status, body.notes);
  }

  @Get('cost/:productId')
  async calculateCost(@Request() req: any, @Param('productId') productId: string, @Query('quantity') quantity: string) {
    return this.service.calculateProductionCost(req.user.tenantId, productId, Number(quantity));
  }
}