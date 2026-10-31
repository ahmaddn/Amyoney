import { exchangeRateService } from '@/services/exchange-rate-service';

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  fractionDigits: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Rupiah Indonesia',
    locale: 'id-ID',
    fractionDigits: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dolar AS',
    locale: 'en-US',
    fractionDigits: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    fractionDigits: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Dolar Singapura',
    locale: 'en-SG',
    fractionDigits: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Yen Jepang',
    locale: 'ja-JP',
    fractionDigits: 0,
  },
};

let currentCurrencyCode: CurrencyCode = 'IDR';

export function setActiveCurrency(code: CurrencyCode) {
  if (SUPPORTED_CURRENCIES[code]) {
    currentCurrencyCode = code;
  }
}

export function getActiveCurrency(): CurrencyConfig {
  return SUPPORTED_CURRENCIES[currentCurrencyCode] || SUPPORTED_CURRENCIES.IDR;
}

export function formatRupiah(amountInIDR: number, overrideCode?: CurrencyCode): string {
  const code = overrideCode || currentCurrencyCode;
  const config = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.IDR;
  const isNegative = amountInIDR < 0;

  // Konversi nilai uang secara dinamis jika mata uang bukan IDR
  const convertedAmount = exchangeRateService.convertFromIDR(Math.abs(amountInIDR), code);

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.fractionDigits,
    maximumFractionDigits: config.fractionDigits,
  }).format(convertedAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export const formatCurrency = formatRupiah;

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}
