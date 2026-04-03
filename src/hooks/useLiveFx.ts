import { useCallback, useEffect, useState } from "react";
import type { FxBanner } from "../utils/exchangeRates";
import {
  FALLBACK_CURRENCY_CODES,
  fetchFrankfurterCurrencyCodes,
  loadRatesForBase,
} from "../utils/exchangeRates";

export function useLiveFx(base: string, active: boolean) {
  const [codes, setCodes] = useState<string[]>(() => [...FALLBACK_CURRENCY_CODES]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [banner, setBanner] = useState<FxBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetchFrankfurterCurrencyCodes()
      .then(c => {
        if (!cancelled && c.length > 0) setCodes(c);
      })
      .catch(() => {
        /* keep FALLBACK_CURRENCY_CODES */
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    setBanner(null);
    loadRatesForBase(base)
      .then(({ rates: r, banner: b }) => {
        if (cancelled) return;
        setRates(r);
        setBanner(b);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, base, refreshKey]);

  return { codes, rates, banner, loading, refresh };
}
