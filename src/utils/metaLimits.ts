/** SEO meta length targets (Search Console / SERP snippet tuning). */
/** Google shows roughly 50–60 characters of a title; longer titles get cut or rewritten. */
export const META_TITLE_MAX = 65;
export const META_DESC_MIN = 151;
export const META_DESC_MAX = 159;

function collapseWs(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function truncateAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  let cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > max - 20) cut = cut.slice(0, lastSpace);
  return cut.replace(/[\s|,;:\-–—.&]+$/, "").trim();
}

/** Trailing brand variants that slipped into hand-written titles ("| Finance Calculator Blog", "| FinCalc"…). */
const BRAND_SUFFIX_RE = /\s*[|–—-]\s*(FinanceCalculator|Finance Calculator|FinCalc)(\s+Blog)?\s*$/i;

/**
 * One consistent brand suffix: strips any hand-written variant, then appends ` | {brand}`
 * only when the result still fits the SERP width — otherwise the keyword-bearing part wins.
 */
export function withBrandSuffix(rawTitle: string, brand: string): string {
  const core = collapseWs(rawTitle).replace(BRAND_SUFFIX_RE, "");
  if (core.toLowerCase() === brand.toLowerCase()) return core;
  const branded = `${core} | ${brand}`;
  return branded.length <= META_TITLE_MAX ? branded : core;
}

export function normalizeMetaTitle(raw: string): string {
  return truncateAtWord(collapseWs(raw), META_TITLE_MAX);
}

export function normalizeMetaDescription(raw: string): string {
  let d = collapseWs(raw);
  if (d.length > META_DESC_MAX) {
    d = truncateAtWord(d, META_DESC_MAX);
    if (!/[.!?]$/.test(d)) d += ".";
    if (d.length > META_DESC_MAX) d = truncateAtWord(d, META_DESC_MAX);
  }
  const pads = [
    " Free FinanceCalculator guides and tools online.",
    " Accurate, fast, and free.",
    " No sign-up required.",
  ];
  for (const pad of pads) {
    if (d.length >= META_DESC_MIN) break;
    if (d.length + pad.length <= META_DESC_MAX) d += pad;
  }
  return d.slice(0, META_DESC_MAX);
}

/** Strip trailing slash; the home page is always `{origin}/`. */
export function normalizeCanonicalUrl(base: string, pathname: string): string {
  const b = base.replace(/\/+$/, "");
  const p = pathname.replace(/\/+$/, "");
  if (!p || p === "/") return `${b}/`;
  return `${b}${p.startsWith("/") ? p : `/${p}`}`;
}
