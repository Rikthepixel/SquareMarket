import { useMemo } from 'react';

export default function useCurrencyFormatter(currency: string) {
  return useMemo(() => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      notation: 'standard',
    });
  }, [currency]);
}
