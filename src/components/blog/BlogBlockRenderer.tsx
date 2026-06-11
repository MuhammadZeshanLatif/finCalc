import type { ReactNode } from "react";
import type { BlogBlock } from "../../data/blog/types";
import { AdBanner } from "../ads/AdBanner";
import { BlogPostImage } from "./BlogPostImage";

function renderBlock(b: BlogBlock, i: number, next?: BlogBlock): ReactNode {
  switch (b.t) {
    case "h2":
      return (
        <h2 key={i} id={b.id} className="fc-blog-h2 h4 text-dark mt-5 mb-3 scroll-mt-5">
          {b.text}
        </h2>
      );
    case "h3": {
      if (b.id.startsWith("faq-") && next?.t === "p") {
        return (
          <details key={i} id={b.id} className="fc-blog-faq-item mb-2">
            <summary className="fc-blog-faq-q">{b.text}</summary>
            <p className="fc-blog-faq-a text-body-secondary lh-lg mb-0">{next.text}</p>
          </details>
        );
      }
      return (
        <h3 key={i} id={b.id} className="fc-blog-h3 h5 text-body mt-4 mb-2 scroll-mt-5">
          {b.text}
        </h3>
      );
    }
    case "p":
      return (
        <p key={i} className="fc-blog-p text-body-secondary lh-lg">
          {b.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="fc-blog-ul">
          {b.items.map((item, j) => (
            <li key={j} className="mb-2 text-body-secondary lh-lg">
              {item}
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <figure key={i} className="fc-blog-table-wrap table-responsive my-4">
          {b.caption ? (
            <figcaption className="small text-muted mb-2">{b.caption}</figcaption>
          ) : null}
          <table className="table table-sm table-bordered align-middle fc-blog-table">
            <thead className="table-light">
              <tr>
                {b.head.map((h, j) => (
                  <th key={j} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    case "figure":
      return (
        <figure key={i} className="fc-blog-figure my-4">
          <BlogPostImage src={b.src} srcWebp={b.srcWebp} alt={b.alt} loading="lazy" />
          {b.caption ? <figcaption className="small text-muted mt-2">{b.caption}</figcaption> : null}
          {b.credit ? (
            <figcaption className="small text-muted mt-1">
              {b.creditUrl ? (
                <a href={b.creditUrl} rel="noopener noreferrer" target="_blank">
                  {b.credit}
                </a>
              ) : (
                b.credit
              )}
            </figcaption>
          ) : null}
        </figure>
      );
    case "callout":
      return (
        <div
          key={i}
          className={`alert my-4 fc-blog-callout ${
            b.variant === "disclaimer" ? "alert-secondary" : "alert-info text-dark"
          }`}
          role="note"
        >
          {b.title ? <div className="fw-semibold mb-1">{b.title}</div> : null}
          <div className="small mb-0 lh-lg">{b.text}</div>
        </div>
      );
    case "link": {
      const rel = b.internal
        ? undefined
        : [b.nofollow !== false ? "nofollow" : null, "noopener", "noreferrer"].filter(Boolean).join(" ");
      return (
        <p key={i} className="fc-blog-inline-link-wrap mb-3">
          <a
            href={b.href}
            className="fc-blog-inline-link"
            {...(rel ? { rel } : {})}
            {...(b.internal ? {} : { target: "_blank" })}
          >
            {b.label}
            {!b.internal ? <i className="fa-solid fa-arrow-up-right-from-square ms-1 small" aria-hidden /> : null}
          </a>
        </p>
      );
    }
    default:
      return null;
  }
}

type Props = {
  blocks: BlogBlock[];
  /** When set, inserts `<AdBanner />` between sections (e.g. `blog-my-slug`). */
  adSlotPrefix?: string;
};

export function BlogBlockRenderer({ blocks, adSlotPrefix }: Props) {
  let h2Count = 0;
  let blocksSinceAd = 0;

  const nodes: ReactNode[] = [];

  blocks.forEach((b, i) => {
    const next = blocks[i + 1];
    if (b.t === "h3" && b.id.startsWith("faq-") && next?.t === "p") {
      nodes.push(renderBlock(b, i, next));
      return;
    }
    if (i > 0 && blocks[i - 1].t === "h3" && blocks[i - 1].id.startsWith("faq-") && b.t === "p") {
      return;
    }

    nodes.push(renderBlock(b, i, next));

    if (!adSlotPrefix) return;

    if (b.t === "h2") {
      h2Count += 1;
      blocksSinceAd = 0;
      if (h2Count > 1) {
        nodes.push(<AdBanner key={`ad-h2-${i}`} slot={`${adSlotPrefix}-h2-${h2Count}`} />);
        nodes.push(
          <AdBanner
            key={`ad-h2-468-${i}`}
            slot={`${adSlotPrefix}-h2-${h2Count}-468`}
            size="banner"
          />,
        );
      }
      return;
    }

    if (b.t === "p" || b.t === "ul" || b.t === "table" || b.t === "figure") {
      blocksSinceAd += 1;
      if (blocksSinceAd >= 3) {
        nodes.push(<AdBanner key={`ad-mid-${i}`} slot={`${adSlotPrefix}-mid-${i}`} />);
        nodes.push(
          <AdBanner
            key={`ad-mid-468-${i}`}
            slot={`${adSlotPrefix}-mid-${i}-468`}
            size="banner"
          />,
        );
        blocksSinceAd = 0;
      }
    }
  });

  return <div className="fc-blog-body">{nodes}</div>;
}
