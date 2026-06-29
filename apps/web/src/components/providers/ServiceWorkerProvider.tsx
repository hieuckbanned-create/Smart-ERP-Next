'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    };

    register().catch((error) => {
      console.warn('Service worker registration failed', error);
    });
  }, []);

  return <>{children}</>;
}
