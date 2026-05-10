import { useCallback } from 'react';

/**
 * Formatting helpers bound to Vietnamese locale.
 * Use inside React components for consistent number/date/currency display.
 */
export function useFormatters() {
  const formatVND = useCallback((amount: number | string | null | undefined): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
    if (isNaN(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  }, []);

  const formatNumber = useCallback((value: number | string | null | undefined): string => {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  }, []);

  const formatDate = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }, []);

  const formatDateTime = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }, []);

  const formatRelativeTime = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return '—';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return formatDate(date);
  }, [formatDate]);

  return { formatVND, formatNumber, formatDate, formatDateTime, formatRelativeTime };
}
