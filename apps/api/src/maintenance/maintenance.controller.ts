import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Maintenance Management')
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @ApiOperation({ summary: 'List maintenance orders' })
  @Get('orders')
  getOrders(@Request() req: any) {
    return this.service.listOrders(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Report equipment failure (Corrective)' })
  @Post('requests')
  createRequest(@Request() req: any, @Body() body: any) {
    return this.service.createMaintenanceRequest(req.user.tenantId, body);
  }

  @ApiOperation({ summary: 'Run preventive schedule engine' })
  @Post('process-schedules')
  processSchedules(@Request() req: any) {
    return this.service.processDueSchedules(req.user.tenantId);
  }
}
