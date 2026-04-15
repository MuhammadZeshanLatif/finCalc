import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { translations } from "./data/translations";
import {
  approxWordCount,
  getBlogPosts,
  getLatestPosts,
  getPostBySlug,
  getPostByTopic,
  getRelatedPosts,
  refreshSupabaseBlogPosts,
} from "./data/blog";
import type { BlogBlock } from "./data/blog/types";
import Calculators from "./components/Calculators";
import TI84CalculatorPage from "./components/TI84CalculatorPage";
import DesmosCalculatorPage from "./components/DesmosCalculatorPage";
import BlogAutomationPage from "./components/BlogAutomationPage";
import AdminLoginPage from "./components/AdminLoginPage";
import { CalculatorRichArticle } from "./components/calc/CalculatorRichArticle";
import { BlogArticlePage } from "./components/blog/BlogArticlePage";
import { isAbsoluteHttpUrl } from "./components/blog/BlogPostImage";
import {
  getSiteUrl,
  OFFICIAL_SOCIAL_INSTAGRAM,
  OFFICIAL_SOCIAL_PINTEREST,
  OFFICIAL_SOCIAL_REDDIT,
  OFFICIAL_SOCIAL_TIKTOK,
  OFFICIAL_SOCIAL_X,
  OFFICIAL_SOCIAL_YOUTUBE,
  SITE_LOGO_URL,
  SITE_PREVIEW_IMAGE_PATH,
} from "./config/site";
import { buildPathname, normalizePage, parsePathname, type AppLang } from "./utils/routes";
import { updatePageSeo, type BlogSeoPayload } from "./utils/seo";

const META_DEFAULT: Record<string, string> = {
  en: "Free financial calculators: compound interest, loans, mortgage, EMI, VAT, tax, currency, BMI, and more. Live results in your browser — no sign-up, English & Russian.",
  ru: "Бесплатные финансовые калькуляторы: проценты, кредит, ипотека, EMI, НДС, налог, валюта, ИМТ. Считает в браузере, без регистрации.",
};

let fcRouteSeed: { lang: AppLang; page: string; blogSlug: string | null } | null = null;
function seedRoute(): { lang: AppLang; page: string; blogSlug: string | null } {
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
  autoloan:  { icon: "fa-car" },
  loanearly: { icon: "fa-calendar-check" },
};

function extractFaqPairs(blocks: BlogBlock[]): { q: string; a: string }[] {
  const pairs: { q: string; a: string }[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const cur = blocks[i];
    const next = blocks[i + 1];
    if (cur.t !== "h3" || next.t !== "p") continue;
    if (!cur.id.startsWith("faq-")) continue;
    pairs.push({ q: cur.text, a: next.text });
  }
  return pairs;
}

