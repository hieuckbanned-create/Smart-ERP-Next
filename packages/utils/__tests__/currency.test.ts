import { formatVND, formatUSD, formatNumber, parseVND, profitMargin } from '../src/currency';

describe('currency utilities', () => {
  describe('formatVND', () => {
    it('should format numbers to VND currency format', () => {
      // Normalize non-breaking spaces that Intl.NumberFormat might output (\xa0 or standard space)
      const res1 = formatVND(100000).replace(/\s/g, ' ');
      expect(res1).toMatch(/100\.000\s?₫/);
      
      const res2 = formatVND('2500000').replace(/\s/g, ' ');
      expect(res2).toMatch(/2\.500\.000\s?₫/);
    });

    it('should handle null, undefined, and invalid values gracefully', () => {
      expect(formatVND(null).replace(/\s/g, ' ')).toMatch(/0\s?₫/);
      expect(formatVND(undefined).replace(/\s/g, ' ')).toMatch(/0\s?₫/);
      expect(formatVND('not-a-number').replace(/\s/g, ' ')).toMatch(/0\s?₫/);
    });
  });

  describe('formatUSD', () => {
    it('should format numbers to USD format', () => {
      expect(formatUSD(1234.56)).toBe('$1,234.56');
      expect(formatUSD('99.9')).toBe('$99.90');
    });

    it('should handle null, undefined, and invalid values gracefully', () => {
      expect(formatUSD(null)).toBe('$0.00');
      expect(formatUSD(undefined)).toBe('$0.00');
      expect(formatUSD('invalid')).toBe('$0.00');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separator by locale', () => {
      const resVI = formatNumber(1234567.89, 'vi-VN').replace(/\s/g, ' ');
      expect(resVI).toContain('1.234.567,89');
      
      const resUS = formatNumber(1234567.89, 'en-US');
      expect(resUS).toBe('1,234,567.89');
    });

    it('should default to vi-VN locale', () => {
      const resDefault = formatNumber(1234.5).replace(/\s/g, ' ');
      expect(resDefault).toContain('1.234,5');
    });

    it('should handle null, undefined, and invalid values gracefully', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('invalid')).toBe('0');
    });
  });

  describe('parseVND', () => {
    it('should parse VND currency strings back to numeric float', () => {
      expect(parseVND('150.000 ₫')).toBe(150000);
      expect(parseVND('2.500.000,50₫')).toBe(2500000.5);
      expect(parseVND('$1,234.56')).toBe(1234.56);
      expect(parseVND('1,234')).toBe(1234);
      expect(parseVND('1,23')).toBe(1.23);
      expect(parseVND('1.5')).toBe(1.5);
      expect(parseVND('abc')).toBe(0);
    });
  });

  describe('profitMargin', () => {
    it('should calculate profit margins correctly as percentage', () => {
      expect(profitMargin(100, 70)).toBe(30.0);
      expect(profitMargin(200, 150)).toBe(25.0);
    });

    it('should return 0 if revenue is less than or equal to 0', () => {
      expect(profitMargin(0, 50)).toBe(0);
      expect(profitMargin(-10, 50)).toBe(0);
    });
  });
});
