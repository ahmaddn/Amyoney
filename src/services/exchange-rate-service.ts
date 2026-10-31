import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY';

const RATES_STORAGE_KEY = '@amyoney_exchange_rates';
const RATES_TIMESTAMP_KEY = '@amyoney_exchange_rates_timestamp';

// Kurs default fallback berbasis 1 unit mata uang asing = sekian IDR (dan dihitung 1 IDR = sekian mata uang)
// Contoh: 1 USD ~ 16.200 IDR -> 1 IDR = 1 / 16200 USD
const DEFAULT_RATES_FROM_IDR: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 1 / 16250,
  EUR: 1 / 17650,
  SGD: 1 / 12250,
  JPY: 1 / 106,
};

let memoryRates: Record<CurrencyCode, number> = { ...DEFAULT_RATES_FROM_IDR };

export const exchangeRateService = {
  /**
   * Inisialisasi nilai tukar dari cache lokal
   */
  async initRates() {
    try {
      const cached = await AsyncStorage.getItem(RATES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        memoryRates = { ...DEFAULT_RATES_FROM_IDR, ...parsed };
      }
      // Otomatis fetch pembaruan kurs live dari API publik
      this.fetchLiveRates().catch(() => {});
    } catch {
      // ignore
    }
  },

  /**
   * Ambil kurs nilai tukar live terbaru dari API publik (Frankfurter / Open Exchange)
   */
  async fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
    try {
      // Cek timestamp cache agar tidak spam API (update tiap 1 jam sekali)
      const lastFetchStr = await AsyncStorage.getItem(RATES_TIMESTAMP_KEY);
      const now = Date.now();
      if (lastFetchStr && now - parseInt(lastFetchStr, 10) < 60 * 60 * 1000) {
        return memoryRates;
      }

      // Mengambil kurs berbasis USD
      const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,SGD,JPY,IDR');
      if (!response.ok) throw new Error('Failed to fetch live rates');
      const data = await response.json();

      if (data && data.rates && data.rates.IDR) {
        const usdToIdr = data.rates.IDR; // misal 16200
        const usdToEur = data.rates.EUR || 0.92;
        const usdToSgd = data.rates.SGD || 1.33;
        const usdToJpy = data.rates.JPY || 153;

        const updated: Record<CurrencyCode, number> = {
          IDR: 1,
          USD: 1 / usdToIdr,
          EUR: usdToEur / usdToIdr,
          SGD: usdToSgd / usdToIdr,
          JPY: usdToJpy / usdToIdr,
        };

        memoryRates = updated;
        await AsyncStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(updated));
        await AsyncStorage.setItem(RATES_TIMESTAMP_KEY, String(now));
      }
    } catch (err) {
      // Fallback ke cache atau default jika offline/error
    }
    return memoryRates;
  },

  /**
   * Dapatkan kurs saat ini dari memori
   */
  getRate(targetCurrency: CurrencyCode): number {
    return memoryRates[targetCurrency] || DEFAULT_RATES_FROM_IDR[targetCurrency] || 1;
  },

  /**
   * Konversi nominal dasar (IDR) ke mata uang target
   */
  convertFromIDR(amountInIDR: number, targetCurrency: CurrencyCode): number {
    if (targetCurrency === 'IDR') return amountInIDR;
    const rate = this.getRate(targetCurrency);
    return amountInIDR * rate;
  },
};

// Auto init saat modul di-import
exchangeRateService.initRates().catch(() => {});