export default function App() {
  const [lang, setLang] = useState<AppLang>(() => seedRoute().lang);
  const [currentPage, setCurrentPage] = useState(() => seedRoute().page);
  const [blogSlug, setBlogSlug] = useState<string | null>(() => seedRoute().blogSlug);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [blogPage, setBlogPage] = useState<number>(1);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [blogSyncTick, setBlogSyncTick] = useState(0);
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

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        const [changedEn, changedRu] = await Promise.all([
          refreshSupabaseBlogPosts("en"),
          refreshSupabaseBlogPosts("ru"),
        ]);
        if (mounted && (changedEn || changedRu)) {
          setBlogSyncTick(x => x + 1);
        }
      } finally {
        // no-op
      }
    };
    const onUpdated = () => {
      void sync();
    };
    window.addEventListener("fc-blog-updated", onUpdated);
    void sync();
    return () => {
      mounted = false;
      window.removeEventListener("fc-blog-updated", onUpdated);
    };
  }, []);

  const changeLang = (newLang: AppLang) => {
    if (currentPage === "blog" && blogSlug) {
      const cur = getPostBySlug(lang, blogSlug);
      const nxt = cur ? getPostByTopic(newLang, cur.topicKey) : undefined;
      if (nxt) {
        setLang(newLang);
        setBlogSlug(nxt.slug);
        window.history.pushState({}, "", buildPathname(newLang, "blog", nxt.slug));
        return;
      }
      setLang(newLang);
      setBlogSlug(null);
      window.history.pushState({}, "", buildPathname(newLang, "blog", null));
      return;
    }
    setLang(newLang);
    window.history.pushState({}, "", buildPathname(newLang, currentPage, null));
  };

  const navigateTo = (page: string, opts?: { blogSlug?: string | null }) => {
    const p = normalizePage(page);
    const slug = p === "blog" && opts?.blogSlug ? opts.blogSlug : null;
    setCurrentPage(p);
    setBlogSlug(slug);
    window.history.pushState({}, "", buildPathname(lang, p, slug));
    window.scrollTo(0, 0);
  };

  const t = translations[lang];

  const calculatorList = Object.keys(t.calculators).map(key => ({
    id: key,
    title: (t.calculators as any)[key].title,
    desc: (t.calculators as any)[key].desc,
  }));

  const filteredCalculators = calculatorList.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBlogPosts = useMemo(() => getBlogPosts(lang), [lang, blogSyncTick]);
  const activeBlogPost = blogSlug ? getPostBySlug(lang, blogSlug) : undefined;
  const indexOfLastPost = blogPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const paginatedPosts = currentBlogPosts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    const tr = translations[lang];
    // Per-page SEO lookup — covers all calculator pages, static pages, and TI-84
    const ps = (tr.pageSeo as Record<string, { title: string; desc: string; keywords?: string } | undefined>);
    let title: string = tr.siteTitle;
    let description: string = META_DEFAULT[lang];
    let calculatorKeywords: string | undefined;
    let blogArticle: BlogSeoPayload | undefined;

    if (currentPage === "home") {
      title       = tr.homeSeoHeadline;
      description = tr.homeSeoDescription;
      calculatorKeywords = tr.homeSeoCalculatorKeywords;
    } else if (currentPage === "blog" && blogSlug) {
      // ── Blog article ──────────────────────────────────────────────────────
      const post = getPostBySlug(lang, blogSlug);
      if (!post) {
        title       = lang === "ru" ? "Страница не найдена" : "Page not found";
        description = lang === "ru"
          ? "Такой статьи нет. Вернитесь к списку статей."
          : "This blog post does not exist. Return to the article list.";
      } else {
        title       = post.metaTitle;
        description = post.metaDescription;
        const enP   = getPostByTopic("en", post.topicKey);
        const ruP   = getPostByTopic("ru", post.topicKey);
        const enSlug = enP?.slug ?? post.slug;
        const heroForSocial = post.hero.srcWebp ?? post.hero.src;
        const faqPairs = extractFaqPairs(post.blocks);
        const siteBase = getSiteUrl();
        const toAbsAsset = (u: string) =>
          /^https?:\/\//i.test(u) ? u : `${siteBase}${u.startsWith("/") ? "" : "/"}${u}`;
        const heroImageAbs = toAbsAsset(heroForSocial);
        const articleImageGallery = post.blocks
          .filter((b): b is Extract<BlogBlock, { t: "figure" }> => b.t === "figure")
          .map(b => ({ url: toAbsAsset(b.src), caption: b.alt }));
        blogArticle = {
          canonicalPath:    buildPathname(lang, "blog", post.slug),
          alternateEnPath:  buildPathname("en", "blog", enSlug),
          alternateRuPath:  ruP ? buildPathname("ru", "blog", ruP.slug) : buildPathname("ru", "blog", null),
          headline:         post.title,
          description:      post.metaDescription,
          keywords:         post.keywords,
          datePublished:    post.datePublished,
          dateModified:     post.dateModified,
          authorName:       post.author,
          imageUrl:         heroImageAbs,
          imageAlt:         post.hero.alt,
          articleImageGallery,
          blogListLabel:    t.blog,
          wordCountApprox:  approxWordCount(post),
          videoYoutubeId:   post.video?.youtubeId,
          videoTitle:       post.video?.title,
          articleSection:   post.articleSection,
          faqs:             faqPairs,
        };
      }
    } else if (ps[currentPage]) {
      // ── All other pages: use per-page SEO from translations ───────────────
      title       = ps[currentPage]!.title;
      description = ps[currentPage]!.desc;
      calculatorKeywords = ps[currentPage]!.keywords;
    } else {
      // Fallback for unknown pages
      title       = tr.siteTitle;
      description = META_DEFAULT[lang];
    }

    updatePageSeo({
      lang,
      page: currentPage,
      title,
      description,
      calculatorKeywords,
      breadcrumbHomeLabel: t.home,
      ...(blogArticle ? { blogArticle } : {}),
    });
  }, [lang, currentPage, blogSlug]);

  return (
    <div className="fc-app-shell">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="navbar navbar-expand-lg navbar-dark fc-navbar">
        <div className="container position-relative">
          <a
            href="#main-content"
            className="visually-hidden-focusable position-absolute top-0 start-0 bg-white text-primary px-3 py-2 m-2 rounded shadow-sm z-3 small"
          >
            {lang === "ru" ? "Перейти к содержимому" : "Skip to main content"}
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
            aria-label={lang === "ru" ? "Меню" : "Menu"}
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
            <div className="d-flex align-items-center gap-2 ms-lg-0">
              <button
                className={`btn fc-lang-btn ${lang === "en" ? "btn-warning text-dark" : "btn-outline-secondary text-white"}`}
                onClick={() => changeLang("en")}
              >
                EN
              </button>
              <button
                className={`btn fc-lang-btn ${lang === "ru" ? "btn-warning text-dark" : "btn-outline-secondary text-white"}`}
                onClick={() => changeLang("ru")}
              >
                РУ
              </button>
            </div>
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
                      { icon: "fa-language", label: t.homeTrustLang },
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
                        <i className="fa-solid fa-calculator"></i> {lang === "ru" ? "Калькулятор" : "Basic Calculator"}
                      </div>
                      <h3 className="fc-home-promo-title">
                        {lang === "ru" ? "Полноэкранный научный калькулятор" : "Full scientific calculator"}
                      </h3>
                      <p className="fc-home-promo-text">
                        {lang === "ru"
                          ? "Степени, корни, факториал, тригонометрия, память и история — откройте вкладку «Базовый калькулятор» в боковом меню."
                          : "Powers, roots, factorial, trig, memory, and history — open the Basic Calculator tab in the sidebar."}
                      </p>
                      <button
                        type="button"
                        className="btn fc-calc-btn"
                        onClick={() => navigateTo("basic")}
                      >
                        <i className="fa-solid fa-calculator"></i>{" "}
                        {lang === "ru" ? "Открыть калькулятор" : "Open Basic Calculator"}
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
                            <button
                              onClick={() => navigateTo(c.id)}
                              className="btn fc-card-btn"
                            >
                              {t.readMore}
                              <i className="fa-solid fa-arrow-right"></i>
                            </button>
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
                <TI84CalculatorPage />
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
                <DesmosCalculatorPage lang={lang} onNavigate={navigateTo} />
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

            {currentPage === "blog" && blogSlug && !activeBlogPost && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary border-bottom pb-3 mb-4">
                  {lang === "ru" ? "Страница не найдена" : "Page not found"}
                </h1>
                <p className="text-muted">{lang === "ru" ? "Такой статьи нет." : "This blog post does not exist."}</p>
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
                  {lang === "ru"
                    ? "Статьи с оглавлением, источниками и разметкой для поиска. Открывайте полный текст — калькулятор связаны внутри материала."
                    : "Long-form guides with a table of contents, citations, and calculator deep-links. Open an article for the full layout."}
                </p>
                <div className="row g-4">
                  {paginatedPosts.map(post => {
                    const thumbSrc = post.hero.srcWebp ?? post.hero.src;
                    const thumbExternal = isAbsoluteHttpUrl(thumbSrc);
                    return (
                    <div className="col-md-6" key={post.slug}>
                      <article className="fc-blog-card card border-0 h-100 overflow-hidden">
                        <a
                          href="#"
                          className="fc-blog-card-thumb-link"
                          aria-label={`${t.blogReadArticle}: ${post.title}`}
                          onClick={e => {
                            e.preventDefault();
                            navigateTo("blog", { blogSlug: post.slug });
                          }}
                        >
                          <img
                            src={thumbSrc}
                            alt=""
                            className="card-img-top fc-blog-card-thumb"
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            {...(thumbExternal ? {} : { referrerPolicy: "no-referrer" })}
                            onError={e => {
                              const img = e.currentTarget;
                              img.onerror = null;
                              img.src = SITE_PREVIEW_IMAGE_PATH;
                            }}
                          />
                        </a>
                        <div className="card-body d-flex flex-column p-4">
                          <div className="fc-blog-date">
                            <i className="fa-regular fa-calendar-days" aria-hidden></i>{" "}
                            <time dateTime={post.datePublished}>{post.datePublished}</time>
                          </div>
                          <h2 className="fc-blog-title h5 mb-2">{post.title}</h2>
                          <p className="fc-blog-desc flex-grow-1 mb-3">{post.excerpt}</p>
                          <div className="d-flex flex-wrap gap-2 mt-auto">
                            <button
                              type="button"
                              onClick={() => navigateTo("blog", { blogSlug: post.slug })}
                              className="btn btn-primary btn-sm"
                            >
                              <i className="fa-solid fa-book-open me-1" aria-hidden></i>
                              {t.blogReadArticle}
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateTo(post.calcLink)}
                              className="btn fc-blog-btn btn-sm"
                            >
                              <i className="fa-solid fa-calculator me-1" aria-hidden></i>
                              {t.blogTryCalculator}
                            </button>
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
              </div>
            )}

            {currentPage === "blogstudio" && (
              <BlogAutomationPage
                lang={lang}
                onOpenGeneratedPost={slug => navigateTo("blog", { blogSlug: slug })}
                onGoLogin={() => navigateTo("login")}
              />
            )}
            {currentPage === "login" && (
              <AdminLoginPage
                lang={lang}
                onSuccess={() => navigateTo("blogstudio")}
              />
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
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center gap-3 rounded-3">
                    <i className="fa-solid fa-circle-check fs-4"></i>
                    <div className="fw-medium">{t.successMsg}</div>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); setContactSubmitted(true); }}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold fc-form-label-sm">{t.name}</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold fc-form-label-sm">{t.email}</label>
                      <input type="email" className="form-control" required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold fc-form-label-sm">{t.message}</label>
                      <textarea className="form-control" rows={4} required></textarea>
                    </div>
                    <button type="submit" className="fc-submit-btn">
                      <i className="fa-solid fa-paper-plane me-2"></i> {t.sendMessage}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── Privacy Policy ──────────────────────── */}
            {currentPage === "privacy" && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary border-bottom pb-3 mb-4">Privacy Policy</h1>
                <p>At FinanceCalculator, accessible from financcalculator.ru, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by FinanceCalculator and how we use it.</p>
                <h5 className="mt-4 fw-bold">Log Files</h5>
                <p className="text-muted">FinanceCalculator follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
                <h5 className="mt-4 fw-bold">Google DoubleClick DART Cookie</h5>
                <p className="text-muted">Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.</p>
                <h5 className="mt-4 fw-bold">Consent</h5>
                <p className="text-muted">By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
              </div>
            )}

            {/* ── Terms & Conditions ──────────────────── */}
            {currentPage === "terms" && (
              <div className="fc-page-box">
                <h1 className="h2 text-primary border-bottom pb-3 mb-4">Terms and Conditions</h1>
                <p>Welcome to FinanceCalculator! These terms and conditions outline the rules and regulations for the use of FinanceCalculator's Website, located at financcalculator.ru.</p>
                <p className="text-muted">By accessing this website we assume you accept these terms and conditions. Do not continue to use FinanceCalculator if you do not agree to take all of the terms and conditions stated on this page.</p>
                <h5 className="mt-4 fw-bold">Cookies</h5>
                <p className="text-muted">We employ the use of cookies. By accessing FinanceCalculator, you agreed to use cookies in agreement with the FinanceCalculator's Privacy Policy.</p>
                <h5 className="mt-4 fw-bold">Disclaimer</h5>
                <p className="text-muted">To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury resulting from negligence.</p>
              </div>
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
                  {lang === "ru" ? "Страница не найдена" : "Page Not Found"}
                </h1>
                <p className="fc-404-desc">
                  {lang === "ru"
                    ? "Похоже, эта страница не существует или была перемещена."
                    : "Looks like this page doesn't exist or has been moved."}
                </p>
                <div className="fc-404-actions">
                  <button
                    className="btn fc-calc-btn fc-404-btn-home"
                    onClick={() => navigateTo("home")}
                  >
                    <i className="fa-solid fa-house me-2"></i>
                    {lang === "ru" ? "На главную" : "Go Home"}
                  </button>
                  <button
                    className="btn fc-404-btn-calc"
                    onClick={() => navigateTo("basic")}
                  >
                    <i className="fa-solid fa-calculator me-2"></i>
                    {lang === "ru" ? "Открыть калькулятор" : "Open Calculator"}
                  </button>
                </div>
                <div className="fc-404-links">
                  {[
                    { id: "interest", label: lang === "ru" ? "Проценты" : "Interest" },
                    { id: "loan",     label: lang === "ru" ? "Кредит"   : "Loan" },
                    { id: "mortgage", label: lang === "ru" ? "Ипотека"  : "Mortgage" },
                    { id: "currency", label: lang === "ru" ? "Валюта"   : "Currency" },
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
          { href: "https://facebook.com",  icon: "fa-facebook-f",  label: "Facebook",  cl: "#1877F2" },
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
        </div>
      </footer>
    </div>
  );
}

function LiveClock({ lang }: { lang: "en" | "ru" }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = lang === "ru" ? "ru-RU" : "en-US";
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
