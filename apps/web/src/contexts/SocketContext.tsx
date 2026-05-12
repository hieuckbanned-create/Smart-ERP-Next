'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { ActivityPayload } from '@smart-erp/socket-types';
import { useToast } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';

interface SocketContextValue {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const socketConnected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketConnected.current) {
        disconnectSocket();
        socketConnected.current = false;
      }
      return;
    }

    const socket = getSocket(token);
    const onConnect = () => {
      console.log('Socket connected');
      socketConnected.current = true;
    };
    const onDisconnect = () => {
      console.log('Socket disconnected');
      socketConnected.current = false;
    };
    const onActivity = (payload: ActivityPayload) => {
      // Map action to translation key
      const actionKey = `activity.${payload.action}`;
      const entityKey = `entity.${payload.entityType}`;
      const message = t('socket.new_activity', {
        action: t(actionKey),
        entity: t(entityKey),
        id: payload.entityId,
      });
      toast({
        title: t('socket.new_activity_title'),
        description: message,
        duration: 5000,
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('activity', onActivity);

    // Connect if not already
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('activity', onActivity);
      disconnectSocket();
      socketConnected.current = false;
    };
  }, [token, isAuthenticated, t, toast]);

  return (
    <SocketContext.Provider value={{ isConnected: socketConnected.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
