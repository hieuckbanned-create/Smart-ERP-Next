import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;

  beforeEach(() => {
    service = new TenantsService();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });
});
