import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingChanges: number;
  errorMessage: string | null;
  setStatus: (status: SyncStatus) => void;
  setLastSync: (date: Date) => void;
  setPendingChanges: (count: number) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSync: null,
  pendingChanges: 0,
  errorMessage: null,
  setStatus: (status) => set({ status }),
  setLastSync: (lastSync) => set({ lastSync }),
  setPendingChanges: (pendingChanges) => set({ pendingChanges }),
  setError: (errorMessage) => set({ errorMessage, status: errorMessage ? 'error' : 'idle' }),
  reset: () => set({ status: 'idle', lastSync: null, pendingChanges: 0, errorMessage: null }),
}));

export interface SyncEvent {
  type: 'start' | 'success' | 'failure' | 'offline' | 'online' | 'pending_changed';
  payload?: unknown;
}

export function emitSyncEvent(event: SyncEvent) {
  const store = useSyncStore.getState();
  switch (event.type) {
    case 'start':
      store.setStatus('syncing');
      store.setError(null);
      break;
    case 'success':
      store.setStatus('idle');
      store.setLastSync(new Date());
      break;
    case 'failure':
      store.setError(typeof event.payload === 'string' ? event.payload : 'Sync failed');
      break;
    case 'offline':
      store.setStatus('offline');
      break;
    case 'online':
      if (store.status === 'offline') store.setStatus('idle');
      break;
    case 'pending_changed':
      if (typeof event.payload === 'number') store.setPendingChanges(event.payload);
      break;
  }
}
