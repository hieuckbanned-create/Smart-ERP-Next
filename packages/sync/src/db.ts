import Dexie, { Table } from 'dexie';

export interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  role: string;
  syncedAt: number;
}

export interface StoredProduct {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  price: string;
  cost: string | null;
  stock: number;
  minStock: number | null;
  category: string | null;
  unit: string | null;
  isActive: boolean;
  syncedAt: number;
}

export interface StoredCustomer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  currentDebt: string | null;
  syncedAt: number;
}

export interface SyncQueueItem {
  id?: number;
  entity: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  entityId: string;
  retries: number;
  createdAt: number;
  version?: number;
  vectorClock?: Record<string, number>;
}

export interface EntityMeta {
  id: string;
  version: number;
  vectorClock: Record<string, number>;
  lastSyncedAt: number;
}

export class OfflineDB extends Dexie {
  users!: Table<StoredUser, string>;
  products!: Table<StoredProduct, string>;
  customers!: Table<StoredCustomer, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  entities!: Table<EntityMeta, string>;

  constructor() {
    super('SmartERPOffline');
    this.version(2).stores({
      users: 'id, tenantId, syncedAt',
      products: 'id, tenantId, sku, isActive, syncedAt',
      customers: 'id, tenantId, code, syncedAt',
      syncQueue: '++id, entity, entityId, createdAt',
      entities: 'id, version, lastSyncedAt',
    });
  }
}

export const db = new OfflineDB();
