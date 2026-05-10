import { useCallback } from 'react';
import {
  formatVND as _formatVND,
  formatNumber as _formatNumber,
  formatDate as _formatDate,
  formatDateTime as _formatDateTime,
  formatRelativeTime as _formatRelativeTime,
} from '@smart-erp/utils';

/**
 * React hook wrapping @smart-erp/utils formatters with stable useCallback refs.
 * Use inside React components for consistent number/date/currency display.
 */
export function useFormatters() {
  const formatVND = useCallback(
    (amount: number | string | null | undefined) => _formatVND(amount),
    []
  );

  const formatNumber = useCallback(
    (value: number | string | null | undefined) => _formatNumber(value),
    []
  );

  const formatDate = useCallback(
    (date: string | Date | null | undefined) => _formatDate(date),
    []
  );

  const formatDateTime = useCallback(
    (date: string | Date | null | undefined) => _formatDateTime(date),
    []
  );

  const formatRelativeTime = useCallback(
    (date: string | Date | null | undefined) => _formatRelativeTime(date),
    []
  );

  return { formatVND, formatNumber, formatDate, formatDateTime, formatRelativeTime };
}
