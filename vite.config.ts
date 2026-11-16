import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** SPA fallback in dev so `/interest`, `/ru/blog`, etc. serve `index.html`. */
function spaFallback(): Plugin {
  return {
    name: "fc-spa-fallback",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, _res, next) => {
          if (req.method !== "GET" || !req.url) return next();
          const clean = req.url.split("?")[0] ?? "";
          if (
            clean.startsWith("/@") ||
            clean.startsWith("/node_modules") ||
            clean.startsWith("/src") ||
            path.extname(clean)
          ) {
            return next();
          }
          req.url = "/index.html";
          next();
        });
      };
    },
  };
}

/**
 * Ad-network and analytics tags in <head> of every page (prerendered HTML included), each one
 * only when its env var is set:
 *   VITE_GROW_SITE_ID          Grow by Mediavine (copy the exact ID from its publisher portal)
 *   VITE_MEDIAVINE_SITE_SLUG   Mediavine/Journey ad script, given to you after approval
 *   VITE_GA4_ID                Google Analytics 4 measurement ID (G-XXXXXXX)
 * The /admin shell never gets these tags.
 */
function adTags(env: Record<string, string>): Plugin {
  const id = (v: string | undefined, re: RegExp) => (v && re.test(v.trim()) ? v.trim() : "");
  const grow = id(env.VITE_GROW_SITE_ID, /^[A-Za-z0-9=+/_-]+$/);
  const mediavine = id(env.VITE_MEDIAVINE_SITE_SLUG, /^[a-z0-9-]+$/);
  const ga4 = id(env.VITE_GA4_ID, /^G-[A-Z0-9]+$/);
  const tags: string[] = [];
  if (mediavine) {
    tags.push(`<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="https://scripts.mediavine.com/tags/${mediavine}.js"></script>`);
  }
  if (grow) {
    tags.push(`<script data-grow-initializer="">!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","${grow}");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();</script>`);
  }
  if (ga4) {
    tags.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>`);
    tags.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());if(!/^\\/admin(\\/|$)/.test(location.pathname))gtag("config","${ga4}");</script>`);
  }
  return {
    name: "fc-ad-tags",
    transformIndexHtml(html) {
      return tags.length ? html.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`) : html;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // No single-file inlining: hashed /assets/* files are cached once and shared by every
  // prerendered page instead of re-downloading ~1.3 MB of inline JS/CSS per URL.
  plugins: [react(), tailwindcss(), spaFallback(), adTags(loadEnv(mode, process.cwd(), "VITE_"))],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
