/** SEO meta length targets (Search Console / SERP snippet tuning). */
export const META_TITLE_MIN = 51;
export const META_TITLE_MAX = 160;
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
  return cut.replace(/[\s|,;:\-–—.]+$/, "").trim();
}

export function normalizeMetaTitle(raw: string): string {
  let t = collapseWs(raw);
  if (t.length > META_TITLE_MAX) {
    t = truncateAtWord(t, META_TITLE_MAX);
  }
  const suffixes = [" | FinCalc", " Online", " — Free", " Tool"];
  for (const suffix of suffixes) {
    if (t.length >= META_TITLE_MIN) break;
    if (t.length + suffix.length <= META_TITLE_MAX) t += suffix;
  }
  return t.slice(0, META_TITLE_MAX);
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
    " Accurate, fast, English and Russian.",
    " No sign-up required.",
  ];
  for (const pad of pads) {
    if (d.length >= META_DESC_MIN) break;
    if (d.length + pad.length <= META_DESC_MAX) d += pad;
  }
  return d.slice(0, META_DESC_MAX);
}

/** Strip trailing slash; keep bare origin for home paths. */
export function normalizeCanonicalUrl(base: string, pathname: string): string {
  const b = base.replace(/\/+$/, "");
  const p = pathname.replace(/\/+$/, "");
  if (!p || p === "/") return b;
  return `${b}${p.startsWith("/") ? p : `/${p}`}`;
}
