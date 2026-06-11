/**
 * Adds srcWebp after local /blog/*.svg src lines when missing.
 * Run: node scripts/add-blog-srcwebp.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDataDir = path.join(__dirname, "..", "src", "data", "blog");

const files = (await fs.readdir(blogDataDir))
  .filter((f) => f.endsWith(".ts"))
  .map((f) => path.join(blogDataDir, f));

const srcLine =
  /^(\s*)src: "(\/blog\/[^"]+\.svg)",\s*$/;

let total = 0;

for (const file of files) {
  const original = await fs.readFile(file, "utf8");
  const lines = original.split("\n");
  const out = [];
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(srcLine);
    if (m) {
      const indent = m[1];
      const svgPath = m[2];
      const webpPath = svgPath.replace(/\.svg$/i, ".webp");
      const next = lines[i + 1] ?? "";
      if (!next.includes("srcWebp:")) {
        out.push(line);
        out.push(`${indent}srcWebp: "${webpPath}",`);
        changed = true;
        total++;
        continue;
      }
    }
    out.push(line);
  }

  if (changed) {
    await fs.writeFile(file, out.join("\n"), "utf8");
    console.log("Updated", path.relative(path.join(__dirname, ".."), file));
  }
}

console.log(`Added ${total} srcWebp entries`);
