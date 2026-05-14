import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly service: AutomationService) {}

  @Get('triggers')
  getTriggers(@Request() req: any) {
    return this.service.getAvailableTriggers();
  }

  @Get('actions')
  getActions(@Request() req: any) {
    return this.service.getAvailableActions();
  }

  @Get()
  listWorkflows(@Request() req: any) {
    return this.service.listWorkflows(req.user.tenantId);
  }

  @Post()
  createWorkflow(@Request() req: any, @Body() body: {
    name: string;
    description?: string;
    triggerType: 'webhook' | 'schedule';
    triggerEvent?: string;
    triggerCron?: string;
    steps: { type: string; config: Record<string, unknown> }[];
  }) {
    return this.service.createWorkflow(req.user.tenantId, body);
  }

  @Patch(':id/toggle')
  toggleWorkflow(@Request() req: any, @Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.service.toggleWorkflow(req.user.tenantId, id, body.isActive);
  }
}