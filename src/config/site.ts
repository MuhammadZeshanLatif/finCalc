export const SITE_NAME = "FinanceCalculator";

/**
 * Hreflang `x-default` points at this locale’s URL — “fallback” when Google can’t match a user’s language.
 * `ru` = Russia-first positioning (does not replace good RU content, links, or Search Console).
 */
export const HREFLANG_X_DEFAULT_LANG: "en" | "ru" = "en";

/** Site logo (navbar, hero, structured data). */
export const SITE_LOGO_URL = "/logo.webp";

/** Default Open Graph / Twitter / link preview image (absolute path on origin). */
export const SITE_PREVIEW_IMAGE_PATH = "/og-image.webp";

/**
 * Organization logo for JSON-LD (Google recommends ≥112×112; matches site favicon artwork).
 * Raster PNG generated from `logo.webp`.
 */
export const SITE_ORG_LOGO_PATH = "/apple-touch-icon.png";

/** Official brand profiles (shown in UI + JSON-LD sameAs). */
export const OFFICIAL_SOCIAL_X = "https://x.com/fincalculat";
export const OFFICIAL_SOCIAL_INSTAGRAM = "https://www.instagram.com/fincalculat/";
export const OFFICIAL_SOCIAL_YOUTUBE = "https://www.youtube.com/@FinCalc-i1y";
export const OFFICIAL_SOCIAL_TIKTOK = "https://www.tiktok.com/@fincalculat";
export const OFFICIAL_SOCIAL_PINTEREST = "https://www.pinterest.com/fincalculat/";
export const OFFICIAL_SOCIAL_REDDIT = "https://www.reddit.com/user/fincalculat";

/** Production site URL — set `VITE_SITE_URL` in `.env` when you deploy (no trailing slash). */
export function getSiteUrl(): string {
  const u = import.meta.env.VITE_SITE_URL as string | undefined;
  if (u && /^https?:\/\//i.test(u)) return u.replace(/\/+$/, "");
  return "https://financcalculator.ru";
}

/** Absolute OG / Twitter image URL (optional). Falls back to `{site}/og-image.webp`. */
export function getOgImageUrl(): string {
  const u = import.meta.env.VITE_OG_IMAGE_URL as string | undefined;
  if (u && /^https?:\/\//i.test(u)) return u;
  return `${getSiteUrl()}${SITE_PREVIEW_IMAGE_PATH}`;
}

export function getOgImageAlt(lang: "en" | "ru"): string {
  return lang === "ru"
    ? "FinanceCalculator — бесплатные финансовые калькулятор онлайн"
    : "FinanceCalculator — free online financial calculators";
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
  return h || "fincalculat";
}

export function getTwitterCreator(): string | undefined {
  const h = (import.meta.env.VITE_TWITTER_CREATOR as string | undefined)?.replace(/^@/, "").trim();
  return h || "fincalculat";
}

/** Comma-separated profile URLs for Organization sameAs (e.g. Twitter, Facebook). */
export function getOrgSameAs(): string[] {
  const builtIn = [
    OFFICIAL_SOCIAL_X,
    OFFICIAL_SOCIAL_INSTAGRAM,
    OFFICIAL_SOCIAL_YOUTUBE,
    OFFICIAL_SOCIAL_TIKTOK,
    OFFICIAL_SOCIAL_PINTEREST,
    OFFICIAL_SOCIAL_REDDIT,
  ];
  const raw = import.meta.env.VITE_ORG_SAME_AS as string | undefined;
  const fromEnv = raw?.trim()
    ? raw
        .split(",")
        .map(s => s.trim())
        .filter(s => /^https?:\/\//i.test(s))
    : [];
  return [...new Set([...builtIn, ...fromEnv])];
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
