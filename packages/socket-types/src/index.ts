export interface ActivityPayload {
  id: string;
  tenantId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'stock_adjusted';
  entityType: 'order' | 'product' | 'customer' | 'supplier' | 'inventory';
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

export interface SocketEvents {
  activity: (payload: ActivityPayload) => void;
  connect_error: (err: Error) => void;
}

export const SOCKET_NAMESPACE = '/activities';
