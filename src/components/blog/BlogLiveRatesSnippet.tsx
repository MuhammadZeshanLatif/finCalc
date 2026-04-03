import { useEffect, useState } from "react";

type LatestJson = { date: string; rates: Record<string, number> };

export function BlogLiveRatesSnippet({ lang }: { lang: "en" | "ru" }) {
  const [data, setData] = useState<LatestJson | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let on = true;
    fetch("https://api.frankfurter.app/latest?from=USD")
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((j: LatestJson) => {
        if (on) setData(j);
      })
      .catch(() => {
        if (on) setErr(true);
      });
    return () => {
      on = false;
    };
  }, []);

  const pairs = ["EUR", "GBP", "RUB"] as const;
  const title =
    lang === "ru"
      ? "Справочные курсы (1 USD, ECB через Frankfurter)"
      : "Reference rates (1 USD, ECB via Frankfurter)";
  const asOf = lang === "ru" ? "Дата данных:" : "Rate date:";
  const fail =
    lang === "ru"
      ? "Не удалось загрузить курсы. Откройте конвертер на сайте."
      : "Could not load rates. Use the site currency converter.";

  if (err) {
    return (
      <aside className="fc-blog-live-rates fc-blog-live-rates--muted" aria-live="polite">
        <p className="small mb-0">{fail}</p>
      </aside>
    );
  }

  if (!data) {
    return (
      <aside className="fc-blog-live-rates" aria-busy="true">
        <div className="spinner-border spinner-border-sm text-primary" role="status" />
        <span className="small ms-2 text-muted">{lang === "ru" ? "Загрузка…" : "Loading…"}</span>
      </aside>
    );
  }

  return (
    <aside className="fc-blog-live-rates" aria-label={title}>
      <div className="fc-blog-live-rates__head small fw-semibold text-body">{title}</div>
      <p className="small text-muted mb-2">
        {asOf} <time dateTime={data.date}>{data.date}</time>
      </p>
      <dl className="fc-blog-live-rates__grid mb-0">
        {pairs.map(code => (
          <div key={code} className="fc-blog-live-rates__row">
            <dt className="small text-muted mb-0">USD → {code}</dt>
            <dd className="small fw-semibold mb-0 font-monospace">
              {data.rates[code] != null
                ? data.rates[code].toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
                    maximumFractionDigits: 4,
                  })
                : "—"}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
