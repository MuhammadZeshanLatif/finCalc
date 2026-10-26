import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { translations } from "./data/translations";
import {
  getBlogPosts,
  getLatestPosts,
  getPostBySlug,
  getRelatedPosts,
} from "./data/blog";
import Calculators from "./components/Calculators";
// Graphing tools pull in mathjs (~half the bundle) — load them only on their own pages.
const TI84CalculatorPage = lazy(() => import("./components/TI84CalculatorPage"));
const DesmosCalculatorPage = lazy(() => import("./components/DesmosCalculatorPage"));
const graphingFallback = <div className="fc-page-box text-muted small" style={{ minHeight: "60vh" }}>Loading calculator…</div>;
import { CalculatorRichArticle } from "./components/calc/CalculatorRichArticle";
import { BlogArticlePage } from "./components/blog/BlogArticlePage";
import { DatabaseArticlePage, DB_ARTICLE_PLACEHOLDERS, dbArticleView } from "./components/blog/DatabaseArticlePage";
import type { DbPost } from "./lib/blogPosts";
// The Supabase client (~50 kB gzip) loads only when a page actually talks to the database.
const blogApi = () => import("./lib/blogPosts");
import { LegalPage } from "./components/legal/LegalPage";
import { privacyPolicy } from "./data/legal/privacy";
import { termsOfUse } from "./data/legal/terms";
import { disclaimer } from "./data/legal/disclaimer";
import { editorialPolicy } from "./data/legal/editorial";
import type { LegalDocument } from "./data/legal/types";

const legalDocs: Record<string, Record<"en", LegalDocument>> = {
  privacy: privacyPolicy,
  terms: termsOfUse,
  disclaimer,
  "editorial-policy": editorialPolicy,
};
import {
  getContactEmail,
  OFFICIAL_SOCIAL_INSTAGRAM,
  OFFICIAL_SOCIAL_PINTEREST,
  OFFICIAL_SOCIAL_REDDIT,
  OFFICIAL_SOCIAL_TIKTOK,
  OFFICIAL_SOCIAL_X,
  OFFICIAL_SOCIAL_YOUTUBE,
  SITE_LOGO_URL,
} from "./config/site";
import { buildPathname, normalizePage, parsePathname, type AppLang } from "./utils/routes";
import { resolveDbPostSeo, resolvePageSeo } from "./utils/pageSeo";
import { updatePageSeo } from "./utils/seo";

export type AppRoute = { lang: AppLang; page: string; blogSlug: string | null };

/** Route for a pathname, without touching browser history (used by the prerender script). */
export function routeFromPathname(pathname: string): AppRoute {
  const { lang, page, blogSlug } = parsePathname(pathname);
  if (page === "blog" && blogSlug) return { lang, page, blogSlug };
  return { lang, page: normalizePage(page), blogSlug: null };
}

let fcRouteSeed: AppRoute | null = null;
function seedRoute(initial?: AppRoute): AppRoute {
  if (initial) return initial;
  if (fcRouteSeed) return fcRouteSeed;
  let { lang, page, blogSlug } = parsePathname(window.location.pathname);
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    page = normalizePage(hash);
    blogSlug = null;
    window.history.replaceState({}, "", buildPathname(lang, page, null));
    window.location.hash = "";
  } else {
    if (page !== "blog" || !blogSlug) {
      page = normalizePage(page);
      if (page !== "blog") blogSlug = null;
    }
  }
  fcRouteSeed = { lang, page, blogSlug };
  return fcRouteSeed;
}

const calcMeta: Record<string, { icon: string }> = {
  basic:     { icon: "fa-calculator" },
  interest:  { icon: "fa-chart-line" },
  deposit:   { icon: "fa-piggy-bank" },
  loan:      { icon: "fa-hand-holding-dollar" },
  mortgage:  { icon: "fa-house" },
  days:      { icon: "fa-calendar-days" },
  vat:       { icon: "fa-receipt" },
  emi:       { icon: "fa-credit-card" },
  bmi:       { icon: "fa-weight-scale" },
  tax:       { icon: "fa-file-invoice-dollar" },
  currency:  { icon: "fa-money-bill-transfer" },
  ti84:      { icon: "fa-microchip" },
  salestax:  { icon: "fa-tags" },
  desmos:    { icon: "fa-chart-line" },
};

