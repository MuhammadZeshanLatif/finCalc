import { getExchangeRateApiKey } from "../config/site";

/** When API + cache fail, only these pairs use built-in demo numbers. */
const STATIC_RATES: Record<string, number> = {
  "USD-EUR": 0.92,
  "EUR-USD": 1.08,
  "USD-RUB": 90.5,
  "RUB-USD": 0.011,
  "EUR-RUB": 98.2,
  "RUB-EUR": 0.01,
};

/** If /currencies fails, still offer a broad ECB-style list (Frankfurter subset). */
export const FALLBACK_CURRENCY_CODES = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RON",
  "RUB",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "USD",
  "ZAR",
] as const;

export type FxBanner =
  | { type: "live"; date: string; source: "frankfurter" | "exchangerate-api" }
  | { type: "cache"; date: string }
  | { type: "demo" }
  | { type: "error"; msg: string };

const CACHE_PREFIX = "fc-fx-v1:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function staticDemoFactor(from: string, to: string): number | null {
  if (from === to) return 1;
  return STATIC_RATES[`${from}-${to}`] ?? null;
}

export async function fetchFrankfurterCurrencyCodes(): Promise<string[]> {
  const res = await fetch("https://api.frankfurter.app/currencies");
  if (!res.ok) throw new Error("currencies");
  const data = (await res.json()) as Record<string, string>;
  return Object.keys(data).sort();
}

async function fetchFrankfurterLatest(base: string): Promise<{ date: string; rates: Record<string, number> }> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`);
  if (!res.ok) throw new Error("latest");
  const data = (await res.json()) as {
    date: string;
    rates: Record<string, number>;
  };
  if (!data.rates || typeof data.date !== "string") throw new Error("parse");
  return { date: data.date, rates: data.rates };
}

async function fetchExchangerateApiLatest(
  apiKey: string,
  base: string,
): Promise<{ date: string; rates: Record<string, number> }> {
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${encodeURIComponent(apiKey)}/latest/${encodeURIComponent(base)}`,
  );
  const data = (await res.json()) as {
    result: string;
    "error-type"?: string;
    time_last_update_utc?: string;
    conversion_rates?: Record<string, number>;
  };
  if (data.result !== "success" || !data.conversion_rates) {
    throw new Error(data["error-type"] || "exchangerate-api");
  }
  const utc = data.time_last_update_utc ?? "";
  const date = utc.slice(0, 10) || new Date().toISOString().slice(0, 10);
  return { date, rates: data.conversion_rates };
}

function readCache(base: string): { date: string; rates: Record<string, number> } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + base);
    if (!raw) return null;
    const o = JSON.parse(raw) as { at: number; date: string; rates: Record<string, number> };
    if (!o.rates || Date.now() - o.at > CACHE_TTL_MS) return null;
    return { date: o.date, rates: o.rates };
  } catch {
    return null;
  }
}

function writeCache(base: string, date: string, rates: Record<string, number>) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + base, JSON.stringify({ at: Date.now(), date, rates }));
  } catch {
    /* ignore quota */
  }
}

export async function loadRatesForBase(base: string): Promise<{
  rates: Record<string, number>;
  banner: FxBanner;
}> {
  const apiKey = getExchangeRateApiKey();

  try {
    const data = apiKey
      ? await fetchExchangerateApiLatest(apiKey, base)
      : await fetchFrankfurterLatest(base);
    writeCache(base, data.date, data.rates);
    return {
      rates: data.rates,
      banner: { type: "live", date: data.date, source: apiKey ? "exchangerate-api" : "frankfurter" },
    };
  } catch {
    const cached = readCache(base);
    if (cached) {
      return {
        rates: cached.rates,
        banner: { type: "cache", date: cached.date },
      };
    }
    return { rates: {}, banner: { type: "demo" } };
  }
}
