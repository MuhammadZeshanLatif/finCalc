import { translations } from "../../data/translations";
import { getRichParagraphs } from "../../data/calcRichContent";
import { getSeoFaqs, getSeoHowTo } from "../../data/seoContent";
import type { AppLang } from "../../utils/routes";

type Gl = typeof translations.en;

export function CalculatorRichArticle({ id, lang }: { id: string; lang: AppLang }) {
  const gl = translations[lang] as Gl;
  const paras = getRichParagraphs(lang, id);
  const faqs = getSeoFaqs(lang, id);
  const howTo = getSeoHowTo(lang, id);

  return (
    <article className="fc-rich-article fc-page-box mt-4 mb-2">
      <header className="fc-rich-article__head border-bottom pb-3 mb-4">
        <h2 className="fc-rich-article__title h4 text-primary mb-2">{gl.richArticleTitle}</h2>
        <p className="small text-muted mb-0">
          <time dateTime="2026-04-01">{gl.richArticleReviewed}</time>
        </p>
      </header>

      <div className="fc-rich-article__body">
        {paras.map((p, i) => (
          <p key={i} className="fc-rich-article__p text-body-secondary lh-lg">
            {p}
          </p>
        ))}

        {howTo ? (
          <section className="fc-rich-article__section mt-4" aria-labelledby={`fc-rich-how-${id}`}>
            <h3 id={`fc-rich-how-${id}`} className="h5 text-dark mb-3">
              {gl.richSectionSteps}
            </h3>
            <p className="fw-semibold text-body mb-2">{howTo.name}</p>
            <p className="text-body-secondary mb-3 lh-lg">{howTo.description}</p>
            <ol className="fc-rich-article__ol ps-3 mb-0">
              {howTo.steps.map((s, i) => (
                <li key={i} className="mb-2 text-body-secondary lh-lg">
                  {s}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {faqs.length > 0 ? (
          <section className="fc-rich-article__section mt-4" aria-labelledby={`fc-rich-faq-${id}`}>
            <h3 id={`fc-rich-faq-${id}`} className="h5 text-dark mb-3">
              {gl.richSectionFaq}
            </h3>
            <dl className="fc-rich-article__faq mb-0">
              {faqs.map((f, i) => (
                <div key={i} className="mb-4">
                  <dt className="fw-semibold text-body mb-1">{f.q}</dt>
                  <dd className="text-body-secondary mb-0 ms-0 lh-lg">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section
          className="fc-rich-article__section mt-4 pt-3 fc-rich-article__limits border-top"
          aria-labelledby={`fc-rich-limits-${id}`}
        >
          <h3 id={`fc-rich-limits-${id}`} className="h5 text-dark mb-3">
            {gl.richSectionLimits}
          </h3>
          <p className="text-body-secondary mb-0 lh-lg">{gl.richLimitsBody}</p>
        </section>
      </div>
    </article>
  );
}
