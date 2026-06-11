import { useEffect, useId, useRef } from "react";
import { ADSTERRA_LEADERBOARD } from "../../config/ads";

let adLoadQueue: Promise<void> = Promise.resolve();

function queueAdLoad(run: () => Promise<void>): void {
  adLoadQueue = adLoadQueue.then(run).catch(() => undefined);
}

type Props = {
  /** Unique id per placement on the page (for script sequencing). */
  slot: string;
  /** `spaced` = small vertical gap; `tight` = flush (e.g. footer). */
  layout?: "spaced" | "tight";
};

/**
 * Reusable Adsterra 728×90 iframe banner.
 * Config lives in `src/config/ads.ts` — use this component everywhere on the site.
 */
export function AdBanner({ slot, layout = "spaced" }: Props) {
  const reactId = useId();
  const containerId = `ad-${slot}-${reactId.replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const { key, width, height, invokeBase } = ADSTERRA_LEADERBOARD;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.adLoaded === "1") return;

    let cancelled = false;

    queueAdLoad(
      () =>
        new Promise(resolve => {
          if (cancelled || !rootRef.current) {
            resolve();
            return;
          }

          const host = rootRef.current;
          host.dataset.adLoaded = "1";
          host.innerHTML = "";

          const mount = document.createElement("div");
          mount.id = containerId;
          host.appendChild(mount);

          const options = document.createElement("script");
          options.text = `atOptions = {
  'key' : '${key}',
  'format' : 'iframe',
  'height' : ${height},
  'width' : ${width},
  'params' : {}
};`;

          const invoke = document.createElement("script");
          invoke.src = `${invokeBase}/${key}/invoke.js`;
          invoke.async = true;
          invoke.onload = () => resolve();
          invoke.onerror = () => resolve();

          mount.appendChild(options);
          mount.appendChild(invoke);
        }),
    );

    return () => {
      cancelled = true;
      if (rootRef.current) {
        rootRef.current.innerHTML = "";
        delete rootRef.current.dataset.adLoaded;
      }
    };
  }, [containerId, slot, key, width, height, invokeBase]);

  const layoutClass = layout === "tight" ? "fc-ad-banner--tight" : "fc-ad-banner--spaced";

  return (
    <div
      ref={rootRef}
      className={`fc-ad-banner ${layoutClass}`}
      data-ad-slot={slot}
      aria-hidden="true"
    />
  );
}
