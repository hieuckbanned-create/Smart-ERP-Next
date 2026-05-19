import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  toISODate,
} from '../src/date';

describe('date utilities', () => {
  const testDateStr = '2026-05-20T08:30:00.000Z'; // UTC time
  // Using an explicit locale for predictable tests, though vi-VN is default

  describe('formatDate', () => {
    it('should format a date string or Date object correctly', () => {
      const res = formatDate(new Date(testDateStr), 'en-US');
      expect(res).toBe('05/20/2026');
    });

    it('should return default dash character if date is empty or invalid', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const res = formatDateTime(new Date(testDateStr), 'en-US');
      // Hour and minute format depends on local time zone, just verify it exists
      expect(res).toContain('2026');
      expect(res).toContain('05/20');
    });

    it('should return default dash character if datetime is empty or invalid', () => {
      expect(formatDateTime(null)).toBe('—');
      expect(formatDateTime(undefined)).toBe('—');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const res = formatTime(new Date(testDateStr), 'en-US');
      expect(res).toMatch(/\d{2}:\d{2}/);
    });

    it('should return default dash character if time is empty or invalid', () => {
      expect(formatTime(null)).toBe('—');
      expect(formatTime(undefined)).toBe('—');
    });
  });

  describe('formatRelativeTime', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      // Mock Date.now to lock "current" time at 2026-05-20T08:30:00.000Z
      spy = jest.spyOn(Date, 'now').mockReturnValue(new Date(testDateStr).getTime());
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it('should return — for empty/invalid date', () => {
      expect(formatRelativeTime(null)).toBe('—');
      expect(formatRelativeTime(undefined)).toBe('—');
    });

    it('should return "Vừa xong" for differences less than a minute', () => {
      const past = new Date(new Date(testDateStr).getTime() - 30_000); // 30 seconds ago
      expect(formatRelativeTime(past)).toBe('Vừa xong');
    });

    it('should return "X phút trước" for differences under an hour', () => {
      const past = new Date(new Date(testDateStr).getTime() - 10 * 60_000); // 10 mins ago
      expect(formatRelativeTime(past)).toBe('10 phút trước');
    });

    it('should return "X giờ trước" for differences under 24 hours', () => {
      const past = new Date(new Date(testDateStr).getTime() - 3 * 3600_000); // 3 hours ago
      expect(formatRelativeTime(past)).toBe('3 giờ trước');
    });

    it('should return "X ngày trước" for differences under 7 days', () => {
      const past = new Date(new Date(testDateStr).getTime() - 4 * 24 * 3600_000); // 4 days ago
      expect(formatRelativeTime(past)).toBe('4 ngày trước');
    });

    it('should return absolute formatted date for differences of 7 days or more', () => {
      const past = new Date(new Date(testDateStr).getTime() - 10 * 24 * 3600_000); // 10 days ago
      const formatted = formatRelativeTime(past);
      expect(formatted).not.toContain('ngày trước');
      expect(formatted).not.toBe('—');
    });
  });

  describe('startOfDay', () => {
    it('should return date set to 00:00:00', () => {
      const date = new Date('2026-05-20T15:45:30');
      const start = startOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getDate()).toBe(20);
    });

    it('should default to current date if none provided', () => {
      const start = startOfDay();
      expect(start).toBeInstanceOf(Date);
      expect(start.getHours()).toBe(0);
    });
  });

  describe('startOfMonth', () => {
    it('should return date set to the first of the month', () => {
      const date = new Date('2026-05-20');
      const start = startOfMonth(date);
      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(4); // May is index 4
    });

    it('should default to current date if none provided', () => {
      const start = startOfMonth();
      expect(start.getDate()).toBe(1);
    });
  });

  describe('startOfQuarter', () => {
    it('should return date set to start of quarter', () => {
      // Q1: Jan, Feb, Mar (months 0, 1, 2)
      // Q2: Apr, May, Jun (months 3, 4, 5)
      const date1 = new Date('2026-05-20'); // May is index 4
      const start1 = startOfQuarter(date1);
      expect(start1.getMonth()).toBe(3); // April
      expect(start1.getDate()).toBe(1);

      const date2 = new Date('2026-11-15'); // Nov is index 10
      const start2 = startOfQuarter(date2);
      expect(start2.getMonth()).toBe(9); // October (month index 9 is Q4 start)
      expect(start2.getDate()).toBe(1);
    });

    it('should default to current date if none provided', () => {
      const start = startOfQuarter();
      expect(start.getDate()).toBe(1);
    });
  });

  describe('startOfYear', () => {
    it('should return date set to Jan 1st of that year', () => {
      const date = new Date('2026-05-20');
      const start = startOfYear(date);
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
    });

    it('should default to current date if none provided', () => {
      const start = startOfYear();
      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
    });
  });

  describe('toISODate', () => {
    it('should format a Date object into YYYY-MM-DD string', () => {
      const date = new Date('2026-05-20T00:00:00.000Z');
      expect(toISODate(date)).toBe('2026-05-20');
    });
  });
});
