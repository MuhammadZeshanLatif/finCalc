import {
  CALC_LINK_LABELS,
  getRelatedSectionTitle,
  RELATED_CALCULATORS,
} from "../../data/calcInternalLinks";
import { buildPathname, type AppLang } from "../../utils/routes";

export function RelatedCalculators({ calcId, lang }: { calcId: string; lang: AppLang }) {
  const targets = RELATED_CALCULATORS[calcId];
  if (!targets?.length) return null;

  const labels = CALC_LINK_LABELS[lang];

  return (
    <section
      className="fc-related-calculators fc-page-box mt-3 mb-2"
      aria-labelledby={`fc-related-${calcId}`}
    >
      <h2 id={`fc-related-${calcId}`} className="h5 text-primary mb-3">
        {getRelatedSectionTitle(lang, calcId)}
      </h2>
      <ul className="list-unstyled mb-0 d-flex flex-wrap gap-2">
        {targets.map(id => (
          <li key={id}>
            <a href={buildPathname(lang, id)} className="btn btn-outline-primary btn-sm fc-related-calculators__link">
              {labels[id] ?? id}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
