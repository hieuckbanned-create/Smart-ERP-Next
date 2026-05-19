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
  setErrorMessage: (msg: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  lastSync: null,
  pendingChanges: 0,
  errorMessage: null,
  setStatus: (status) => set({ status }),
  setLastSync: (date) => set({ lastSync: date }),
  setPendingChanges: (count) => set({ pendingChanges: count }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  reset: () => set({ status: 'idle', lastSync: null, pendingChanges: 0, errorMessage: null }),
}));

export interface SyncEvent {
  type: 'start' | 'success' | 'failure' | 'online' | 'offline';
  payload?: string;
}

type SyncEventHandler = (event: SyncEvent) => void;
const handlers: SyncEventHandler[] = [];

export function emitSyncEvent(event: SyncEvent): void {
  for (const handler of handlers) {
    handler(event);
  }
}

export function onSyncEvent(handler: SyncEventHandler): () => void {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
  };
}
