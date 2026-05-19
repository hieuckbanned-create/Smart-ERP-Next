import {
  formatCompact,
  formatPercent,
  formatPercentValue,
  clamp,
  round,
  percentChange,
  sum,
  average,
} from '../src/number';

describe('number utilities', () => {
  describe('formatCompact', () => {
    it('should format big numbers cleanly with unit suffixes', () => {
      expect(formatCompact(1500000000)).toBe('1.5B');
      expect(formatCompact(2500000)).toBe('2.5M');
      expect(formatCompact(12500)).toBe('13K'); // toFixed(0) rounds 12.5 up to 13
      expect(formatCompact(-12500)).toBe('-13K');
      expect(formatCompact(-2500000)).toBe('-2.5M');
      expect(formatCompact(-1500000000)).toBe('-1.5B');
    });

    it('should format smaller numbers without suffixes using standard locale', () => {
      const res = formatCompact(950, 'en-US');
      expect(res).toBe('950');
    });
  });

  describe('formatPercent', () => {
    it('should convert fraction values to percentage strings', () => {
      expect(formatPercent(0.1234)).toBe('12.3%');
      expect(formatPercent(0.5, 0)).toBe('50%');
      expect(formatPercent(0.0525, 2)).toBe('5.25%');
    });
  });

  describe('formatPercentValue', () => {
    it('should format raw percentage values with decimals', () => {
      expect(formatPercentValue(12.34)).toBe('12.3%');
      expect(formatPercentValue(99, 0)).toBe('99%');
      expect(formatPercentValue(5.256, 2)).toBe('5.26%');
    });
  });

  describe('clamp', () => {
    it('should constrain value within min and max boundaries', () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('round', () => {
    it('should round numbers to specified decimal places', () => {
      expect(round(1.2345)).toBe(1.23); // default 2 decimals
      expect(round(1.2345, 3)).toBe(1.235);
      expect(round(1.5, 0)).toBe(2);
    });
  });

  describe('percentChange', () => {
    it('should calculate percent change correctly', () => {
      expect(percentChange(100, 150)).toBe(50.0);
      expect(percentChange(200, 150)).toBe(-25.0);
      expect(percentChange(50, 25)).toBe(-50.0);
    });

    it('should handle division by zero (old value is 0)', () => {
      expect(percentChange(0, 50)).toBe(100);
      expect(percentChange(0, 0)).toBe(0);
      expect(percentChange(0, -10)).toBe(0);
    });
  });

  describe('sum', () => {
    it('should sum an array of numbers', () => {
      expect(sum([1, 2, 3, 4])).toBe(10);
      expect(sum([])).toBe(0);
    });
  });

  describe('average', () => {
    it('should compute mathematical average correctly', () => {
      expect(average([1, 2, 3, 4])).toBe(2.5);
      expect(average([10, 20, 30])).toBe(20);
    });

    it('should return 0 for empty array', () => {
      expect(average([])).toBe(0);
    });
  });
});
