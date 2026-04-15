import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabaseBrowser";
import type { AppLang } from "../utils/routes";

type Props = {
  lang: AppLang;
  onSuccess: () => void;
};

const defaultAdminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || "").trim();
const defaultAdminPassword = String(import.meta.env.VITE_ADMIN_PASSWORD || "");

export default function AdminLoginPage({ lang, onSuccess }: Props) {
  const [email, setEmail] = useState(defaultAdminEmail);
  const [password, setPassword] = useState(defaultAdminPassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const sb = getSupabaseBrowserClient();
        const { data } = await sb.auth.getSession();
        if (active && data.session?.access_token) {
          onSuccess();
        }
      } catch {
        // no-op
      }
    };
    void checkSession();
    return () => {
      active = false;
    };
  }, [onSuccess]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sb = getSupabaseBrowserClient();
      const { data, error: signErr } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr || !data.session?.access_token) {
        throw new Error(signErr?.message || "Unable to login.");
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fc-page-box fc-page-box--narrow">
      <h1 className="h3 text-primary mb-3">
        {lang === "ru" ? "Вход администратора" : "Admin Login"}
      </h1>
      <p className="text-muted mb-4">
        {lang === "ru"
          ? "Этот вход открывает приватную панель управления блогами."
          : "This login opens the private blog management panel."}
      </p>

      <form className="d-grid gap-3" onSubmit={onSubmit}>
        <div>
          <label className="form-label fw-semibold">{lang === "ru" ? "Email" : "Email"}</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label fw-semibold">{lang === "ru" ? "Пароль" : "Password"}</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark" disabled={busy}>
          {busy ? "..." : lang === "ru" ? "Войти" : "Login"}
        </button>
      </form>

      {error ? (
        <div className="alert alert-danger mt-3 mb-0">{error}</div>
      ) : null}
    </div>
  );
}
