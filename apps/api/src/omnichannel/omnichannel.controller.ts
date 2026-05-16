import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { OmnichannelService } from './omnichannel.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Omnichannel Messaging')
@Controller('omnichannel/messages')
@UseGuards(JwtAuthGuard)
export class OmnichannelController {
  constructor(private readonly service: OmnichannelService) {}

  @ApiOperation({ summary: 'Get chat history for a customer/platform' })
  @Get()
  getMessages(@Request() req: any, @Query('externalUserId') externalUserId?: string) {
    return this.service.getMessages(req.user.tenantId, externalUserId);
  }

  @ApiOperation({ summary: 'Send a message to a social platform (Zalo/FB)' })
  @Post()
  sendMessage(@Request() req: any, @Body() body: any) {
    return this.service.sendMessage(req.user.tenantId, body);
  }
}
