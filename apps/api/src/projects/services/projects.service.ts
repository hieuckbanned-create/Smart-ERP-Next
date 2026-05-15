import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@smart-erp/database';
import { eq, and, sql } from '@smart-erp/database/drizzle';

@Injectable()
export class ProjectsService {
  async createProject(tenantId: string, dto: any) {
    const { projects } = await import('@smart-erp/database/schema');
    const existing = await db.select().from(projects).where(and(eq(projects.tenantId, tenantId), eq(projects.code, dto.code)));
    if (existing.length > 0) throw new Error('Project code already exists');
    const [project] = await db.insert(projects).values({ ...dto, tenantId }).returning();
    return project;
  }

  async findAll(tenantId: string, query: { page?: number; limit?: number; status?: string; priority?: string }) {
    const { projects } = await import('@smart-erp/database/schema');
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(projects.tenantId, tenantId)];
    if (query.status) conditions.push(eq(projects.status, query.status));
    if (query.priority) conditions.push(eq(projects.priority, query.priority));
    const where = and(...conditions);
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(projects).where(where);
    const items = await db.select().from(projects).where(where).orderBy(projects.createdAt).limit(limit).offset(offset);
    return { items, total: count, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async findOne(tenantId: string, id: number) {
    const { projects } = await import('@smart-erp/database/schema');
    const [project] = await db.select().from(projects).where(and(eq(projects.tenantId, tenantId), eq(projects.id, id)));
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(tenantId: string, id: number, dto: any) {
    const { projects } = await import('@smart-erp/database/schema');
    const [project] = await db.update(projects).set({ ...dto, updatedAt: new Date() }).where(and(eq(projects.tenantId, tenantId), eq(projects.id, id))).returning();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async deleteProject(tenantId: string, id: number) {
    const { projects } = await import('@smart-erp/database/schema');
    const [project] = await db.delete(projects).where(and(eq(projects.tenantId, tenantId), eq(projects.id, id))).returning();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getProjectStats(tenantId: string, id: number) {
    const { projectTasks, projectTimeEntries } = await import('@smart-erp/database/schema');
    const project = await this.findOne(tenantId, id);
    const tasks = await db.select().from(projectTasks).where(and(eq(projectTasks.tenantId, tenantId), eq(projectTasks.projectId, id)));
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const timeEntries = await db.select().from(projectTimeEntries).where(and(eq(projectTimeEntries.tenantId, tenantId), eq(projectTimeEntries.projectId, id)));
    const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);
    return { project, totalTasks, completedTasks, inProgressTasks, totalHours, completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 };
  }
}