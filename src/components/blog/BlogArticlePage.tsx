import type { BlogArticle } from "../../data/blog/types";
import { tocFromBlocks } from "../../data/blog/types";
import { BlogBlockRenderer } from "./BlogBlockRenderer";
import { BlogLiveRatesSnippet } from "./BlogLiveRatesSnippet";
import { BlogPostImage } from "./BlogPostImage";
import type { AppLang } from "../../utils/routes";

type Glabels = {
  toc: string;
  keyPhrases: string;
  sources: string;
  updated: string;
  author: string;
  readTime: string;
  tryCalculator: string;
  related: string;
  latest: string;
  backToBlog: string;
  readTimeSuffix: string;
};

export function BlogArticlePage({
  post,
  lang,
  latest,
  related,
  labels,
  blogIndexPath,
  onOpenCalculator,
  onSelectPost,
  onBackToBlog,
}: {
  post: BlogArticle;
  lang: AppLang;
  latest: BlogArticle[];
  related: BlogArticle[];
  labels: Glabels;
  blogIndexPath: string;
  onOpenCalculator: (calcId: string) => void;
  onSelectPost: (slug: string) => void;
  onBackToBlog: () => void;
}) {
  const toc = tocFromBlocks(post.blocks);

  return (
    <div className="fc-blog-article-page fc-page-box">
      <nav aria-label="Breadcrumb" className="fc-blog-breadcrumb mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <a href={blogIndexPath} className="text-decoration-none" onClick={e => { e.preventDefault(); onBackToBlog(); }}>
              {labels.backToBlog}
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <header className="fc-blog-article-header border-bottom pb-4 mb-4">
        {post.articleSection ? (
          <span className="fc-blog-section-badge">{post.articleSection}</span>
        ) : null}
        <h1 className="h2 text-primary mb-3 fc-blog-article-title">{post.title}</h1>
        <p className="lead text-body-secondary mb-3">{post.excerpt}</p>
        <div className="d-flex flex-wrap gap-3 small text-muted align-items-center">
          <span>
            <i className="fa-regular fa-calendar-days me-1" aria-hidden />
            <time dateTime={post.datePublished}>{post.datePublished}</time>
            {post.dateModified !== post.datePublished ? (
              <>
                {" · "}
                {labels.updated}{" "}
                <time dateTime={post.dateModified}>{post.dateModified}</time>
              </>
            ) : null}
          </span>
          <span>
            <i className="fa-regular fa-user me-1" aria-hidden />
            {labels.author}: {post.author}
          </span>
          <span>
            <i className="fa-regular fa-clock me-1" aria-hidden />
            {labels.readTime}: {post.readingTimeMinutes} {labels.readTimeSuffix}
          </span>
        </div>
      </header>

      <div className="row g-4">
        <aside className="col-lg-4 order-lg-2">
          <div className="fc-blog-sidebar sticky-lg-top" style={{ top: "1rem" }}>
            <div className="card border fc-blog-sidebar-card mb-3">
              <div className="card-header py-2 small fw-bold">{labels.toc}</div>
              <div className="card-body py-2">
                <ol className="fc-blog-toc small mb-0 ps-3">
                  {toc.map(item => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? "fc-blog-toc__sub ms-2" : "mb-1"}
                    >
                      <a href={`#${item.id}`} className="text-decoration-none">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {post.keyPhrases.length > 0 ? (
              <div className="card border fc-blog-sidebar-card mb-3">
                <div className="card-header py-2 small fw-bold">{labels.keyPhrases}</div>
                <div className="card-body py-2">
                  <div className="fc-blog-tag-pills">
                    {post.keyPhrases.map((k, i) => (
                      <span key={i} className="fc-blog-tag-pill">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="card border fc-blog-sidebar-card mb-3">
              <div className="card-header py-2 small fw-bold">{labels.latest}</div>
              <ul className="list-group list-group-flush small">
                {latest.map(p => (
                  <li key={p.slug} className="list-group-item px-3 py-2">
                    <a
                      href="#"
                      className="text-decoration-none fc-blog-sidebar-link"
                      onClick={e => {
                        e.preventDefault();
                        onSelectPost(p.slug);
                      }}
                    >
                      {p.title}
                    </a>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {p.datePublished}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border fc-blog-sidebar-card">
              <div className="card-header py-2 small fw-bold">{labels.related}</div>
              <ul className="list-group list-group-flush small">
                {related.map(p => (
                  <li key={p.slug} className="list-group-item px-3 py-2">
                    <a
                      href="#"
                      className="text-decoration-none fc-blog-sidebar-link"
                      onClick={e => {
                        e.preventDefault();
                        onSelectPost(p.slug);
                      }}
                    >
                      {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="col-lg-8 order-lg-1">
          <figure className="fc-blog-hero mb-4">
            <BlogPostImage
              src={post.hero.src}
              srcWebp={post.hero.srcWebp}
              alt={post.hero.alt}
              loading="eager"
            />
            {post.hero.caption ? (
              <figcaption className="small text-muted mt-2">{post.hero.caption}</figcaption>
            ) : null}
            {post.hero.credit ? (
              <figcaption className="small text-muted mt-1">
                {post.hero.creditUrl ? (
                  <a href={post.hero.creditUrl} rel="noopener noreferrer" target="_blank">
                    {post.hero.credit}
                  </a>
                ) : (
                  post.hero.credit
                )}
              </figcaption>
            ) : null}
          </figure>

          {post.hasLiveRates ? (
            <div className="mb-4">
              <BlogLiveRatesSnippet lang={lang} />
            </div>
          ) : null}

          {post.video ? (
            <div className="mb-4">
              <div className="fc-blog-video rounded border overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${post.video.youtubeId}?rel=0`}
                  title={post.video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="small text-muted mt-2 mb-0">
                <a
                  href={`https://www.youtube.com/watch?v=${post.video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on YouTube
                </a>
                {" — if the player does not load (network block or browser extension)."}
              </p>
            </div>
          ) : null}

          <BlogBlockRenderer blocks={post.blocks} />

          {post.sources.length > 0 ? (
            <section className="fc-blog-sources mt-5 pt-4 border-top" aria-labelledby="fc-blog-sources-h">
              <h2 id="fc-blog-sources-h" className="h5 text-dark mb-3">
                {labels.sources}
              </h2>
              <ol className="small text-body-secondary">
                {post.sources.map((s, i) => (
                  <li key={i} className="mb-2">
                    <a href={s.url} rel="nofollow noopener noreferrer" target="_blank">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <div className="d-flex flex-wrap gap-2 mt-5 pt-3 border-top">
            <button type="button" className="btn btn-primary" onClick={() => onOpenCalculator(post.calcLink)}>
              <i className="fa-solid fa-calculator me-2" aria-hidden />
              {labels.tryCalculator}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onBackToBlog}>
              {labels.backToBlog}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
