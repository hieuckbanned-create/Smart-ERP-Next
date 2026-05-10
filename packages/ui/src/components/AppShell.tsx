'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

export interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  sidebar,
  header,
  children,
  className,
}) => {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900', className)}>
      {sidebar}
      <div className="flex flex-col flex-1 overflow-hidden">
        {header && (
          <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
