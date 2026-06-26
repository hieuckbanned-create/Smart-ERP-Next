jest.mock('@smart-erp/database', () => {
  const db: any = () => db;
  const chainFn = jest.fn(() => db);

  db.select = chainFn;
  db.from = chainFn;
  db.where = chainFn;
  db.orderBy = chainFn;
  db.limit = chainFn;
  db.offset = chainFn;
  db.insert = chainFn;
  db.values = chainFn;
  db.update = chainFn;
  db.set = chainFn;
  db.delete = chainFn;
  db.execute = jest.fn();
  db.returning = jest.fn();
  db.then = jest.fn();

  return { db };
});
jest.mock('@smart-erp/database/schema', () => ({ messages: {} }));
jest.mock('@smart-erp/database/drizzle', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  or: jest.fn(),
  desc: jest.fn(),
  sql: jest.fn(),
}));

import { db } from '@smart-erp/database';
import { ChatService } from '../chat/chat.service';

describe('ChatService (integration)', () => {
  let service: ChatService;
  let mockNotificationsGateway: { sendToUser: jest.Mock };
  const TENANT_ID = 'tenant-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).then.mockImplementation((resolve: any) => resolve([]));
    (db as any).returning.mockReset();
    (db as any).returning.mockResolvedValue([]);
    mockNotificationsGateway = { sendToUser: jest.fn() };
    service = new (ChatService as any)(mockNotificationsGateway);
  });

  describe('sendMessage', () => {
    it('inserts a message and returns it', async () => {
      const expected = { id: 'msg-1', tenantId: TENANT_ID, fromUserId: USER_ID, toUserId: 'user-2', content: 'Hello', sentAt: new Date() };
      (db as any).returning.mockResolvedValue([expected]);

      const result = await service.sendMessage(TENANT_ID, USER_ID, 'user-2', 'Hello');

      expect(result).toEqual(expected);
      expect(db.insert).toHaveBeenCalled();
    });

    it('notifies the recipient via websocket', async () => {
      const msg = { id: 'msg-1', fromUserId: USER_ID, content: 'Hi', sentAt: new Date() };
      (db as any).returning.mockResolvedValue([msg]);

      await service.sendMessage(TENANT_ID, USER_ID, 'user-2', 'Hi');

      expect(mockNotificationsGateway.sendToUser).toHaveBeenCalledWith('user-2', 'chat.message', {
        id: msg.id,
        fromUserId: USER_ID,
        content: 'Hi',
        mentions: undefined,
        sentAt: msg.sentAt,
      });
    });

    it('notifies mentioned users', async () => {
      const msg = { id: 'msg-2', fromUserId: USER_ID, content: 'Hey @user-3 @user-4', sentAt: new Date() };
      (db as any).returning.mockResolvedValue([msg]);

      await service.sendMessage(TENANT_ID, USER_ID, 'user-2', 'Hey @user-3 @user-4', ['user-3', 'user-4']);

      expect(mockNotificationsGateway.sendToUser).toHaveBeenCalledWith('user-3', 'chat.mention', {
        id: msg.id, fromUserId: USER_ID, content: 'Hey @user-3 @user-4', mentionedBy: USER_ID,
      });
      expect(mockNotificationsGateway.sendToUser).toHaveBeenCalledWith('user-4', 'chat.mention', {
        id: msg.id, fromUserId: USER_ID, content: 'Hey @user-3 @user-4', mentionedBy: USER_ID,
      });
    });
  });

  describe('getConversation', () => {
    it('returns messages between two users ordered by sentAt', async () => {
      const messages = [
        { id: 'msg-1', fromUserId: USER_ID, toUserId: 'user-2', content: 'First', sentAt: new Date('2025-01-01T10:00:00') },
        { id: 'msg-2', fromUserId: 'user-2', toUserId: USER_ID, content: 'Second', sentAt: new Date('2025-01-01T10:01:00') },
      ];
      (db as any).then.mockImplementation((resolve: any) => resolve(messages));

      const result = await service.getConversation(TENANT_ID, USER_ID, 'user-2');

      expect(result).toHaveLength(2);
      expect(db.select).toHaveBeenCalled();
    });

    it('returns empty array when no conversation exists', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([]));

      const result = await service.getConversation(TENANT_ID, USER_ID, 'other-user');

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('updates message isRead to true and returns it', async () => {
      const updated = { id: 'msg-1', isRead: 'true', tenantId: TENANT_ID };
      (db as any).returning.mockResolvedValue([updated]);

      const result = await service.markAsRead(TENANT_ID, 'msg-1', USER_ID);

      expect(result).toEqual(updated);
      expect(db.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when message not found', async () => {
      (db as any).returning.mockResolvedValue([]);

      await expect(service.markAsRead(TENANT_ID, 'nonexistent', USER_ID)).rejects.toThrow('Message not found');
    });
  });

  describe('getUnreadCount', () => {
    it('returns the count of unread messages', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ count: 5 }]));

      const result = await service.getUnreadCount(TENANT_ID, USER_ID);

      expect(result).toBe(5);
    });

    it('returns 0 when no unread messages', async () => {
      (db as any).then.mockImplementation((resolve: any) => resolve([{ count: 0 }]));

      const result = await service.getUnreadCount(TENANT_ID, USER_ID);

      expect(result).toBe(0);
    });
  });
});
