'use client';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
}

const currencySymbols: Record<string, string> = {
  VND: '\u20AB',
  USD: '\u0024',
  EUR: '\u20AC',
  JPY: '\u00A5',
  GBP: '\u00A3',
};

export function PriceDisplay({ amount, currency = 'VND', className }: PriceDisplayProps) {
  const symbol = currencySymbols[currency] || currency;
  if (currency === 'VND') {
    return <span className={className}>{amount.toLocaleString('vi-VN')}{symbol}</span>;
  }
  return <span className={className}>{symbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>;
}
