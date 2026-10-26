import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// The admin dashboard (Supabase auth, blog CMS, contact inbox) is its own lazy chunk,
// so public pages never download it.
const AdminPortal = lazy(() => import("./components/admin/AdminPortal"));
const isAdmin = /^\/admin(\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPortal />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
