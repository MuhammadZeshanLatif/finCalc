/**
 * Verify sitemap URLs return HTTP 200 after deploy.
 *
 * Env:
 *   VERIFY_BASE_URL — optional, defaults to https://financcalculator.ru
 *   VERIFY_SITEMAP  — optional, defaults to public/sitemap.xml
 *   VERIFY_CONCURRENCY — optional, default 8
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const BASE_URL = (process.env.VERIFY_BASE_URL || "https://financcalculator.ru").replace(
  /\/$/,
  "",
);
const SITEMAP_PATH = path.resolve(
  root,
  process.env.VERIFY_SITEMAP || "public/sitemap.xml",
);
const CONCURRENCY = Math.max(1, Number(process.env.VERIFY_CONCURRENCY || "8"));

const EXTRA_PATHS = [
  "/ads.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/googlec5fff066ca020e7a.html",
];

if (!existsSync(SITEMAP_PATH)) {
  console.error(`Sitemap not found: ${SITEMAP_PATH}`);
  process.exit(1);
}

const xml = readFileSync(SITEMAP_PATH, "utf8");
const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
const extraUrls = EXTRA_PATHS.map((p) => `${BASE_URL}${p}`);
const urls = [...new Set([...fromSitemap, ...extraUrls])];

console.log(`Checking ${urls.length} URLs (concurrency ${CONCURRENCY})...`);

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "FinanceCalculator-Deploy-Verify/1.0" },
    });
    return { url, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, worker, limit) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => next()));
  return results;
}

const results = await runPool(urls, checkUrl, CONCURRENCY);
const failed = results.filter((r) => !r.ok);

for (const r of results) {
  if (r.ok) console.log(`OK ${r.status} ${r.url}`);
}

for (const r of failed) {
  console.error(`FAIL ${r.status || "ERR"} ${r.url}${r.error ? ` (${r.error})` : ""}`);
}

if (failed.length) {
  console.error(`\n${failed.length}/${urls.length} URLs failed`);
  process.exit(1);
}

console.log(`\nAll ${urls.length} URLs returned 200`);
