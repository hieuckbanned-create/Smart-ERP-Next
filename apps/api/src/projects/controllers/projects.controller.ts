import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.projectsService.createProject(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Request() req: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string, @Query('priority') priority?: string) {
    return this.projectsService.findAll(req.user.tenantId, { page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined, status, priority });
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.projectsService.updateProject(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteProject(req.user.tenantId, id);
  }

  @Get(':id/stats')
  getStats(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectStats(req.user.tenantId, id);
  }
}