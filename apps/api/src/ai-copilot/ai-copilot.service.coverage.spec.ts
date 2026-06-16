import { AiCopilotService } from './ai-copilot.service';

describe('AiCopilotService', () => {
  let service: AiCopilotService;

  beforeEach(() => {
    const mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    };
    service = new AiCopilotService({ db: mockDb } as any);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('getExecutiveInsights returns summary shape', async () => {
    const mockDb = { db: { select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ total: 1000 }]) }) }) } };
    service = new AiCopilotService(mockDb as any);
    const result = await service.getExecutiveInsights('t1');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('revenue');
    expect(result).toHaveProperty('leadsCount');
  });
});
