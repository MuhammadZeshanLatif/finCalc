import { useEffect, useId, useRef } from "react";
import { ADSTERRA_MOBILE, ADSTERRA_RECTANGLE, ADSTERRA_SKYSCRAPER, ADSTERRA_TALL_SKYSCRAPER, getAdUnit, type AdBannerUnit } from "../../config/ads";

let adLoadQueue: Promise<void> = Promise.resolve();

function queueAdLoad(run: () => Promise<void>): void {
  adLoadQueue = adLoadQueue.then(run).catch(() => undefined);
}

type InnerProps = {
  slot: string;
  unit: AdBannerUnit;
  layout: "spaced" | "tight";
  /** 468×60 companion — visible only when 728×90 is hidden (468px–727px). */
  narrowOnly?: boolean;
};

function AdBannerInner({ slot, unit, layout, narrowOnly }: InnerProps) {
  const reactId = useId();
  const containerId = `ad-${slot}-${reactId.replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const { key, width, height, invokeBase } = unit;

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

  const sizeClass = `fc-ad-banner--${width}${width === 160 ? ` fc-ad-banner--160x${height}` : ""}`;
  const layoutClass = layout === "tight" ? "fc-ad-banner--tight" : "fc-ad-banner--spaced";
  const narrowClass = narrowOnly ? " fc-ad-banner--narrow-only" : "";

  return (
    <div
      ref={rootRef}
      className={`fc-ad-banner ${sizeClass} ${layoutClass}${narrowClass}`}
      data-ad-slot={slot}
      aria-hidden="true"
    />
  );
}

type Props = {
  /** Unique id per placement on the page (for script sequencing). */
  slot: string;
  /** `spaced` = small vertical gap; `tight` = flush (e.g. footer). */
  layout?: "spaced" | "tight";
  /**
   * auto (default) = 728×90 on wide screens + 468×60 on tablet (468–727px).
   * leaderboard = 728×90 only. banner = 468×60 only.
   */
  size?: "auto" | "leaderboard" | "banner" | "mobile" | "rectangle" | "skyscraper" | "tall-skyscraper";
};

/** Reusable Adsterra iframe banner — config in `src/config/ads.ts`. */
export function AdBanner({ slot, layout = "spaced", size = "auto" }: Props) {
  if (size === "leaderboard") {
    return <AdBannerInner slot={slot} unit={getAdUnit("leaderboard")} layout={layout} />;
  }
  if (size === "banner") {
    return <AdBannerInner slot={slot} unit={getAdUnit("banner")} layout={layout} />;
  }
  if (size === "mobile") return <AdBannerInner slot={slot} unit={ADSTERRA_MOBILE} layout={layout} />;
  if (size === "rectangle") return <AdBannerInner slot={slot} unit={ADSTERRA_RECTANGLE} layout={layout} />;
  if (size === "skyscraper") return <AdBannerInner slot={slot} unit={ADSTERRA_SKYSCRAPER} layout={layout} />;
  if (size === "tall-skyscraper") return <AdBannerInner slot={slot} unit={ADSTERRA_TALL_SKYSCRAPER} layout={layout} />;

  return (
    <>
      <AdBannerInner slot={slot} unit={getAdUnit("leaderboard")} layout={layout} />
      <AdBannerInner
        slot={`${slot}-468`}
        unit={getAdUnit("banner")}
        layout={layout}
        narrowOnly
      />
      <div className="fc-ad-mobile-only"><AdBannerInner slot={`${slot}-320`} unit={ADSTERRA_MOBILE} layout={layout} /></div>
    </>
  );
}
