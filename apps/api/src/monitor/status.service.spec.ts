import { StatusService } from './status.service';

describe('StatusService metrics', () => {
  it('formats Prometheus metrics for healthy database status', async () => {
    const service = new StatusService();
    jest.spyOn(service, 'getSystemStatus').mockResolvedValue({
      version: '1.0.0',
      uptime: 42,
      dbStatus: 'healthy',
      timestamp: '2026-06-29T00:00:00.000Z',
    });

    await expect(service.getPrometheusMetrics()).resolves.toContain('smart_erp_status_db_healthy 1');
    await expect(service.getPrometheusMetrics()).resolves.toContain('smart_erp_uptime_seconds 42');
  });

  it('formats unhealthy database status as zero', async () => {
    const service = new StatusService();
    jest.spyOn(service, 'getSystemStatus').mockResolvedValue({
      version: '1.0.0',
      uptime: 7,
      dbStatus: 'unhealthy',
      timestamp: '2026-06-29T00:00:00.000Z',
    });

    await expect(service.getPrometheusMetrics()).resolves.toContain('smart_erp_status_db_healthy 0');
  });
});
