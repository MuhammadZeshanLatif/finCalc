import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback(), viteSingleFile()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
