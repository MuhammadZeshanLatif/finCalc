import type { ReactNode } from "react";
import type { LegalDocument } from "../../data/legal/types";
import { buildPathname, type AppLang } from "../../utils/routes";

type Props = {
  doc: LegalDocument;
  lang: AppLang;
  /** Other policy pages linked at the bottom ("See also"). */
  related: { page: string; label: string }[];
  onNavigate: (page: string) => void;
};

/** Plain text with `[label](url)` links. External links open in a new tab. */
function withLinks(text: string, onNavigate: (page: string) => void): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const [, label, href] = match;
    if (href.startsWith("/")) {
      const page = href.slice(1) || "home";
      out.push(
        <a key={match.index} href={href} onClick={e => { e.preventDefault(); onNavigate(page); }}>
          {label}
        </a>,
      );
    } else {
      out.push(
        <a key={match.index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      );
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export function LegalPage({ doc, lang, related, onNavigate }: Props) {
  return (
    <div className="fc-page-box fc-legal-page">
      <header className="border-bottom pb-3 mb-4">
        <h1 className="h2 text-primary mb-2">{doc.title}</h1>
        <p className="small text-muted mb-0">
          Last updated: <time dateTime={doc.lastUpdatedIso}>{doc.lastUpdated}</time>
        </p>
      </header>

      <p className="text-body-secondary lh-lg">{withLinks(doc.intro, onNavigate)}</p>

      <nav className="fc-legal-toc small mb-4" aria-label="Sections">
        <ol className="mb-0 ps-3">
          {doc.sections.map(section => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-decoration-none">{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.sections.map(section => (
        <section key={section.id} id={section.id} className="fc-legal-section mt-4">
          <h2 className="h5 fw-bold text-dark mb-3">{section.title}</h2>
          {section.paragraphs.map((p, i) =>
            Array.isArray(p) ? (
              <ul key={i} className="text-body-secondary lh-lg">
                {p.map((item, j) => <li key={j}>{withLinks(item, onNavigate)}</li>)}
              </ul>
            ) : (
              <p key={i} className="text-body-secondary lh-lg">
                {withLinks(p, onNavigate)}
              </p>
            ),
          )}
        </section>
      ))}

      <p className="mt-5 pt-3 border-top small text-muted">
        See also:{" "}
        {related.map((r, i) => (
          <span key={r.page}>
            {i > 0 ? " · " : null}
            <a href={buildPathname(lang, r.page)} onClick={e => { e.preventDefault(); onNavigate(r.page); }}>
              {r.label}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}
