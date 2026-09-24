# GEO Audit Report: FinanceCalculator

**Audit Date:** 2026-05-24  
**URL:** https://financcalculators.com/  
**Business Type:** Free SaaS Tool / Publisher (Bilingual EN + RU)  
**Pages Analyzed:** ~100+ (from sitemap — 11 calculator routes × 2 languages + blog posts × 2 languages)  
**Tech Stack:** Vite + React 19, TypeScript, Tailwind CSS  
**Audited By:** Claude Code GEO Audit  

---

## Executive Summary

**Overall GEO Score: 38/100 (Poor)**

FinanceCalculator is significantly better-prepared for GEO than average SPAs — it has llms.txt, comprehensive JSON-LD schema, rich social presence, and a well-structured sitemap with hreflang. However, three fundamental issues block strong AI visibility: (1) all content and schema is JavaScript-injected and invisible to AI crawlers, (2) the llms.txt file has its content duplicated, and (3) robots.txt lacks explicit AI crawler allowances. The `.ru` TLD also creates Western AI training data trust gaps. Fixing the static content rendering issue would have the highest single impact.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 20/100 | 25% | 5.0 |
| Brand Authority | 45/100 | 20% | 9.0 |
| Content E-E-A-T | 30/100 | 20% | 6.0 |
| Technical GEO | 38/100 | 15% | 5.7 |
| Schema & Structured Data | 22/100 | 10% | 2.2 |
| Platform Optimization | 50/100 | 10% | 5.0 |
| **Overall GEO Score** | | | **33/100** |

---

## What's Already GOOD (Don't Break These)

Before listing issues — this project has several things right that most sites miss:

| What | Why it matters |
|---|---|
| `llms.txt` exists | Rare — most sites don't have this |
| Comprehensive JSON-LD schema | WebSite, Organization, WebApplication, BlogPosting, FAQPage, HowTo, BreadcrumbList — all present |
| Social profiles configured | X, Instagram, YouTube, TikTok, Pinterest, Reddit all in `sameAs` |
| Hreflang in sitemap | Correct EN/RU alternates with x-default |
| robots.txt allows all | No AI crawlers blocked (via `User-agent: *`) |
| OG + Twitter cards in index.html | Static in HTML, not JS-injected |
| PWA manifest | Shows site professionalism |
| Yandex verification | Smart for `.ru` domain |
| Blog section | 10+ bilingual articles with dates and structured data |

---

## CRITICAL Issues (Fix Immediately)

### 1. JavaScript SPA — All Content & Schema Invisible to AI Crawlers
**Severity:** CRITICAL  
**File:** `index.html` — `<div id="root"></div>` (empty)

The entire site content, including the comprehensive JSON-LD schema, is injected by JavaScript (`src/utils/seo.ts`). When AI crawlers (GPTBot, ClaudeBot, Perplexity, Google AI) visit, they see only:

```html
<div id="root"></div>
```

All the excellent schema work in `seo.ts` (WebSite, Organization, BlogPosting, FAQPage, HowTo) is completely invisible to AI crawlers because it's dynamically injected into the DOM.

**Fix:** Add static noscript content to `index.html` + generate static HTML shells for key routes (see Fix section below).

---

### 2. llms.txt Content is Duplicated
**Severity:** HIGH  
**File:** `public/llms.txt`

The entire content of llms.txt appears **twice** in the file. This is a content quality signal issue — AI parsers may treat duplicate content as noise or malformed data.

**Fix:** Remove the duplicate second block from `public/llms.txt`.

---

### 3. robots.txt Missing Explicit AI Crawler Allowances
**Severity:** MEDIUM  
**File:** `public/robots.txt`

Current robots.txt allows all via `User-agent: *` — technically correct, but best practice for GEO is to explicitly name key AI crawlers to signal active permission rather than passive non-blocking. Some AI systems check for explicit allows as a trust signal.

Missing explicit entries for:
- `GPTBot` (ChatGPT)
- `ClaudeBot` (Claude/Anthropic)
- `Google-Extended` (Google AI Overviews)
- `PerplexityBot`
- `anthropic-ai`
- `ChatGPT-User`

