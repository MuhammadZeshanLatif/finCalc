/** All valid in-app routes (first path segment after `/` or `/ru/`). */
export const ROUTE_PAGES = new Set([
  "home",
  "blog",
  "login",
  "blogstudio",
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
  "autoloan",
  "loanearly",
  "notfound",
]);

export type AppLang = "en" | "ru";

export type ParsedRoute = { lang: AppLang; page: string; blogSlug: string | null };

export function parsePathname(pathname: string): ParsedRoute {
  const p = (pathname.replace(/\/+$/, "") || "/") as string;
  let lang: AppLang = "en";
  let rest = "";

  if (p === "/" || p === "") return { lang: "en", page: "home", blogSlug: null };
  if (p === "/ru") return { lang: "ru", page: "home", blogSlug: null };

  if (p.startsWith("/ru/")) {
    lang = "ru";
    rest = p.slice(4);
  } else {
    rest = p.startsWith("/") ? p.slice(1) : p;
  }

  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 0) return { lang, page: "home", blogSlug: null };

  if (parts[0] === "blog" && parts.length >= 2) {
    return { lang, page: "blog", blogSlug: parts.slice(1).join("/") };
  }
  if (parts[0] === "blog") return { lang, page: "blog", blogSlug: null };

  if (parts.length === 1) {
    return { lang, page: parts[0], blogSlug: null };
  }

  return { lang, page: "home", blogSlug: null };
}

export function buildPathname(lang: AppLang, page: string, blogSlug?: string | null): string {
  const slug = blogSlug?.trim() || null;
  if (page === "blog" && slug) {
    return lang === "ru" ? `/ru/blog/${slug}` : `/blog/${slug}`;
  }
  if (page === "blog") {
    return lang === "ru" ? "/ru/blog" : "/blog";
  }

  const p = page === "home" ? "home" : page;
  if (p === "home") return lang === "ru" ? "/ru" : "/";
  return lang === "ru" ? `/ru/${p}` : `/${p}`;
}

export function normalizePage(page: string): string {
  return ROUTE_PAGES.has(page) ? page : "notfound";
}
