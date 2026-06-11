import fs from "fs";
import path from "path";

const dir = "src/data/blog";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
const re = /src:\s*["'](\/[^"']+)["']/g;
const found = new Set();

for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  let m;
  while ((m = re.exec(s))) {
    if (!m[1].startsWith("http")) found.add(m[1]);
  }
}

const missing = [];
for (const p of [...found].sort()) {
  const fp = path.join("public", p.slice(1).replace(/\//g, path.sep));
  if (!fs.existsSync(fp)) missing.push(p);
}

console.log("Missing:", missing.length);
missing.forEach((p) => console.log(p));
