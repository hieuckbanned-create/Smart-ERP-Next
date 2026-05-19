import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { ActivityService } from '../modules/activity/activity.service';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockActivityService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
