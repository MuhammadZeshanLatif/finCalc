import type { BlogBlock } from "../../data/blog/types";

export function BlogBlockRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="fc-blog-body">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} id={b.id} className="fc-blog-h2 h4 text-dark mt-5 mb-3 scroll-mt-5">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id} className="fc-blog-h3 h5 text-body mt-4 mb-2 scroll-mt-5">
                {b.text}
              </h3>
            );
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
                <img
                  src={b.src}
                  alt={b.alt}
                  className="img-fluid rounded border w-100"
                  loading="lazy"
                  decoding="async"
                  width={960}
                  height={540}
                />
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
          default:
            return null;
        }
      })}
    </div>
  );
}
