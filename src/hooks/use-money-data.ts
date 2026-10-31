import { useMoney } from '@/context/money-context';

/**
 * useMoneyData sekarang mengonsumsi MoneyContext tunggal (Single Source of Truth),
 * sehingga seluruh tab & komponen berbagi state yang sama secara reaktif dan instan.
 */
export function useMoneyData() {
  return useMoney();
}
