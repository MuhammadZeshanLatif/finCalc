export const SITE_NAME = "FinCalc";

/** Production site URL — set `VITE_SITE_URL` in `.env` when you deploy (no trailing slash). */
export function getSiteUrl(): string {
  const u = import.meta.env.VITE_SITE_URL as string | undefined;
  if (u && /^https?:\/\//i.test(u)) return u.replace(/\/+$/, "");
  return "https://fincalc-multipurpose.pro";
}

/** Absolute OG / Twitter image URL (optional). Falls back to `{site}/og-image.svg`. */
export function getOgImageUrl(): string {
  const u = import.meta.env.VITE_OG_IMAGE_URL as string | undefined;
  if (u && /^https?:\/\//i.test(u)) return u;
  return `${getSiteUrl()}/og-image.svg`;
}

export function getOgImageAlt(lang: "en" | "ru"): string {
  return lang === "ru"
    ? "FinCalc — бесплатные финансовые калькуляторы онлайн"
    : "FinCalc — free online financial calculators";
}

export function getOrgName(): string {
  const n = import.meta.env.VITE_ORG_NAME as string | undefined;
  return (n && n.trim()) || SITE_NAME;
}

export function getContactEmail(): string | undefined {
  const e = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : undefined;
}

/** @handles without @ for twitter:site / twitter:creator */
export function getTwitterSite(): string | undefined {
  const h = (import.meta.env.VITE_TWITTER_SITE as string | undefined)?.replace(/^@/, "").trim();
  return h || undefined;
}

export function getTwitterCreator(): string | undefined {
  const h = (import.meta.env.VITE_TWITTER_CREATOR as string | undefined)?.replace(/^@/, "").trim();
  return h || undefined;
}

/** Comma-separated profile URLs for Organization sameAs (e.g. Twitter, Facebook). */
export function getOrgSameAs(): string[] {
  const raw = import.meta.env.VITE_ORG_SAME_AS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(s => /^https?:\/\//i.test(s));
}

/**
 * Optional v6.exchangerate-api.com key — 160+ currencies, frequent updates.
 * Without it, the app uses the free Frankfurter API (ECB rates, many majors, no key).
 */
export function getExchangeRateApiKey(): string | undefined {
  const k = import.meta.env.VITE_EXCHANGE_RATE_API_KEY as string | undefined;
  const t = k?.trim();
  return t || undefined;
}
