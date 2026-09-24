import type { ReactNode } from "react";
import {
  CALC_LINK_LABELS,
  CONTEXTUAL_CALC_LINKS,
  CONTEXTUAL_INTRO,
} from "../../data/calcInternalLinks";
import { buildPathname, type AppLang } from "../../utils/routes";

function formatLinkList(items: string[], lang: AppLang): ReactNode {
  const labels = CALC_LINK_LABELS[lang];
  const link = (id: string) => (
    <a key={id} href={buildPathname(lang, id)} className="fc-internal-link">
      {labels[id] ?? id}
    </a>
  );

  if (items.length === 1) return link(items[0]!);
  if (items.length === 2) {
    return <>{link(items[0]!)} and {link(items[1]!)}</>;
  }

  const last = items[items.length - 1]!;
  const rest = items.slice(0, -1);
  return (
    <>
      {rest.map((id, i) => (
        <span key={id}>
          {link(id)}
          {i < rest.length - 1 ? ", " : ", and "}
        </span>
      ))}
      {link(last)}
    </>
  );
}

export function ContextualCalcLinks({ calcId, lang }: { calcId: string; lang: AppLang }) {
  const targets = CONTEXTUAL_CALC_LINKS[calcId];
  const intro = CONTEXTUAL_INTRO[lang][calcId];
  if (!targets?.length || !intro) return null;

  return (
    <p className="fc-rich-article__p text-body-secondary lh-lg fc-contextual-links">
      {intro} {formatLinkList([...targets], lang)}.
    </p>
  );
}