/** Card shape shared by built-in guides and posts published from the admin dashboard. */
type BlogCard = { slug: string; title: string; excerpt: string; datePublished: string; image: string; calcLink: string };

export default function App({ initialRoute, dbShell = false }: { initialRoute?: AppRoute; dbShell?: boolean } = {}) {
  const [lang, setLang] = useState<AppLang>(() => seedRoute(initialRoute).lang);
  const [currentPage, setCurrentPage] = useState(() => seedRoute(initialRoute).page);
  const [blogSlug, setBlogSlug] = useState<string | null>(() => seedRoute(initialRoute).blogSlug);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [blogPage, setBlogPage] = useState<number>(1);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [contactSending, setContactSending] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string>("");
  // Posts published from /admin (Supabase). Built-in guides come from src/data/blog.
  const [liveDbPosts, setLiveDbPosts] = useState<DbPost[]>([]);
  const [dbPost, setDbPost] = useState<{ slug: string; post: DbPost | null } | null>(null);
  const postsPerPage = 6;

  useEffect(() => {
    const onPop = () => {
      const { lang: L, page: P, blogSlug: S } = parsePathname(window.location.pathname);
      setLang(L);
      if (P === "blog" && S) {
        setCurrentPage("blog");
        setBlogSlug(S);
      } else {
        setCurrentPage(normalizePage(P));
        setBlogSlug(null);
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateTo = (page: string, opts?: { blogSlug?: string | null }) => {
    const p = normalizePage(page);
    const slug = p === "blog" && opts?.blogSlug ? opts.blogSlug : null;
    setCurrentPage(p);
    setBlogSlug(slug);
    if (p === "blog" && !slug) setBlogPage(1);
    window.history.pushState({}, "", buildPathname(lang, p, slug));
    window.scrollTo(0, 0);
  };

  /** Same-site href from article HTML, e.g. `/mortgage` or `/blog/some-post#faq`. */
  const navigateToPath = (href: string) => {
    const [path, hash] = href.split("#");
    const route = routeFromPathname(path || "/");
    navigateTo(route.page, { blogSlug: route.blogSlug });
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView(), 50);
  };

  useEffect(() => {
    if (dbShell) return;
    // Only the blog index and article pages list database posts; fetch once, after first paint.
    if (currentPage !== "blog" || liveDbPosts.length) return;
    blogApi().then(m => m.fetchLivePosts()).then(setLiveDbPosts, () => {});
  }, [dbShell, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const staticPost = blogSlug ? getPostBySlug(lang, blogSlug) : undefined;
  const wantsDbPost = currentPage === "blog" && Boolean(blogSlug) && !staticPost && !dbShell;

  useEffect(() => {
    if (!wantsDbPost || !blogSlug) return;
    if (dbPost?.slug === blogSlug) return;
    let cancelled = false;
    blogApi()
      .then(m => m.fetchLivePostBySlug(blogSlug))
      .catch(() => null)
      .then(post => {
        if (!cancelled) setDbPost({ slug: blogSlug, post });
      });
    return () => { cancelled = true; };
  }, [wantsDbPost, blogSlug, dbPost?.slug]);

  const activeDbPost = wantsDbPost && dbPost?.slug === blogSlug ? dbPost.post : null;
  const dbPostLoading = wantsDbPost && dbPost?.slug !== blogSlug;

  const submitContactForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Honeypot: real visitors never fill the hidden "website" field.
    if (String(data.get("website") || "")) { setContactSubmitted(true); return; }
    setContactSending(true);
    setContactError("");
    const { submitContact } = await import("./lib/supabase");
    const result = await submitContact({
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
    });
    setContactSending(false);
    if (result.ok) setContactSubmitted(true);
    else setContactError(result.error || "Could not send your message.");
  };

  const t = translations[lang];
  const legalLinks = [
    { page: "privacy", label: t.privacy },
    { page: "terms", label: t.terms },
    { page: "disclaimer", label: t.disclaimer },
    { page: "editorial-policy", label: t.editorialPolicy },
  ];

  const calculatorList = Object.keys(t.calculators).map(key => ({
    id: key,
    title: (t.calculators as any)[key].title,
    desc: (t.calculators as any)[key].desc,
  }));

  const filteredCalculators = calculatorList.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staticBlogPosts = getBlogPosts(lang);
  const currentBlogPosts = useMemo<BlogCard[]>(() => {
    const staticSlugs = new Set(staticBlogPosts.map(p => p.slug));
    const cards: BlogCard[] = staticBlogPosts.map(p => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      datePublished: p.datePublished,
      image: p.hero.srcWebp ?? p.hero.src,
      calcLink: p.calcLink,
    }));
    for (const p of liveDbPosts) {
      if (staticSlugs.has(p.slug)) continue;
      cards.push({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        datePublished: (p.publishedAt || "").slice(0, 10),
        image: p.image || "/og-image.webp",
        calcLink: p.calcLink,
      });
    }
    return cards.sort((a, b) => (b.datePublished > a.datePublished ? 1 : b.datePublished < a.datePublished ? -1 : 0));
  }, [staticBlogPosts, liveDbPosts]);
  const activeBlogPost = staticPost;
  const indexOfLastPost = blogPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const paginatedPosts = currentBlogPosts.slice(indexOfFirstPost, indexOfLastPost);

  const liveSlugs = useMemo(
    () => new Set([...staticBlogPosts.map(p => p.slug), ...liveDbPosts.map(p => p.slug), ...(activeDbPost ? [activeDbPost.slug] : [])]),
    [staticBlogPosts, liveDbPosts, activeDbPost],
  );
  const dbView = useMemo(
    () => (dbShell ? DB_ARTICLE_PLACEHOLDERS : activeDbPost ? dbArticleView(activeDbPost, slug => liveSlugs.has(slug)) : null),
    [dbShell, activeDbPost, liveSlugs],
  );

  useEffect(() => {
    if (dbShell) return;
    // While a database post loads, keep the head the server rendered (blog-router.php).
    if (dbPostLoading) return;
    if (activeDbPost) updatePageSeo(resolveDbPostSeo(lang, activeDbPost));
    else updatePageSeo(resolvePageSeo(lang, currentPage, blogSlug));
  }, [lang, currentPage, blogSlug, dbShell, dbPostLoading, activeDbPost]);

  return (
    <div className="fc-app-shell">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="navbar navbar-expand-lg navbar-dark fc-navbar">
        <div className="container position-relative">
          <a
            href="#main-content"
            className="visually-hidden-focusable position-absolute top-0 start-0 bg-white text-primary px-3 py-2 m-2 rounded shadow-sm z-3 small"
          >
            Skip to main content
          </a>
          <a
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
            href={buildPathname(lang, "home")}
            onClick={e => { e.preventDefault(); navigateTo("home"); }}
          >
            <span className="fc-brand-icon">
              <img src={SITE_LOGO_URL} alt="" width={38} height={38} decoding="async" />
            </span>
            <div>
              <span className="fw-bold text-white fc-navbar-brand-title">
                {t.siteTitle}
              </span>
              <small className="d-block text-white fc-navbar-brand-sub">
                {t.siteSubtitle}
              </small>
            </div>
          </a>

          <button
            className="navbar-toggler fc-navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#fcNavbarCollapse"
            aria-controls="fcNavbarCollapse"
            aria-expanded="false"
            aria-label="Menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse fc-navbar-collapse" id="fcNavbarCollapse">
            <ul className="navbar-nav ms-auto me-lg-3 mb-2 mb-lg-0 align-items-lg-center">
              {(
                [
                  { page: "home" as const, label: t.home },
                  { page: "blog" as const, label: t.blog },
                  { page: "about" as const, label: t.about },
                  { page: "contact" as const, label: t.contact },
                ] as const
              ).map(({ page, label }) => (
                <li className="nav-item" key={page}>
                  <a
                    className={clsx("nav-link fc-nav-link", currentPage === page && "active")}
                    href={buildPathname(lang, page)}
                    aria-current={currentPage === page ? "page" : undefined}
                    onClick={e => {
                      e.preventDefault();
                      navigateTo(page);
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="container my-4 fc-app-main">
        <div className="row g-4">

          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="fc-sidebar sticky-top fc-sidebar-sticky">
              <div className="fc-sidebar-header d-flex align-items-center gap-2">
                <i className="fa-solid fa-bars-staggered"></i>
                {t.allCalculators}
              </div>

              <div className="fc-sidebar-search">
                <div className="input-group input-group-sm">
                  <span className="input-group-text border-end-0">
                    <i className="fa-solid fa-magnifying-glass text-muted fc-search-addon-icon"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="fc-sidebar-list fc-sidebar-list-scroll">
                {filteredCalculators.map(c => {
                  const meta = calcMeta[c.id];
                  return (
                    <a
                      key={c.id}
                      href={buildPathname(lang, c.id)}
                      onClick={e => { e.preventDefault(); navigateTo(c.id); }}
                      className={`fc-sidebar-item ${currentPage === c.id ? "is-active" : ""}`}
                    >
                      {meta && (
                        <span className={`fc-sidebar-item__icon item-icon fc-calc-accent--${c.id}`}>
                          <i className={`fa-solid ${meta.icon}`}></i>
                        </span>
                      )}
                      <span>{c.title}</span>
                    </a>
                  );
                })}
                {/* TI-84 special entry */}
                <a
                  href={buildPathname(lang, "ti84")}
                  onClick={e => { e.preventDefault(); navigateTo("ti84"); }}
                  className={`fc-sidebar-item ${currentPage === "ti84" ? "is-active" : ""}`}
                >
                  <span className="fc-sidebar-item__icon item-icon" style={{ background: "#1a1a1a", color: "#6ab0ff" }}>
                    <i className="fa-solid fa-microchip"></i>
                  </span>
                  <span>{t.ti84SidebarLabel}</span>
                </a>
                {/* Desmos special entry */}
                <a
                  href={buildPathname(lang, "desmos")}
                  onClick={e => { e.preventDefault(); navigateTo("desmos"); }}
                  className={`fc-sidebar-item ${currentPage === "desmos" ? "is-active" : ""}`}
                >
                  <span className="fc-sidebar-item__icon item-icon" style={{ background: "#2a4a7f", color: "#7ec8e3" }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </span>
                  <span>{t.desmosSidebarLabel}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <main id="main-content" className="col-lg-9" role="main">

            {/* ── Home Page ──────────────────────────────── */}
            {currentPage === "home" && (
              <div>
                {/* Hero */}
                <div className="fc-hero">
                  <div className="fc-hero-clock-slot">
                    <LiveClock lang={lang} />
                  </div>
                  <h1 className="fc-hero-title d-flex align-items-center  flex-wrap gap-3">
                    <img
                      src={SITE_LOGO_URL}
                      alt=""
                      className="fc-hero-logo"
                      width={56}
                      height={56}
                      decoding="async"
                    />
                    <span>{t.siteTitle}</span>
                  </h1>
                  <p className="fc-hero-lead">{t.homeHeroLead}</p>
                  <div className="fc-hero-stats">
                    <div className="fc-hero-stat">
                      <span className="stat-num">{t.homeStatCalcNum}</span>
                      <span className="stat-label">{t.homeStatCalcLabel}</span>
                    </div>
                    <div className="fc-hero-stat">
                      <span className="stat-num">{t.homeStatLangNum}</span>
                      <span className="stat-label">{t.homeStatLangLabel}</span>
                    </div>
                    <div className="fc-hero-stat">
                      <span className="stat-num">{t.homeStatFreeNum}</span>
                      <span className="stat-label">{t.homeStatFreeLabel}</span>
                    </div>
                  </div>

                  <div className="fc-home-trust-row" role="list">
                    {[
                      { icon: "fa-bolt", label: t.homeTrustLive },
                      { icon: "fa-gift", label: t.homeTrustFree },
                      { icon: "fa-lock", label: t.homeTrustLang },
                      { icon: "fa-chart-column", label: t.homeTrustCharts },
                      { icon: "fa-shield-halved", label: t.homeTrustPrivacy },
                    ].map((item, i) => (
                      <div key={i} className="fc-home-trust-pill" role="listitem">
                        <i className={`fa-solid ${item.icon} fc-home-trust-pill__icon`} aria-hidden></i>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row g-4 mb-4 align-items-center">
                  <div className="col-12">
                    <div className="fc-home-promo-card">
                      <div className="fc-home-promo-badge">
                        <i className="fa-solid fa-calculator"></i> Basic Calculator
                      </div>
                      <h3 className="fc-home-promo-title">
                        Full scientific calculator
                      </h3>
                      <p className="fc-home-promo-text">
                        Powers, roots, factorial, trig, memory, and history — open the Basic Calculator tab in the sidebar.
                      </p>
                      <button
                        type="button"
                        className="btn fc-calc-btn"
                        onClick={() => navigateTo("basic")}
                      >
                        <i className="fa-solid fa-calculator"></i>{" "}
                        Open Basic Calculator
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section divider */}
                <div className="fc-section-rule">
                  <div className="fc-section-rule__line"></div>
                  <span className="fc-section-rule__label">
                    <i className="fa-solid fa-calculator"></i> {t.homeSectionFinancialCalculators}
                  </span>
                  <div className="fc-section-rule__line"></div>
                </div>


                {/* Calculator Cards Grid */}
                <div className="row g-3">
                  {filteredCalculators.map(c => {
                    const meta = calcMeta[c.id];
                    return (
                      <div className="col-md-6" key={c.id}>
                          <div className="fc-calc-card card border-0">
                            <div className="card-body d-flex flex-column p-4">
                              {meta && (
                                <span className={`fc-card-icon fc-calc-accent--${c.id}`}>
                                  <i className={`fa-solid ${meta.icon}`}></i>
                                </span>
                              )}
                              <div className="fc-card-title">{c.title}</div>
                              <div className="fc-card-desc">{c.desc}</div>
                              <a
                                href={buildPathname(lang, c.id)}
                                onClick={e => { e.preventDefault(); navigateTo(c.id); }}
                                className="btn fc-card-btn"
                              >
                                {t.readMore}
                                <i className="fa-solid fa-arrow-right"></i>
                              </a>
                            </div>
                          </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Calculator Page ─────────────────────── */}
            {calculatorList.some(c => c.id === currentPage) && (
              <Calculators id={currentPage} lang={lang} />
            )}

            {/* ── TI-84 Plus CE ────────────────────────── */}
            {currentPage === "ti84" && (
              <div className="fc-calc-page">
                <div className="fc-calc-header">
                  <h1>
                    <i className="fa-solid fa-microchip me-2 fc-calc-header-icon" style={{ color: "#6ab0ff" }} />
                    {t.ti84PageTitle}
                  </h1>
                  <p>{t.ti84PageLead}</p>
                </div>
                <Suspense fallback={graphingFallback}>
                  <TI84CalculatorPage />
                </Suspense>
                <CalculatorRichArticle id="ti84" lang={lang} />
              </div>
            )}

            {/* ── Graphing calculator (/desmos) ─────────── */}
            {currentPage === "desmos" && (
              <div className="fc-calc-page fc-calc-page--graphing">
                <div className="fc-calc-header">
                  <h1>
                    <i className="fa-solid fa-chart-line me-2 fc-calc-header-icon" style={{ color: "#7ec8e3" }} />
                    {t.desmosPageTitle}
                  </h1>
                  <p>{t.desmosPageLead}</p>
                </div>
                <Suspense fallback={graphingFallback}>
                  <DesmosCalculatorPage lang={lang} onNavigate={navigateTo} />
                </Suspense>
              </div>
            )}

            {/* ── Blog article ───────────────────────── */}
            {currentPage === "blog" && blogSlug && activeBlogPost && (
              <BlogArticlePage
                post={activeBlogPost}
                lang={lang}
                latest={getLatestPosts(lang, 5, activeBlogPost.topicKey)}
                related={getRelatedPosts(lang, activeBlogPost.topicKey, 4)}
                blogIndexPath={buildPathname(lang, "blog", null)}
                labels={{
                  toc: t.blogTableOfContents,
                  keyPhrases: t.blogKeyPhrases,
                  sources: t.blogSources,
                  updated: t.blogUpdated,
                  author: t.blogAuthor,
                  readTime: t.blogReadTime,
                  tryCalculator: t.blogTryCalculator,
                  related: t.blogRelatedPosts,
                  latest: t.blogLatestPosts,
                  backToBlog: t.blogBackToIndex,
                  readTimeSuffix: t.blogMinutes,
                }}
                onOpenCalculator={calcId => navigateTo(calcId)}
                onSelectPost={slug => navigateTo("blog", { blogSlug: slug })}
                onBackToBlog={() => navigateTo("blog")}
              />
            )}

            {currentPage === "blog" && blogSlug && !activeBlogPost && dbView && (
              <DatabaseArticlePage
                view={dbView}
                lang={lang}
                latest={getLatestPosts(lang, 5)}
                blogIndexPath={buildPathname(lang, "blog", null)}
                labels={{
                  toc: t.blogTableOfContents,
                  author: t.blogAuthor,
                  readTime: t.blogReadTime,
                  readTimeSuffix: t.blogMinutes,
                  tryCalculator: t.blogTryCalculator,
                  latest: t.blogLatestPosts,
                  backToBlog: t.blogBackToIndex,
                }}
                onNavigate={navigateToPath}
                onSelectPost={slug => navigateTo("blog", { blogSlug: slug })}
                onBackToBlog={() => navigateTo("blog")}
              />
            )}

            {currentPage === "blog" && blogSlug && !activeBlogPost && dbPostLoading && (
              <div className="fc-page-box text-muted small" style={{ minHeight: "60vh" }}>Loading article…</div>
            )}

            {currentPage === "blog" && blogSlug && !activeBlogPost && !dbView && !dbPostLoading && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary border-bottom pb-3 mb-4">
                  Page not found
                </h1>
                <p className="text-muted">This blog post does not exist.</p>
                <button type="button" className="btn btn-primary" onClick={() => navigateTo("blog")}>
                  {t.blogBackToIndex}
                </button>
              </div>
            )}

            {/* ── Blog index ──────────────────────────── */}
            {currentPage === "blog" && !blogSlug && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary d-flex align-items-center gap-2 border-bottom pb-3 mb-4">
                  <i className="fa-solid fa-newspaper"></i> {t.latestPosts}
                </h1>
                <p className="text-body-secondary mb-4 fc-blog-index-lead">
                  Long-form guides with a table of contents, citations, and calculator deep-links. Open an article for the full layout.
                </p>
                <div className="row g-4">
                  {paginatedPosts.map(post => {
                    const thumbSrc = post.image;
                    const postHref = buildPathname(lang, "blog", post.slug);
                    const openPost = (e: React.MouseEvent) => {
                      e.preventDefault();
                      navigateTo("blog", { blogSlug: post.slug });
                    };
                    return (
                    <div key={post.slug} className="col-md-6">
                      <article className="fc-blog-card card border-0 h-100 overflow-hidden">
                        <a
                          href={postHref}
                          className="fc-blog-card-thumb-link"
                          aria-label={`${t.blogReadArticle}: ${post.title}`}
                          onClick={openPost}
                        >
                          <img
                            src={thumbSrc}
                            alt=""
                            className="card-img-top fc-blog-card-thumb"
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            onError={e => {
                              const img = e.currentTarget;
                              img.onerror = null;
                              img.classList.add("fc-blog-img--failed");
                              img.removeAttribute("src");
                            }}
                          />
                        </a>
                        <div className="card-body d-flex flex-column p-4">
                          <div className="fc-blog-date">
                            <i className="fa-regular fa-calendar-days" aria-hidden></i>{" "}
                            <time dateTime={post.datePublished}>{post.datePublished}</time>
                          </div>
                          <h2 className="fc-blog-title h5 mb-2">
                            <a href={postHref} onClick={openPost} className="text-reset text-decoration-none">
                              {post.title}
                            </a>
                          </h2>
                          <p className="fc-blog-desc flex-grow-1 mb-3">{post.excerpt}</p>
                          <div className="d-flex flex-wrap gap-2 mt-auto">
                            <a
                              href={postHref}
                              onClick={openPost}
                              className="btn btn-primary btn-sm"
                            >
                              <i className="fa-solid fa-book-open me-1" aria-hidden></i>
                              {t.blogReadArticle}
                            </a>
                            {post.calcLink ? (
                              <a
                                href={buildPathname(lang, post.calcLink)}
                                onClick={e => { e.preventDefault(); navigateTo(post.calcLink); }}
                                className="btn fc-blog-btn btn-sm"
                              >
                                <i className="fa-solid fa-calculator me-1" aria-hidden></i>
                                {t.blogTryCalculator}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </div>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                  <button
                    className="btn btn-outline-secondary fc-pagination-btn"
                    disabled={blogPage === 1}
                    onClick={() => setBlogPage(p => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left me-1"></i> {t.prev}
                  </button>
                  <span className="fw-bold small text-muted">Page {blogPage}</span>
                  <button
                    className="btn btn-outline-secondary fc-pagination-btn"
                    disabled={indexOfLastPost >= currentBlogPosts.length}
                    onClick={() => setBlogPage(p => p + 1)}
                  >
                    {t.next} <i className="fa-solid fa-chevron-right ms-1"></i>
                  </button>
                </div>

                {/* Archive: every article linked from the index (pagination alone hides older posts from crawlers). */}
                <nav className="mt-5 pt-4 border-top" aria-labelledby="fc-blog-archive-h">
                  <h2 id="fc-blog-archive-h" className="h6 text-body-secondary mb-3">{t.blogBackToIndex}</h2>
                  <ul className="small mb-0 ps-3">
                    {currentBlogPosts.map(post => (
                      <li key={post.slug} className="mb-1">
                        <a
                          href={buildPathname(lang, "blog", post.slug)}
                          onClick={e => { e.preventDefault(); navigateTo("blog", { blogSlug: post.slug }); }}
                          className="text-decoration-none"
                        >
                          {post.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* ── About Page ─────────────────────────── */}
            {currentPage === "about" && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary d-flex align-items-center gap-2 border-bottom pb-3 mb-4">
                  <i className="fa-solid fa-circle-info"></i> {t.about}
                </h1>
                <CalculatorRichArticle id="about" lang={lang} />
              </div>
            )}

            {/* ── Contact Page ────────────────────────── */}
            {currentPage === "contact" && (
              <div className="fc-page-box fc-page-box--narrow">
                <h1 className="h2 text-primary d-flex align-items-center gap-2 border-bottom pb-3 mb-4">
                  <i className="fa-solid fa-paper-plane"></i> {t.contact}
                </h1>
                <p className="text-body-secondary mb-4">
                  Email:{" "}
                  <a href={`mailto:${getContactEmail()}`}>{getContactEmail()}</a>
                </p>
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center gap-3 rounded-3">
                    <i className="fa-solid fa-circle-check fs-4"></i>
                    <div className="fw-medium">{t.successMsg}</div>
                  </div>
                ) : (
                  <form onSubmit={submitContactForm}>
                    <div className="mb-3">
                      <label htmlFor="fc-contact-name" className="form-label fw-semibold fc-form-label-sm">{t.name}</label>
                      <input id="fc-contact-name" name="name" type="text" className="form-control" maxLength={200} autoComplete="name" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fc-contact-email" className="form-label fw-semibold fc-form-label-sm">{t.email}</label>
                      <input id="fc-contact-email" name="email" type="email" className="form-control" maxLength={320} autoComplete="email" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="fc-contact-subject" className="form-label fw-semibold fc-form-label-sm">Subject</label>
                      <input id="fc-contact-subject" name="subject" type="text" className="form-control" maxLength={300} placeholder="Calculator question, correction, partnership…" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="fc-contact-message" className="form-label fw-semibold fc-form-label-sm">{t.message}</label>
                      <textarea id="fc-contact-message" name="message" className="form-control" rows={4} maxLength={5000} required></textarea>
                    </div>
                    <div className="visually-hidden" aria-hidden="true">
                      <label htmlFor="fc-contact-website">Website</label>
                      <input id="fc-contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    {contactError && <div className="alert alert-danger small" role="alert">{contactError}</div>}
                    <p className="small text-muted">
                      We use your name and email only to reply. See our{" "}
                      <a href={buildPathname(lang, "privacy")} onClick={e => { e.preventDefault(); navigateTo("privacy"); }}>Privacy Policy</a>.
                    </p>
                    <button type="submit" className="fc-submit-btn" disabled={contactSending}>
                      <i className="fa-solid fa-paper-plane me-2"></i> {contactSending ? "Sending…" : t.sendMessage}
                    </button>
                  </form>
                )}
              </div>
            )}

            {legalDocs[currentPage] && (
              <LegalPage
                doc={legalDocs[currentPage][lang]}
                lang={lang}
                related={legalLinks.filter(l => l.page !== currentPage)}
                onNavigate={page => navigateTo(page)}
              />
            )}

            {/* ── 404 Not Found ───────────────────────────── */}
            {currentPage === "notfound" && (
              <div className="fc-404-wrap">
                <div className="fc-404-graphic">
                  <span className="fc-404-num">4</span>
                  <span className="fc-404-icon-wrap">
                    <i className="fa-solid fa-calculator fc-404-calc-icon"></i>
                  </span>
                  <span className="fc-404-num">4</span>
                </div>
                <h1 className="fc-404-title">
                  Page Not Found
                </h1>
                <p className="fc-404-desc">
                  Looks like this page doesn't exist or has been moved.
                </p>
                <div className="fc-404-actions">
                  <button
                    className="btn fc-calc-btn fc-404-btn-home"
                    onClick={() => navigateTo("home")}
                  >
                    <i className="fa-solid fa-house me-2"></i>
                    Go Home
                  </button>
                  <button
                    className="btn fc-404-btn-calc"
                    onClick={() => navigateTo("basic")}
                  >
                    <i className="fa-solid fa-calculator me-2"></i>
                    Open Calculator
                  </button>
                </div>
                <div className="fc-404-links">
                  {[
                    { id: "interest", label: "Interest" },
                    { id: "loan",     label: "Loan" },
                    { id: "mortgage", label: "Mortgage" },
                    { id: "currency", label: "Currency" },
                    { id: "bmi",      label: "BMI" },
                  ].map(l => (
                    <button key={l.id} className="fc-404-pill" onClick={() => navigateTo(l.id)}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Floating Social Icons ──────────────────────────── */}
      <div className="fc-social-dock">
        {[
          { href: OFFICIAL_SOCIAL_X,        icon: "fa-x-twitter",   label: "Twitter/X", cl: "#000000" },
          { href: OFFICIAL_SOCIAL_INSTAGRAM, icon: "fa-instagram",   label: "Instagram", cl: "#E1306C" },
          { href: OFFICIAL_SOCIAL_YOUTUBE, icon: "fa-youtube",     label: "YouTube",   cl: "#FF0000" },
          { href: OFFICIAL_SOCIAL_TIKTOK,  icon: "fa-tiktok",      label: "TikTok",    cl: "#000000" },
          { href: OFFICIAL_SOCIAL_PINTEREST, icon: "fa-pinterest", label: "Pinterest", cl: "#E60023" },
          { href: OFFICIAL_SOCIAL_REDDIT,    icon: "fa-reddit",    label: "Reddit",    cl: "#FF4500" },
        ].map(s => (
          <a
            key={s.icon}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="fc-social-btn"
            aria-label={s.label}
            style={{ "--sc": s.cl } as React.CSSProperties}
          >
            <i className={`fa-brands ${s.icon}`}></i>
          </a>
        ))}
      </div>


      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="fc-footer text-white text-center py-4 mt-auto">
        <div className="container">
          <div className="d-flex justify-content-center flex-wrap gap-4 mb-3">
            {[
              { key: "home", label: t.home },
              { key: "blog", label: t.blog },
              { key: "about", label: t.about },
              { key: "contact", label: t.contact },
              { key: "privacy", label: t.privacy },
              { key: "terms", label: t.terms },
              { key: "disclaimer", label: t.disclaimer },
              { key: "editorial-policy", label: t.editorialPolicy },
            ].map(link => (
              <a
                key={link.key}
                href={buildPathname(lang, link.key)}
                onClick={e => { e.preventDefault(); navigateTo(link.key); }}
                className="text-secondary text-decoration-none fc-footer fc-footer-link"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-secondary mb-0 fc-footer-copy">
            © 2026 FinanceCalculator. All rights reserved. Calculations are estimates and should not replace professional financial advice.
          </p>
          <p className="text-secondary small mb-0 mt-2 fc-footer-copy">
            This site is supported by advertising. Ads are served by third parties and do not influence our content.
          </p>
        </div>
      </footer>
    </div>
  );
}

function LiveClock({ lang: _lang }: { lang: AppLang }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = "en-US";
  const timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hDeg = (h % 12) * 30 + m * 0.5;
  const mDeg = m * 6 + s * 0.1;
  const sDeg = s * 6;

  return (
    <div className="fc-clock-wrap">
      <div className="fc-clock-face" aria-hidden>
        <div className="fc-clock-marks">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="fc-clock-mark" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <div className="fc-clock-hand fc-clock-hour"   style={{ transform: `rotate(${hDeg}deg)` }} />
        <div className="fc-clock-hand fc-clock-minute" style={{ transform: `rotate(${mDeg}deg)` }} />
        <div className="fc-clock-hand fc-clock-second" style={{ transform: `rotate(${sDeg}deg)` }} />
        <div className="fc-clock-center" />
      </div>
      <div className="fc-clock-text">
        <span className="fc-clock-time">{timeStr}</span>
        <span className="fc-clock-date">{dateStr}</span>
      </div>
    </div>
  );
}
