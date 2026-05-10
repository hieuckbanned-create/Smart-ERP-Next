import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
}

/**
 * Manage pagination state — page, limit, total, totalPages.
 */
export function usePagination(initialLimit = 20): UsePaginationReturn {
  const [page, setPageState] = useState(1);
  const [total, setTotalState] = useState(0);
  const limit = initialLimit;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const setPage = useCallback(
    (p: number) => setPageState(Math.max(1, Math.min(p, totalPages))),
    [totalPages]
  );

  const setTotal = useCallback((t: number) => {
    setTotalState(t);
  }, []);

  const nextPage = useCallback(() => setPageState((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setPageState((p) => Math.max(p - 1, 1)), []);
  const reset = useCallback(() => setPageState(1), []);

  return { page, limit, total, totalPages, setPage, setTotal, nextPage, prevPage, reset };
}