---

## HIGH Priority Issues

### 4. All Schema is JS-Injected (Cannot Be Read by AI)
**Impact:** Schema is excellent in code but unreachable  
**File:** `src/utils/seo.ts`

The schema system is sophisticated — Organization, WebSite, WebApplication, BlogPosting, FAQPage, HowTo, BreadcrumbList — but all injected via `document.createElement`. AI crawlers executing no JavaScript see none of it.

**Fix:** Move the site-wide static schemas (Organization, WebSite, WebApplication) into `index.html` as static `<script type="application/ld+json">` blocks.

---

### 5. Blog Author Attribution — Organization Only, No Person
**File:** `src/utils/seo.ts` line 380

```typescript
author: { "@type": "Organization", name: opts.blogArticle.authorName },
```

E-E-A-T best practice requires a `Person` author with credentials, not just an Organization. AI systems give higher citation trust to content with identifiable human authors.

---

### 6. No `canonical` in Static HTML
**File:** `index.html`

The comment says "canonical is injected per-route by seo.ts" — but that means AI crawlers see no canonical URL in the raw HTML. Google AI and Perplexity use canonical to understand the authoritative URL.

---

### 7. `.ru` TLD Trust Gap for Western AI
**Severity:** MEDIUM (systemic, hard to fix)

Western AI models (ChatGPT, Claude, Perplexity) are trained predominantly on English-language data. The `.ru` TLD receives lower trust signals in Western AI training data. The site has good English content but is disadvantaged by domain perception.

**Mitigation:** Build more external backlinks from English-language finance sites, increase English Reddit/YouTube presence, submit to English finance directories.

---

## MEDIUM Priority Issues

### 8. Exchange Rate Disclaimer Needs Strengthening
**File:** `public/llms.txt`

llms.txt says: *"Currency rates in the app are illustrative, not live market quotes."*  
But `src/config/site.ts` shows there's an optional `VITE_EXCHANGE_RATE_API_KEY`. If live rates ARE configured in production, the llms.txt disclaimer is inaccurate.

**Fix:** Update llms.txt to accurately reflect whether rates are live or illustrative.

---

### 9. No `noscript` Static Content in index.html
Browsers and crawlers with disabled JS see nothing. A comprehensive `<noscript>` block would help AI crawlers read the page.

---

### 10. Sitemap `lastmod` Dates Are Stale
All calculator pages show `lastmod: 2026-04-11`. If content hasn't changed, this is fine — but if the calculators have been updated, the sitemap should reflect it.

---

## LOW Priority Issues

- Twitter/X handle `@fincalculat` — verify this account is active and linked
- Missing `HowTo` schema for Russian language blog posts (only English?)
- No `dateModified` differentiation on most pages — using same date as `datePublished`

---

## Category Deep Dives

### AI Citability: 20/100
All content is JS-rendered. The calculator tools produce dynamic outputs that AI cannot read. The blog articles have excellent structure in code but are invisible to crawlers. The static `index.html` `<head>` has good meta tags (title, description, OG) but zero body content. Score reflects the strong meta foundation but heavy JS rendering penalty.

### Brand Authority: 45/100
**Positives:** 6 social platform profiles configured (X, Instagram, YouTube, TikTok, Pinterest, Reddit — all in `sameAs`). Finance niche has good AI training coverage. Bilingual (EN + RU) expands reach.  
**Negatives:** `.ru` TLD reduces Western AI trust. New site — limited external brand mentions verifiable. No Wikipedia or major finance directory presence detected.

### Content E-E-A-T: 30/100
Blog content covers legitimate finance topics (compound interest, mortgage, EMI, VAT, tax, currency, BMI). Content appears well-structured in code. However: no human author names on articles (Organization only), no editorial credentials mentioned, no "last reviewed by" dates. Calculator tools are genuinely useful but results are "educational estimates only" which limits authoritative citation.

