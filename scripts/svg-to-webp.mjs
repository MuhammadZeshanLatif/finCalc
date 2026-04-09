/**
 * Converts selected blog SVGs to WebP for <picture> sources (fallback stays SVG).
 * Run: node scripts/svg-to-webp.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogDir = path.join(root, "public", "blog");

const files = [
  "emergency-fund-hero-safety-jar.svg",
  "emergency-fund-three-buckets.svg",
  "emergency-fund-months-expenses.svg",
  "emergency-fund-deposit-growth.svg",
  "emi-prepay-hero-advisor-desk.svg",
  "emi-prepay-biweekly-calendar.svg",
  "emi-prepay-compare-cashflow-family.svg",
  "emi-prepay-principal-payment-phone.svg",
  "mortgage-buying-hero.svg",
  "mortgage-checklist.svg",
  "mortgage-closing-costs.svg",
  "mortgage-rate-compare.svg",
  "mortgage-credit-timing.svg",
  "mortgage-piti-vivid.svg",
  "compound-hero.svg",
  "compound-frequency.svg",
  "compound-timing.svg",
  "compound-application.svg",
  "tax-brackets-hero-staircase.svg",
  "tax-brackets-marginal-effective.svg",
  "tax-brackets-raise-myth.svg",
  "tax-brackets-fincalc-demo.svg",
  "currency-travel-hero-airport-board.svg",
  "currency-travel-dcc-terminal-choice.svg",
  "currency-travel-atm-fee-stack.svg",
];

for (const name of files) {
  const input = path.join(blogDir, name);
  const output = path.join(blogDir, name.replace(/\.svg$/i, ".webp"));
  await sharp(input)
    .webp({ quality: 88, effort: 4 })
    .toFile(output);
  console.log("OK", path.relative(root, output));
}
