// Markdown → HTML for database blog posts.
// Keep in step with public/blog-lib.php (render_body): that is the HTML crawlers see first.
// Output uses the same classes as BlogBlockRenderer so database posts look like built-in guides.

import { getSiteUrl } from "../config/site";

export const HTML_CONTENT_MARKER = "<!--fc-html-->";
export const SITE_ORIGIN = getSiteUrl();

export type TocEntry = { id: string; label: string };
export type FaqEntry = { question: string; answer: string };

export const isHtmlContent = (value = "") => value.trimStart().startsWith(HTML_CONTENT_MARKER);
export const stripHtmlMarker = (value = "") => value.replace(HTML_CONTENT_MARKER, "").replace(/^\n/, "");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const headingId = (text: string) =>
  String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "section";

function safeHref(url: string): string {
  if (url.startsWith("//")) return "";
  if (url.startsWith("/") || url.startsWith("#")) return url;
  return /^(https?:|mailto:|tel:)/i.test(url) ? url : "";
}

const emphasis = (html: string) =>
  html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>");

// Links, bold and italic on already-escaped text. External links get nofollow, like built-in guides.
function inline(text: string): string {
  let out = "";
  let cursor = 0;
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(text))) {
    out += emphasis(escapeHtml(text.slice(cursor, match.index)));
    const href = safeHref(match[2]);
    const label = emphasis(escapeHtml(match[1]));
    if (href) {
      const external = /^https?:/i.test(href) && !href.startsWith(SITE_ORIGIN);
      out += `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="nofollow noopener noreferrer"' : ""}>${label}</a>`;
    } else {
      out += label;
    }
    cursor = match.index + match[0].length;
  }
  return out + emphasis(escapeHtml(text.slice(cursor)));
}

const isTable = (lines: string[]) =>
  lines.length >= 2 &&
  lines.every(line => /^\|.*\|$/.test(line.trim())) &&
  /^(\|\s*:?-{3,}:?\s*)+\|$/.test(lines[1].trim());

const cells = (line: string) => line.trim().slice(1, -1).split("|").map(cell => cell.trim());

export function renderArticle(content = ""): { html: string; toc: TocEntry[]; faqs: FaqEntry[] } {
  if (isHtmlContent(content)) {
    const html = stripHtmlMarker(content).replace(/<script\b[\s\S]*?<\/script>/gi, "");
    const toc = [...html.matchAll(/<h2[^>]*?(?:id="([^"]+)")?[^>]*>([\s\S]*?)<\/h2>/gi)].map(([, id, label]) => ({
      id: id || headingId(label),
      label: label.replace(/<[^>]+>/g, "").trim(),
    }));
    return { html, toc, faqs: [] };
  }

  const source = content.replace(/\r\n/g, "\n").replace(/^(#{2,3}\s+[^\n]+)\n(?!\n)/gm, "$1\n\n");
  const blocks = source.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
  const toc: TocEntry[] = [];
  const faqs: FaqEntry[] = [];
  const usedIds = new Set<string>();
  const uniqueId = (text: string) => {
    let id = headingId(text);
    for (let n = 2; usedIds.has(id); n++) id = `${headingId(text)}-${n}`;
    usedIds.add(id);
    return id;
  };
  let inFaq = false;
  let html = "";

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const heading = block.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 2) inFaq = /frequently asked questions|\bfaqs?\b/i.test(text);
      const next = blocks[i + 1];
      if (inFaq && level === 3 && next && !/^#{2,3}\s/.test(next)) {
        faqs.push({ question: text, answer: next.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*?/g, "") });
        html += `<details class="fc-blog-faq-item mb-2" id="${uniqueId(`faq-${text}`)}"><summary class="fc-blog-faq-q">${inline(text)}</summary><p class="fc-blog-faq-a text-body-secondary lh-lg mb-0">${inline(next).replace(/\n/g, "<br>")}</p></details>`;
        i++;
        continue;
      }
      const id = uniqueId(text);
      if (level === 2) toc.push({ id, label: text });
      html += level === 2
        ? `<h2 id="${id}" class="fc-blog-h2 h4 text-dark mt-5 mb-3 scroll-mt-5">${inline(text)}</h2>`
        : `<h3 id="${id}" class="fc-blog-h3 h5 text-body mt-4 mb-2 scroll-mt-5">${inline(text)}</h3>`;
      continue;
    }

    const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (image) {
      const src = safeHref(image[2]);
      if (src) {
        html += `<figure class="fc-blog-figure my-4"><img src="${escapeHtml(src)}" alt="${escapeHtml(image[1])}" class="img-fluid rounded-3 w-100" width="1200" height="675" loading="lazy" decoding="async">${image[1] ? `<figcaption class="small text-muted mt-2">${escapeHtml(image[1])}</figcaption>` : ""}</figure>`;
      }
      continue;
    }

    const lines = block.split("\n");
    if (isTable(lines)) {
      const [head, , ...rows] = lines;
      html +=
        '<figure class="fc-blog-table-wrap table-responsive my-4"><table class="table table-sm table-bordered align-middle fc-blog-table"><thead class="table-light"><tr>' +
        cells(head).map(cell => `<th scope="col">${inline(cell)}</th>`).join("") +
        "</tr></thead><tbody>" +
        rows.map(row => `<tr>${cells(row).map(cell => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("") +
        "</tbody></table></figure>";
      continue;
    }
    if (lines.every(line => /^[-*]\s+/.test(line))) {
      html += `<ul class="fc-blog-ul">${lines.map(line => `<li class="mb-2 text-body-secondary lh-lg">${inline(line.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      continue;
    }
    if (lines.every(line => /^\d+[.)]\s+/.test(line))) {
      html += `<ol class="fc-blog-ul">${lines.map(line => `<li class="mb-2 text-body-secondary lh-lg">${inline(line.replace(/^\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`;
      continue;
    }
    if (lines.every(line => line.startsWith(">"))) {
      html += `<div class="alert my-4 fc-blog-callout alert-info text-dark" role="note"><div class="small mb-0 lh-lg">${inline(lines.map(line => line.replace(/^>\s?/, "")).join(" "))}</div></div>`;
      continue;
    }
    html += `<p class="fc-blog-p text-body-secondary lh-lg">${lines.map(inline).join("<br>")}</p>`;
  }

  return { html, toc, faqs };
}

// Links to /blog/<slug> posts that are not live yet (drafts, scheduled, deleted) become plain text,
// so articles can link to each other before publication. Keep in step with unlink_dead_blog_links()
// in public/blog-lib.php.
export function unlinkDeadBlogLinks(html: string, isLiveSlug: (slug: string) => boolean): string {
  return html.replace(
    /<a href="(?:https:\/\/financcalculators\.com)?\/blog\/([a-z0-9-]+)\/?(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/g,
    (link, slug: string, text: string) => (isLiveSlug(slug) ? link : text),
  );
}

export function readMinutes(content = ""): number {
  const words = stripHtmlMarker(content).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
