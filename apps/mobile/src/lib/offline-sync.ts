/**
 * Offline-first data synchronization for Smart ERP Mobile.
 * Uses Dexie.js for IndexedDB storage with conflict resolution.
 */
import Dexie, { Table } from 'dexie';
import * as SecureStore from 'expo-secure-store';

// Database schema
class ERPDatabase extends Dexie {
  customers!: Table<{ id: string; name: string; code: string; phone: string; email: string; updatedAt: string; syncStatus: 'synced' | 'pending' | 'conflict' }>;
  products!: Table<{ id: string; name: string; sku: string; price: number; stock: number; updatedAt: string; syncStatus: 'synced' | 'pending' | 'conflict' }>;
  orders!: Table<{ id: string; code: string; customerId: string; total: number; status: string; updatedAt: string; syncStatus: 'synced' | 'pending' | 'conflict' }>;
  syncQueue!: Table<{ id: string; entity: string; action: 'create' | 'update' | 'delete'; data: string; timestamp: string; retryCount: number }>;

  constructor() {
    super('SmartERP');
    this.version(1).stores({
      customers: 'id, name, code, syncStatus',
      products: 'id, name, sku, syncStatus',
      orders: 'id, code, customerId, status, syncStatus',
      syncQueue: 'id, entity, action, timestamp',
    });
  }
}

const db = new ERPDatabase();

export interface SyncResult {
  success: boolean;
  synced: number;
  conflicts: number;
  errors: string[];
}

class OfflineSyncManager {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  /** Initialize sync manager */
  async init() {
    // Start periodic sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 30000);

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
    }
  }

  /** Stop sync manager */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  /** Full sync: push local changes, then pull server changes */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) return { success: false, synced: 0, conflicts: 0, errors: ['Sync already in progress'] };
    this.isSyncing = true;

    const result: SyncResult = { success: true, synced: 0, conflicts: 0, errors: [] };

    try {
      // Step 1: Push pending changes to server
      const queue = await db.syncQueue.orderBy('timestamp').toArray();
      for (const item of queue) {
        try {
          await this.pushChange(item);
          await db.syncQueue.delete(item.id);
          result.synced++;
        } catch (error: any) {
          // Increment retry count
          await db.syncQueue.update(item.id, { retryCount: item.retryCount + 1 });
          if (item.retryCount >= 5) {
            result.conflicts++;
            result.errors.push(`Max retries exceeded for ${item.entity}:${item.id}`);
          }
        }
      }

      // Step 2: Pull server changes
      await this.pullChanges('customers');
      await this.pullChanges('products');
      await this.pullChanges('orders');

    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /** Push a single change to the server */
  private async pushChange(item: { entity: string; action: string; data: string; id: string }) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const token = await SecureStore.getItemAsync('access_token');
    const tenantId = await SecureStore.getItemAsync('tenant_id');

    const payload = JSON.parse(item.data);
    let url = `${apiUrl}/${item.entity}`;
    let method = 'POST';

    if (item.action === 'update') {
      url = `${url}/${item.id}`;
      method = 'PATCH';
    } else if (item.action === 'delete') {
      url = `${url}/${item.id}`;
      method = 'DELETE';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId || '',
      },
      body: item.action !== 'delete' ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.status}`);
    }
  }

  /** Pull latest changes from server */
  private async pullChanges(entity: 'customers' | 'products' | 'orders') {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const token = await SecureStore.getItemAsync('access_token');
    const tenantId = await SecureStore.getItemAsync('tenant_id');

    // Get last sync timestamp
    const lastSync = await SecureStore.getItemAsync(`lastSync_${entity}`) || new Date(0).toISOString();

    const response = await fetch(
      `${apiUrl}/${entity}?updatedSince=${encodeURIComponent(lastSync)}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    const items = data.items || data;

    for (const item of items) {
      await db.table(entity).put({
        ...item,
        updatedAt: item.updatedAt || new Date().toISOString(),
        syncStatus: 'synced',
      });
    }

    // Update last sync timestamp
    await SecureStore.setItemAsync(`lastSync_${entity}`, new Date().toISOString());
  }

  /** Queue a local change for sync */
  async queueChange(entity: string, action: 'create' | 'update' | 'delete', data: Record<string, unknown>) {
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      entity,
      action,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
  }

  /** Get pending changes count */
  async getPendingCount(): Promise<number> {
    return db.syncQueue.count();
  }

  /** Resolve conflict (keep local or server version) */
  async resolveConflict(entity: string, id: string, resolution: 'local' | 'server') {
    if (resolution === 'local') {
      const item = await db.table(entity).get(id);
      if (item) {
        await this.queueChange(entity, 'update', item as any);
      }
    }
    // Mark as synced to remove conflict flag
    await db.table(entity).update(id, { syncStatus: 'synced' });
  }
}

export const offlineSync = new OfflineSyncManager();
export { db };
