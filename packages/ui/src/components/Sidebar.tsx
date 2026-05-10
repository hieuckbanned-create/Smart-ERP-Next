'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

export interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: number | string;
  children?: NavItem[];
}

export interface SidebarProps {
  items: NavItem[];
  activeKey?: string;
  collapsed?: boolean;
  onNavigate?: (item: NavItem) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeKey,
  collapsed = false,
  onNavigate,
  header,
  footer,
  className,
}) => {
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderItem = (item: NavItem, depth = 0) => {
    const isActive = activeKey === item.key;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.has(item.key);

    return (
      <div key={item.key}>
        <button
          onClick={() => {
            if (hasChildren) toggleExpand(item.key);
            else onNavigate?.(item);
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            depth > 0 && 'ml-4 pl-3',
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <svg
                  className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {header && (
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          {header}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => renderItem(item))}
      </nav>
      {footer && (
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </aside>
  );
};
