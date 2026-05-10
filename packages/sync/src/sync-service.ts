import { db, SyncQueueItem } from './db';

export class SyncService {
  private apiBase: string;

  constructor(apiBase: string) {
    this.apiBase = apiBase;
  }

  // ─── Queue operations ────────────────────────────────────────────────────────

  async queueOperation(
    entity: string,
    action: 'create' | 'update' | 'delete',
    data: any,
    entityId: string,
    version?: number
  ): Promise<void> {
    const existing = await db.entities.get(entityId);
    const newVersion = (existing?.version ?? 0) + 1;
    const deviceId = this.getDeviceId();
    const vectorClock = { ...(existing?.vectorClock ?? {}), [deviceId]: newVersion };

    await db.syncQueue.add({
      entity,
      action,
      data,
      entityId,
      retries: 0,
      createdAt: Date.now(),
      version: version ?? newVersion,
      vectorClock,
    });

    this.processQueue().catch(console.error);
  }

  async processQueue(): Promise<void> {
    const pending = await db.syncQueue.toArray();
    for (const item of pending) {
      try {
        await this.executeSyncItem(item);
        await db.syncQueue.delete(item.id!);
      } catch (err) {
        console.error('Sync failed for item', item.id, err);
        await db.syncQueue.update(item.id!, { retries: item.retries + 1 });
      }
    }
  }

  private async executeSyncItem(item: SyncQueueItem): Promise<void> {
    const token = this.getToken();
    const tenantId = this.getTenantId();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
    };

    const payload = {
      ...item.data,
      _version: item.version,
      _vectorClock: item.vectorClock,
      _deviceId: this.getDeviceId(),
    };

    let url = `${this.apiBase}/${item.entity}`;
    let options: RequestInit = { method: 'POST', headers, body: JSON.stringify(payload) };

    if (item.action === 'update') {
      url = `${this.apiBase}/${item.entity}/${item.entityId}`;
      options = { method: 'PATCH', headers, body: JSON.stringify(payload) };
    } else if (item.action === 'delete') {
      url = `${this.apiBase}/${item.entity}/${item.entityId}`;
      options = { method: 'DELETE', headers };
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 409) {
        const conflict = await response.json();
        await this.resolveConflict(item, conflict);
        return;
      }
      throw new Error(`Sync failed: ${response.status}`);
    }

    await db.entities.put({
      id: item.entityId,
      version: item.version ?? 0,
      vectorClock: item.vectorClock ?? {},
      lastSyncedAt: Date.now(),
    });
  }

  private async resolveConflict(localItem: SyncQueueItem, remoteVersion: any): Promise<void> {
    const localClock = localItem.vectorClock ?? {};
    const remoteClock = remoteVersion.vectorClock ?? {};

    if (this.isNewer(remoteClock, localClock)) {
      const merged = await this.mergeData(localItem.data, remoteVersion.data);
      await db.entities.update(localItem.entityId, {
        data: merged,
        version: remoteVersion.version,
        vectorClock: remoteClock,
      } as any);
    }
    await db.syncQueue.delete(localItem.id!);
  }

  private isNewer(clockA: Record<string, number>, clockB: Record<string, number>): boolean {
    let newer = false;
    for (const [device, time] of Object.entries(clockA)) {
      if ((clockB[device] ?? 0) < time) newer = true;
      if ((clockB[device] ?? 0) > time) return false;
    }
    return newer;
  }

  private async mergeData(local: any, remote: any): Promise<any> {
    return { ...local, ...remote, _mergedAt: Date.now() };
  }

  // ─── Offline cache helpers ───────────────────────────────────────────────────

  async syncUsers(users: any[]): Promise<void> {
    await db.users.bulkPut(users.map((u) => ({ ...u, syncedAt: Date.now() })));
  }

  async getOfflineUsers(): Promise<any[]> {
    return db.users.toArray();
  }

  async syncProducts(products: any[]): Promise<void> {
    await db.products.bulkPut(products.map((p) => ({ ...p, syncedAt: Date.now() })));
  }

  async getOfflineProducts(): Promise<any[]> {
    return db.products.toArray();
  }

  async syncCustomers(customers: any[]): Promise<void> {
    await db.customers.bulkPut(customers.map((c) => ({ ...c, syncedAt: Date.now() })));
  }

  async getOfflineCustomers(): Promise<any[]> {
    return db.customers.toArray();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getTenantId(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('tenant_id');
  }

  private getDeviceId(): string {
    if (typeof localStorage === 'undefined') return 'server';
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = `device_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('device_id', id);
    }
    return id;
  }
}

export const syncService = new SyncService(
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
    : 'http://localhost:3000'
);
