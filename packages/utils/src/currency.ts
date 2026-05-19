/**
 * Currency formatting utilities — no React dependency.
 * Used by API, web, mobile, desktop.
 */

/** Format a number as Vietnamese Dong */
export function formatVND(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format a number as USD */
export function formatUSD(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/** Format a number with thousand separators */
export function formatNumber(
  value: number | string | null | undefined,
  locale = 'vi-VN'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat(locale).format(num);
}

/** Parse a VND string back to number */
export function parseVND(value: string): number {
  let clean = value.replace(/[^\d.,-]/g, '');
  if (clean.includes('.') && clean.includes(',')) {
    if (clean.indexOf('.') < clean.indexOf(',')) {
      // Dot is thousands, comma is decimal (Vietnamese format: 1.234,50)
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // Comma is thousands, dot is decimal (US format: 1,234.50)
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    // Only commas: could be thousands (US: 1,234) or decimal (VN: 1,23)
    const parts = clean.split(',');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(',', '.');
    }
  } else if (clean.includes('.')) {
    // Only dots: could be thousands (VN: 150.000) or decimal (US: 1.23)
    const parts = clean.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      clean = clean.replace(/\./g, '');
    }
  }
  return parseFloat(clean) || 0;
}

/** Calculate profit margin as percentage */
export function profitMargin(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return parseFloat((((revenue - cost) / revenue) * 100).toFixed(1));
}
