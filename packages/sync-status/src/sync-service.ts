import { initDB, getDB } from './db';
import type { ChangeRecord, ConflictRecord, SyncConfig, SyncState } from './types';

const SYNC_STATE_KEY = 'sync_state';
const LAST_SYNC_KEY = 'last_sync_time';
const VECTOR_CLOCK_KEY = 'vector_clock';

export class SyncService {
  private config: SyncConfig;
  private isOnline: boolean = true;
  private listeners: Set<(state: SyncState) => void> = new Set();

  constructor(config: SyncConfig) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  async init(): Promise<void> {
    await initDB();
    this.setupConnectivityListener();
  }

  private setupConnectivityListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.sync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  async queueChange(record: Omit<ChangeRecord, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    const db = await getDB();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO sync_queue (id, entity_type, entity_id, operation, data, timestamp, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, record.entityType, record.entityId, record.operation, JSON.stringify(record.data), timestamp]
    );

    this.notifyListeners();
  }

  async getPendingChanges(): Promise<ChangeRecord[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<{
      id: string;
      entity_type: string;
      entity_id: string;
      operation: string;
      data: string;
      timestamp: string;
      synced: number;
    }>('SELECT * FROM sync_queue WHERE synced = 0 ORDER BY timestamp ASC');

    return rows.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation as ChangeRecord['operation'],
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
      synced: row.synced === 1,
    }));
  }

  async getPendingCount(): Promise<number> {
    const db = await getDB();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue WHERE synced = 0'
    );
    return result?.count ?? 0;
  }

  async markAsSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE sync_queue SET synced = 1 WHERE id IN (${placeholders})`,
      ids
    );
  }

  async getState(): Promise<SyncState> {
    const db = await getDB();
    const pending = await this.getPendingCount();
    const conflicts = await this.getConflictCount();
    const lastSyncStr = await this.getLastSyncTime();

    return {
      status: this.isOnline ? (pending > 0 ? 'syncing' : 'idle') : 'offline',
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
      pendingChanges: pending,
      conflictCount: conflicts,
      errorMessage: null,
    };
  }

  async sync(): Promise<{ success: boolean; synced: number; conflicts: number }> {
    if (!this.isOnline) {
      return { success: false, synced: 0, conflicts: 0 };
    }

    const pending = await this.getPendingChanges();
    if (pending.length === 0) {
      return { success: true, synced: 0, conflicts: 0 };
    }

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
        },
        body: JSON.stringify({
          tenantId: this.config.tenantId,
          changes: pending,
          vectorClock: await this.getVectorClock(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();

      await this.markAsSynced(pending.map(p => p.id));
      await this.setLastSyncTime(new Date().toISOString());

      if (result.conflicts && result.conflicts.length > 0) {
        await this.storeConflicts(result.conflicts);
      }

      this.notifyListeners();
      return {
        success: true,
        synced: pending.length,
        conflicts: result.conflicts?.length ?? 0,
      };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, synced: 0, conflicts: 0 };
    }
  }

  async resolveConflict(
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const db = await getDB();
    const conflict = await db.getFirstAsync<{
      id: string;
      entity_type: string;
      entity_id: string;
      local_version: string;
      remote_version: string;
    }>('SELECT * FROM conflicts WHERE id = ?', [conflictId]);

    if (!conflict) return;

    let chosenData: any;
    if (resolution === 'local') {
      chosenData = JSON.parse(conflict.local_version);
    } else if (resolution === 'remote') {
      chosenData = JSON.parse(conflict.remote_version);
    } else {
      chosenData = mergedData;
    }

    await fetch(`${this.config.apiBaseUrl}/sync/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.authToken}`,
      },
      body: JSON.stringify({
        entityType: conflict.entity_type,
        entityId: conflict.entity_id,
        chosenVersion: chosenData,
      }),
    });

    await db.runAsync('UPDATE conflicts SET resolved = 1 WHERE id = ?', [conflictId]);
    this.notifyListeners();
  }

  async getConflicts(): Promise<ConflictRecord[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<{
      id: string;
      entity_type: string;
      entity_id: string;
      local_version: string;
      remote_version: string;
      detected_at: string;
      resolved: number;
    }>('SELECT * FROM conflicts WHERE resolved = 0');

    return rows.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      localVersion: JSON.parse(row.local_version),
      remoteVersion: JSON.parse(row.remote_version),
      detectedAt: row.detected_at,
      resolved: row.resolved === 1,
    }));
  }

  async getConflictCount(): Promise<number> {
    const db = await getDB();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM conflicts WHERE resolved = 0'
    );
    return result?.count ?? 0;
  }

  private async storeConflicts(conflicts: any[]): Promise<void> {
    const db = await getDB();
    for (const conflict of conflicts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO conflicts (id, entity_type, entity_id, local_version, remote_version, detected_at, resolved)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          conflict.id,
          conflict.entityType,
          conflict.entityId,
          JSON.stringify(conflict.localVersion),
          JSON.stringify(conflict.remoteVersion),
          conflict.detectedAt ?? new Date().toISOString(),
        ]
      );
    }
  }

  private async getLastSyncTime(): Promise<string | null> {
    const db = await getDB();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM sync_metadata WHERE key = ?',
      [LAST_SYNC_KEY]
    );
    return result?.value ?? null;
  }

  private async setLastSyncTime(time: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)',
      [LAST_SYNC_KEY, time]
    );
  }

  private async getVectorClock(): Promise<Record<string, number>> {
    const db = await getDB();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM sync_metadata WHERE key = ?',
      [VECTOR_CLOCK_KEY]
    );
    return result ? JSON.parse(result.value) : {};
  }

  private async updateVectorClock(entityId: string): Promise<void> {
    const db = await getDB();
    const clock = await this.getVectorClock();
    clock[entityId] = (clock[entityId] ?? 0) + 1;
    await db.runAsync(
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)',
      [VECTOR_CLOCK_KEY, JSON.stringify(clock)]
    );
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.getState().then(state => {
      this.listeners.forEach(listener => listener(state));
    });
  }

  async isOnlineStatus(): Promise<boolean> {
    return this.isOnline;
  }
}

let syncServiceInstance: SyncService | null = null;

export function createSyncService(config: SyncConfig): SyncService {
  syncServiceInstance = new SyncService(config);
  return syncServiceInstance;
}

export function getSyncService(): SyncService | null {
  return syncServiceInstance;
}