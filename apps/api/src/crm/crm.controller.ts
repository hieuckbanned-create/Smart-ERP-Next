import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly service: CrmService) {}

  @ApiOperation({ summary: 'List all leads' })
  @Get('leads')
  getLeads(@Request() req: any) {
    return this.service.getLeads(req.user.tenantId);
  }

  @ApiOperation({ summary: 'Create a new lead' })
  @Post('leads')
  createLead(@Request() req: any, @Body() body: any) {
    return this.service.createLead(req.user.tenantId, body);
  }

  @ApiOperation({ summary: 'Update lead status in pipeline' })
  @Patch('leads/:id/status')
  updateLeadStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateLeadStatus(req.user.tenantId, id, body.status);
  }
}