### Technical GEO: 38/100
- AI crawlers NOT blocked: ✅
- llms.txt exists: ✅ (but duplicated content)
- robots.txt present: ✅
- Sitemap with hreflang: ✅
- Static HTML content: ❌ (SPA — empty root div)
- Schema in static HTML: Partial (OG/Twitter in head, but JSON-LD all JS-injected)
- HTTPS: ✅
- PWA manifest: ✅
- CSP headers: ✅ (well-configured)

### Schema & Structured Data: 22/100
Schema code quality is excellent — comprehensive graph with all recommended types. But since it's all JS-injected, AI crawlers cannot read any of it. Score reflects the quality of what would be readable if static, penalized heavily for JS rendering.

### Platform Optimization: 50/100
Good social profile diversity. Finance content has natural AI training data overlap. YouTube channel exists (`@FinCalc-i1y`). Reddit profile exists. The bilingual approach is smart — Russian finance terms have unique AI training data positioning. Score held back by `.ru` TLD and limited external English-language mentions.

---

## Fixes to Apply Now (Priority Order)

### Fix 1: Remove Duplicate Content from llms.txt (5 minutes)
The file has its content repeated twice. Remove the second copy.

### Fix 2: Add Explicit AI Crawler Allowances to robots.txt (5 minutes)
Add explicit `Allow: /` blocks for GPTBot, ClaudeBot, Google-Extended, PerplexityBot.

### Fix 3: Move Static Schemas to index.html (1 hour)
Move Organization, WebSite, and WebApplication JSON-LD from `seo.ts` into `index.html` as static script blocks. These don't change per-page, so they can be static.

### Fix 4: Add noscript Static Content to index.html (2 hours)
Add a `<noscript>` block with a site description, calculator list, blog article links, and FAQ content.

### Fix 5: Add Person Author Schema to Blog Posts (30 minutes)
Change blog post author from `{ "@type": "Organization" }` to `[Person, Organization]` array — same fix as fbvideodownloaders.

### Fix 6: Generate Static HTML Shells for Key Routes (use prerender script)
Create a prerender script (similar to fbvideodownloaders approach) to generate static HTML for each calculator page and blog post.

---

## 30-Day Action Plan

### Week 1: Quick Technical Fixes
- [ ] Fix llms.txt — remove duplicate content
- [ ] Add explicit AI crawlers to robots.txt
- [ ] Move static Organization/WebSite/WebApplication schema to index.html
- [ ] Add comprehensive noscript content to index.html

### Week 2: Author & Content E-E-A-T
- [ ] Add Person author schema to all blog posts
- [ ] Create an About page with editorial team credentials
- [ ] Add "Last reviewed" dates to calculator pages
- [ ] Add author bio section to blog articles

### Week 3: Static HTML Generation
- [ ] Write prerender script for calculator routes
- [ ] Write prerender script for blog routes (EN + RU)
- [ ] Test that AI crawlers can read content

### Week 4: Brand Authority
- [ ] Submit to English-language finance directories
- [ ] Create Reddit posts about the tool on r/personalfinance, r/financialindependence
- [ ] Publish YouTube video demonstrating calculator usage
- [ ] Ensure @fincalculat Twitter/X is active and linked

---

## Comparison: finCalc vs fbvideodownloaders

| Factor | finCalc | fbvideodownloaders | Winner |
|---|---|---|---|
| Initial GEO Score | 38/100 | 18/100 | finCalc |
| AI Crawlers Blocked | No ✅ | Yes (was) ❌ | finCalc |
| llms.txt | Yes (duplicated) | Yes (now) | Tie |
| Schema Quality | Excellent (but JS) | Good (but JS) | finCalc |
| Social Presence | 6 platforms | 5 platforms | Tie |
| Blog Content | EN + RU bilingual | EN only | finCalc |
| Author Attribution | Organization only | Person + Org (now) | fbvideodownloaders |
| Static Content | None | noscript added | fbvideodownloaders |
| Domain Trust | `.ru` (lower EN trust) | `.com` (higher trust) | fbvideodownloaders |
