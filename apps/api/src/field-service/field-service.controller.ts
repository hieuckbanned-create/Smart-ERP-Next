import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FieldServiceService } from './field-service.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Field Service')
@Controller('field-service')
@UseGuards(JwtAuthGuard)
export class FieldServiceController {
  constructor(private readonly service: FieldServiceService) {}

  @ApiOperation({ summary: 'List service tickets' })
  @Get('tickets')
  getTickets(@Request() req: any) {
    // Nếu là technician thì chỉ lấy ticket của mình, nếu là admin thì lấy hết
    const technicianId = req.user.role === 'technician' ? req.user.sub : undefined;
    return this.service.getTickets(req.user.tenantId, technicianId);
  }

  @ApiOperation({ summary: 'Create a service ticket' })
  @Post('tickets')
  createTicket(@Request() req: any, @Body() body: any) {
    return this.service.createTicket(req.user.tenantId, body);
  }

  @ApiOperation({ summary: 'Technician check-in at site' })
  @Patch('tickets/:id/check-in')
  checkIn(@Request() req: any, @Param('id') id: string, @Body() location: any) {
    return this.service.checkIn(req.user.tenantId, id, location);
  }

  @ApiOperation({ summary: 'Complete service ticket' })
  @Patch('tickets/:id/complete')
  completeTicket(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.service.completeTicket(req.user.tenantId, id, data);
  }
}
