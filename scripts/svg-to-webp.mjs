/**
 * Converts all blog SVGs to WebP for <picture> sources (fallback stays SVG).
 * Run: npm run blog:webp
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogDir = path.join(root, "public", "blog");

const entries = await fs.readdir(blogDir);
const files = entries.filter((name) => name.toLowerCase().endsWith(".svg")).sort();

if (files.length === 0) {
  console.warn("No SVG files in public/blog");
  process.exit(0);
}

let failed = 0;
for (const name of files) {
  const input = path.join(blogDir, name);
  const output = path.join(blogDir, name.replace(/\.svg$/i, ".webp"));
  try {
    await sharp(input)
      .webp({ quality: 88, effort: 4 })
      .toFile(output);
    console.log("OK", path.relative(root, output));
  } catch (err) {
    failed++;
    console.error("FAIL", name, err.message);
  }
}
if (failed) process.exitCode = 1;

console.log(`Done: ${files.length} WebP files`);
