/** All valid in-app routes (first path segment after `/` or `/ru/`). */
export const ROUTE_PAGES = new Set([
  "home",
  "blog",
  "about",
  "contact",
  "privacy",
  "terms",
  "basic",
  "interest",
  "deposit",
  "loan",
  "mortgage",
  "days",
  "vat",
  "emi",
  "bmi",
  "tax",
  "currency",
  "ti84",
  "salestax",
  "desmos",
  "notfound",
]);

export type AppLang = "en";

export type ParsedRoute = { lang: AppLang; page: string; blogSlug: string | null };

export function parsePathname(pathname: string): ParsedRoute {
  const p = (pathname.replace(/\/+$/, "") || "/") as string;

  if (p === "/" || p === "") return { lang: "en", page: "home", blogSlug: null };

  const rest = p.startsWith("/") ? p.slice(1) : p;

  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 0) return { lang: "en", page: "home", blogSlug: null };

  if (parts[0] === "blog" && parts.length >= 2) {
    return { lang: "en", page: "blog", blogSlug: parts.slice(1).join("/") };
  }
  if (parts[0] === "blog") return { lang: "en", page: "blog", blogSlug: null };

  if (parts.length === 1) {
    return { lang: "en", page: parts[0], blogSlug: null };
  }

  return { lang: "en", page: "home", blogSlug: null };
}

export function buildPathname(_lang: AppLang, page: string, blogSlug?: string | null): string {
  const slug = blogSlug?.trim() || null;
  if (page === "blog" && slug) {
    return `/blog/${slug}`;
  }
  if (page === "blog") {
    return "/blog";
  }

  const p = page === "home" ? "home" : page;
  if (p === "home") return "/";
  return `/${p}`;
}

export function normalizePage(page: string): string {
  return ROUTE_PAGES.has(page) ? page : "notfound";
}
