import type { LegalDocument } from "../../data/legal/types";
import { buildPathname, type AppLang } from "../../utils/routes";

type Props = {
  doc: LegalDocument;
  lang: AppLang;
  otherPage: "privacy" | "terms";
  otherLabel: string;
};

export function LegalPage({ doc, lang, otherPage, otherLabel }: Props) {
  return (
    <div className="fc-page-box fc-legal-page">
      <header className="border-bottom pb-3 mb-4">
        <h1 className="h2 text-primary mb-2">{doc.title}</h1>
        <p className="small text-muted mb-0">
          Last updated:{" "}
          <time dateTime="2026-06-11">{doc.lastUpdated}</time>
        </p>
      </header>

      <p className="text-body-secondary lh-lg">{doc.intro}</p>

      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} className="fc-legal-section mt-4">
          <h2 className="h5 fw-bold text-dark mb-3">{section.title}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="text-body-secondary lh-lg">
              {p}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-5 pt-3 border-top small text-muted">
        See also:{" "}
        <a href={buildPathname(lang, otherPage)}>{otherLabel}</a>
      </p>
    </div>
  );
}
