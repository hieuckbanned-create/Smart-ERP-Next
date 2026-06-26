jest.mock('@smart-erp/database', () => {
  const db: any = () => db;
  const chainFn = jest.fn(() => db);

  db.select = chainFn;
  db.from = chainFn;
  db.where = chainFn;
  db.orderBy = chainFn;
  db.limit = chainFn;
  db.offset = chainFn;
  db.insert = chainFn;
  db.values = chainFn;
  db.update = chainFn;
  db.set = chainFn;
  db.delete = chainFn;
  db.execute = jest.fn();
  db.returning = jest.fn();
  db.then = jest.fn();
  db.innerJoin = chainFn;
  db.leftJoin = chainFn;
  db.groupBy = chainFn;

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ projects: {}, projectTasks: {}, projectTimesheets: {}, projectTaskDependencies: {}, projectMembers: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
  desc: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { ProjectsService } from '../projects/services/projects.service';

describe('ProjectsService (integration)', () => {
  let service: ProjectsService;
  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    (db as any).returning.mockResolvedValue([]);
    service = new (ProjectsService as any)();
  });

  describe('createProject', () => {
    it('creates and returns a project', async () => {
      const expected = { id: 'proj-1', tenantId: TENANT_ID, name: 'New Project' };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.createProject(TENANT_ID, { name: 'New Project' });

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated projects', async () => {
      const items = [
        { id: 'proj-1', name: 'Project A', tenantId: TENANT_ID, status: 'active', createdAt: new Date() },
        { id: 'proj-2', name: 'Project B', tenantId: TENANT_ID, status: 'active', createdAt: new Date() },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(items));

      const result = await service.findAll(TENANT_ID, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('filters by status when provided', async () => {
      const items = [{ id: 'proj-1', name: 'Active Project', status: 'active', tenantId: TENANT_ID, createdAt: new Date() }];
      (db as any).then.mockImplementation((resolve: any) => resolve(items));

      const result = await service.findAll(TENANT_ID, { status: 'active' });

      expect(result.items).toEqual(items);
    });

    it('returns empty array when no projects match', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { status: 'archived' });

      expect(result.items).toEqual([]);
    });

    it('caps limit at 100', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.findAll(TENANT_ID, { limit: 999 });

      expect(result.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('returns a project by id', async () => {
      const project = { id: 'proj-1', name: 'Found Project', tenantId: TENANT_ID };
      (db as any).then.mockImplementation((resolve: any) => resolve([project]));

      const result = await service.findOne(TENANT_ID, 'proj-1');

      expect(result).toEqual(project);
    });

    it('throws NotFoundException when project not found', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      await expect(service.findOne(TENANT_ID, 'nonexistent')).rejects.toThrow('Project not found');
    });
  });

  describe('submitTimesheet', () => {
    it('creates and returns a timesheet entry', async () => {
      const expected = { id: 'ts-1', tenantId: TENANT_ID, projectId: 'proj-1', userId: USER_ID, hours: 8 };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.submitTimesheet(TENANT_ID, USER_ID, 'proj-1', { hours: 8 });

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getProjectProfitability', () => {
    it('calculates profitability metrics', async () => {
      const project = { id: 'proj-1', name: 'Profitable Project', budget: '10000000', tenantId: TENANT_ID };
      const thenMock = jest.fn()
        .mockImplementationOnce((resolve: any) => resolve([project]))
        .mockImplementationOnce((resolve: any) => resolve([{ totalHours: 10 }]));
      (db as any).then = thenMock;

      const result = await service.getProjectProfitability(TENANT_ID, 'proj-1');

      expect(result.projectId).toBe('proj-1');
      expect(result.totalHours).toBe(10);
      expect(result.totalLaborCost).toBe(5000000);
      expect(result.budget).toBe(10000000);
      expect(result.grossProfit).toBe(5000000);
      expect(result.profitMargin).toBe(50);
    });

    it('handles zero budget gracefully', async () => {
      const project = { id: 'proj-1', name: 'Zero Budget', budget: '0', tenantId: TENANT_ID };
      const thenMock = jest.fn()
        .mockImplementationOnce((resolve: any) => resolve([project]))
        .mockImplementationOnce((resolve: any) => resolve([{ totalHours: 5 }]));
      (db as any).then = thenMock;

      const result = await service.getProjectProfitability(TENANT_ID, 'proj-1');

      expect(result.profitMargin).toBe(0);
    });
  });

  describe('createTask', () => {
    it('creates and returns a project task', async () => {
      const expected = { id: 'task-1', tenantId: TENANT_ID, projectId: 'proj-1', title: 'Design', status: 'todo' };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.createTask(TENANT_ID, 'proj-1', { title: 'Design' });

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('getGanttData', () => {
    it('returns tasks and dependencies for Gantt chart', async () => {
      const tasks = [
        { id: 'task-1', title: 'Design', status: 'done', createdAt: new Date('2025-01-01'), tenantId: TENANT_ID, projectId: 'proj-1' },
        { id: 'task-2', title: 'Develop', status: 'in_progress', createdAt: new Date('2025-01-02'), tenantId: TENANT_ID, projectId: 'proj-1' },
      ];
      const deps = [
        { id: 'dep-1', taskId: 'task-2', dependsOnId: 'task-1', type: 'fs', tenantId: TENANT_ID },
      ];

      const thenMock = jest.fn()
        .mockImplementationOnce((resolve: any) => resolve(tasks))
        .mockImplementationOnce((resolve: any) => resolve(deps));
      (db as any).then = thenMock;

      const result = await service.getGanttData(TENANT_ID, 'proj-1');

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].text).toBe('Design');
      expect(result.tasks[1].text).toBe('Develop');
      expect(result.tasks[0].progress).toBe(1);
      expect(result.tasks[1].progress).toBe(0.5);
      expect(result.links).toHaveLength(1);
      expect(result.links[0].source).toBe('task-1');
      expect(result.links[0].target).toBe('task-2');
    });

    it('returns empty when no tasks exist', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.getGanttData(TENANT_ID, 'proj-1');

      expect(result.tasks).toEqual([]);
      expect(result.links).toEqual([]);
    });
  });

  describe('allocateResource', () => {
    it('inserts a project member and returns it', async () => {
      const expected = { id: 'member-1', tenantId: TENANT_ID, projectId: 'proj-1', userId: USER_ID, role: 'developer', allocationPercentage: 50 };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.allocateResource(TENANT_ID, 'proj-1', USER_ID, { role: 'developer', allocationPercentage: 50 });

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
