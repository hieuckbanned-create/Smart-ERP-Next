// Desktop Sync Service - Uses localStorage for token
import { SyncService } from '@smart-erp/sync';

class DesktopSyncService extends SyncService {
  protected async getToken(): Promise<string | null> {
    return localStorage.getItem('access_token');
  }

  protected async getTenantId(): Promise<string | null> {
    return localStorage.getItem('tenant_id');
  }

  protected async setToken(token: string): Promise<void> {
    localStorage.setItem('access_token', token);
  }

  protected async setTenantId(tenantId: string): Promise<void> {
    localStorage.setItem('tenant_id', tenantId);
  }
}

export const syncService = new DesktopSyncService(
  'http://localhost:3456',
  {
    getToken: () => localStorage.getItem('access_token'),
    getTenantId: () => localStorage.getItem('tenant_id'),
    getDeviceId: () => {
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    },
  }
);