/** Adsterra JS Sync tags (standard — not anti-adblock). */
export const ADSTERRA_JS_SYNC = [
  "https://pl29707542.effectivecpmnetwork.com/25/97/f4/2597f4b1bc437c653d8b6493f86d4773.js"
] as const;

export type AdBannerUnit = {
  key: string;
  width: number;
  height: number;
  invokeBase: string;
};

/** 728×90 leaderboard. */
export const ADSTERRA_LEADERBOARD: AdBannerUnit = {
  key: "3a0150b3e74a45ed53249e34ebd8e0d8",
  width: 728,
  height: 90,
  invokeBase: "https://www.highperformanceformat.com",
};

/** 468×60 banner — fits tablet / tighter widths. */
export const ADSTERRA_BANNER: AdBannerUnit = {
  key: "ac54bf5fea47560258699d3451b02c7b",
  width: 468,
  height: 60,
  invokeBase: "https://www.highperformanceformat.com",
};

export type AdBannerSize = "auto" | "leaderboard" | "banner";

export function getAdUnit(size: "leaderboard" | "banner"): AdBannerUnit {
  return size === "banner" ? ADSTERRA_BANNER : ADSTERRA_LEADERBOARD;
}

const loaded = new Set<string>();

/** Load each sync URL at most once per full page session. */
export function loadAdsterraSync(url: string): void {
  if (loaded.has(url)) return;
  loaded.add(url);

  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  document.body.appendChild(script);
}
