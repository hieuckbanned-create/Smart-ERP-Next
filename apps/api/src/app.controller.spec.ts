import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { db } from '@smart-erp/database';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoot', () => {
    it('should return an object with name and version', () => {
      const result = controller.getRoot();
      expect(result).toHaveProperty('name', 'Smart ERP Next API');
      expect(result).toHaveProperty('version', '0.3.0');
    });
  });

  describe('getHealth', () => {
    it('should return ok status when db is ok', async () => {
      // Mock the db.execute to resolve
      jest.spyOn(db, 'execute').mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });
      const result = await controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.db).toBe('ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return degraded status when db fails', async () => {
      // Mock the db.execute to reject
      jest.spyOn(db, 'execute').mockRejectedValueOnce(new Error('DB error'));
      const result = await controller.getHealth();
      expect(result.status).toBe('degraded');
      expect(result.db).toBe('error');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
