jest.mock('react', () => ({
  useCallback: <T extends (...args: any[]) => unknown>(callback: T) => callback,
}));

import { useFormatters } from '../src/useFormatters';

describe('useFormatters', () => {
  it('returns stable wrappers around shared number and date formatters', () => {
    const formatters = useFormatters();

    expect(formatters.formatNumber(1234567)).toBe('1.234.567');
    expect(formatters.formatVND(1200000)).toContain('1.200.000');
    expect(formatters.formatDate(null)).toBe('\u2014');
    expect(formatters.formatDateTime(undefined)).toBe('\u2014');
    expect(formatters.formatRelativeTime(null)).toBe('\u2014');
  });
});
