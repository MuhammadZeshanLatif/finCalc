import { useEffect, useState } from "react";
import type { AppLang } from "../../utils/routes";
import { buildPathname } from "../../utils/routes";

const STORAGE_KEY = "fc-cookie-consent";

export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

type Props = {
  lang: AppLang;
  onAccept: () => void;
};

export function CookieConsent({ lang, onAccept }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasCookieConsent());
  }, []);

  if (!visible) return null;

  const privacyPath = buildPathname(lang, "privacy");

  return (
    <div className="fc-cookie-banner" role="dialog" aria-live="polite" aria-label={lang === "ru" ? "Cookie" : "Cookies"}>
      <div className="fc-cookie-banner__inner container">
        <p className="fc-cookie-banner__text mb-0">
          {lang === "ru" ? (
            <>
              Мы используем cookie и рекламные технологии (включая Google AdSense) для бесплатной работы сайта.{" "}
              <a href={privacyPath}>Политика конфиденциальности</a>.
            </>
          ) : (
            <>
              We use cookies and advertising technologies (including Google AdSense) to keep FinanceCalculator free.{" "}
              <a href={privacyPath}>Privacy Policy</a>.
            </>
          )}
        </p>
        <button
          type="button"
          className="fc-cookie-banner__btn"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignore */
            }
            setVisible(false);
            onAccept();
          }}
        >
          {lang === "ru" ? "Принять" : "Accept"}
        </button>
      </div>
    </div>
  );
}
