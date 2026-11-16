import { renderArticle, readMinutes, unlinkDeadBlogLinks } from "../../lib/blogMarkdown";
import type { DbPost } from "../../lib/blogPosts";
import type { BlogArticle } from "../../data/blog/types";
import { buildPathname, type AppLang } from "../../utils/routes";

/**
 * Everything the article layout needs, already as display strings / HTML.
 * The prerender script renders this component once with placeholder strings to build
 * dist/blog-shell.html; public/blog-router.php swaps the placeholders for a live post,
 * so crawlers get the same markup React renders after it loads the post from Supabase.
 */
export type DbArticleView = {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  dateIso: string;
  dateLabel: string;
  readMin: string;
  calcHref: string;
  heroHtml: string;
  tocHtml: string;
  bodyHtml: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Keep in step with fc_view() in public/blog-router.php. */
export function dbArticleView(post: DbPost, isLiveSlug: (slug: string) => boolean): DbArticleView {
  const { html, toc } = renderArticle(post.content);
  const date = (post.publishedAt || post.updatedAt || "").slice(0, 10);
  return {
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    dateIso: date,
    dateLabel: date,
    readMin: String(readMinutes(post.content)),
    calcHref: post.calcLink ? `/${post.calcLink}` : "/",
    heroHtml: post.image
      ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" class="img-fluid rounded border w-100" width="1200" height="675" fetchpriority="high" decoding="async">`
      : "",
    tocHtml: toc.map(t => `<li class="mb-1"><a href="#${t.id}" class="text-decoration-none">${escapeHtml(t.label)}</a></li>`).join(""),
    bodyHtml: unlinkDeadBlogLinks(html, isLiveSlug),
  };
}

/** Placeholder view rendered into dist/blog-shell.html at build time. */
export const DB_ARTICLE_PLACEHOLDERS: DbArticleView = {
  title: "%%FC_TITLE%%",
  excerpt: "%%FC_EXCERPT%%",
  category: "%%FC_CATEGORY%%",
  author: "%%FC_AUTHOR%%",
  dateIso: "%%FC_DATE_ISO%%",
  dateLabel: "%%FC_DATE%%",
  readMin: "%%FC_READ_MIN%%",
  calcHref: "%%FC_CALC_HREF%%",
  heroHtml: "<!--FC_HERO-->",
  tocHtml: "<!--FC_TOC-->",
  bodyHtml: "<!--FC_BODY-->",
};

export function DatabaseArticlePage({
  view,
  lang,
  latest,
  labels,
  blogIndexPath,
  onNavigate,
  onSelectPost,
  onBackToBlog,
}: {
  view: DbArticleView;
  lang: AppLang;
  latest: BlogArticle[];
  labels: { toc: string; author: string; readTime: string; readTimeSuffix: string; tryCalculator: string; latest: string; backToBlog: string };
  blogIndexPath: string;
  onNavigate: (path: string) => void;
  onSelectPost: (slug: string) => void;
  onBackToBlog: () => void;
}) {
  return (
    <div className="fc-blog-article-page fc-page-box">
      <nav aria-label="Breadcrumb" className="fc-blog-breadcrumb mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <a href={buildPathname(lang, "home")} className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item">
            <a href={blogIndexPath} className="text-decoration-none" onClick={e => { e.preventDefault(); onBackToBlog(); }}>
              {labels.backToBlog}
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {view.title}
          </li>
        </ol>
      </nav>

      <header className="fc-blog-article-header border-bottom pb-4 mb-4">
        <span className="fc-blog-section-badge">{view.category}</span>
        <h1 className="h2 text-primary mb-3 fc-blog-article-title">{view.title}</h1>
        <p className="lead text-body-secondary mb-3">{view.excerpt}</p>
        <div className="d-flex flex-wrap gap-3 small text-muted align-items-center">
          <span>
            <i className="fa-regular fa-calendar-days me-1" aria-hidden />
            <time dateTime={view.dateIso}>{view.dateLabel}</time>
          </span>
          <span>
            <i className="fa-regular fa-user me-1" aria-hidden />
            {labels.author}: {view.author}
          </span>
          <span>
            <i className="fa-regular fa-clock me-1" aria-hidden />
            {labels.readTime}: {view.readMin} {labels.readTimeSuffix}
          </span>
        </div>
      </header>

      <div className="fc-journey-article-layout">
        <aside className="fc-journey-article-sidebar journey-sidebar">
          <div className="fc-blog-sidebar">
            <div className="card border fc-blog-sidebar-card mb-3">
              <div className="card-header py-2 small fw-bold">{labels.toc}</div>
              <div className="card-body py-2">
                <ol className="fc-blog-toc small mb-0 ps-3" dangerouslySetInnerHTML={{ __html: view.tocHtml }} />
              </div>
            </div>

            <div className="card border fc-blog-sidebar-card mb-3">
              <div className="card-header py-2 small fw-bold">{labels.latest}</div>
              <ul className="list-group list-group-flush small">
                {latest.map(p => (
                  <li key={p.slug} className="list-group-item px-3 py-2">
                    <a
                      href={buildPathname(lang, "blog", p.slug)}
                      className="text-decoration-none fc-blog-sidebar-link"
                      onClick={e => { e.preventDefault(); onSelectPost(p.slug); }}
                    >
                      {p.title}
                    </a>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>{p.datePublished}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="fc-journey-article-main">
          <figure className="fc-blog-hero mb-4" dangerouslySetInnerHTML={{ __html: view.heroHtml }} />

          <div
            className="fc-blog-body journey-content"
            dangerouslySetInnerHTML={{ __html: view.bodyHtml }}
            onClick={e => {
              // Same-site links inside the article navigate without a full reload.
              const a = (e.target as HTMLElement).closest("a");
              const href = a?.getAttribute("href") || "";
              if (a && href.startsWith("/") && !href.startsWith("//") && !a.target) {
                e.preventDefault();
                onNavigate(href);
              }
            }}
          />

          <div className="d-flex flex-wrap gap-2 mt-5 pt-3 border-top">
            <a
              href={view.calcHref}
              className="btn btn-primary"
              onClick={e => { e.preventDefault(); onNavigate(view.calcHref); }}
            >
              <i className="fa-solid fa-calculator me-2" aria-hidden />
              {labels.tryCalculator}
            </a>
            <a
              href={blogIndexPath}
              className="btn btn-outline-secondary"
              onClick={e => { e.preventDefault(); onBackToBlog(); }}
            >
              {labels.backToBlog}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
