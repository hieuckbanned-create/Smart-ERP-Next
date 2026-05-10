'use client';

import * as React from 'react';
import { cn } from '../utils/cn';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onDismiss?: (id: string) => void;
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
  },
  error: {
    icon: <XCircle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  },
  info: {
    icon: <Info className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  },
};

export const Toast: React.FC<ToastProps> = ({ id, message, variant = 'info', onDismiss }) => {
  const config = VARIANT_CONFIG[variant];
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-slide-up',
        config.classes
      )}
      role="alert"
    >
      {config.icon}
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/** Container that renders a stack of toasts in the bottom-right corner */
export const ToastContainer: React.FC<{
  toasts: ToastProps[];
  onDismiss?: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
