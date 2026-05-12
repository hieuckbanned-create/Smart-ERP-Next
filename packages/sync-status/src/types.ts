export interface SyncState {
  status: 'idle' | 'syncing' | 'error' | 'offline';
  lastSync: Date | null;
  pendingChanges: number;
  conflictCount: number;
  errorMessage: string | null;
}

export interface ChangeRecord {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface ConflictRecord {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  detectedAt: string;
  resolved: boolean;
}

export interface SyncConfig {
  apiBaseUrl: string;
  tenantId: string;
  userId: string;
  authToken: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface SyncEvent {
  type: 'start' | 'success' | 'failure' | 'offline' | 'online' | 'pending_changed';
  payload?: unknown;
}