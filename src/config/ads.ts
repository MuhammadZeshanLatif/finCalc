/** Adsterra JS Sync tags (standard — not anti-adblock). */
export const ADSTERRA_JS_SYNC = [
  "https://pl31495973.profitableratecpmnetwork.com/24/9e/cd/249ecded51f79d8b1b92035fe138686c.js",
  "https://pl31495982.profitableratecpmnetwork.com/98/21/6d/98216dd01a3996904601165b8fd066cb.js",
] as const;

export const ADSTERRA_NATIVE = {
  script: "https://pl31495974.profitableratecpmnetwork.com/4babbc6d225266f80b7f4bac61600d29/invoke.js",
  containerId: "container-4babbc6d225266f80b7f4bac61600d29",
} as const;

export const ADSTERRA_DIRECT_LINK = "https://www.profitableratecpmnetwork.com/nnu69fp8j5?key=5deb9143720a0a958fece3729763bab1";

export type AdBannerUnit = {
  key: string;
  width: number;
  height: number;
  invokeBase: string;
};

/** 728×90 leaderboard. */
export const ADSTERRA_LEADERBOARD: AdBannerUnit = {
  key: "957d170cf7fc37722d0efc817810b6a0",
  width: 728,
  height: 90,
  invokeBase: "https://www.highrevenueformat.com",
};

/** 468×60 banner — fits tablet / tighter widths. */
export const ADSTERRA_BANNER: AdBannerUnit = {
  key: "15b7e604d8fc0d309dbff2b6c1be56ee",
  width: 468,
  height: 60,
  invokeBase: "https://www.highrevenueformat.com",
};

export const ADSTERRA_MOBILE: AdBannerUnit = { key: "64a33de967b0f41e975baf45fafe5a28", width: 320, height: 50, invokeBase: "https://www.highrevenueformat.com" };
export const ADSTERRA_RECTANGLE: AdBannerUnit = { key: "b1261e01555a23bc2780540a5fa9069f", width: 300, height: 250, invokeBase: "https://www.highrevenueformat.com" };
export const ADSTERRA_SKYSCRAPER: AdBannerUnit = { key: "93a140b53635011d8c4306f49737f2e5", width: 160, height: 300, invokeBase: "https://www.highrevenueformat.com" };
export const ADSTERRA_TALL_SKYSCRAPER: AdBannerUnit = { key: "b3c422f1c8fffb193b5ba50c1b12bfe3", width: 160, height: 600, invokeBase: "https://www.highrevenueformat.com" };

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
