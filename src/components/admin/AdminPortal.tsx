import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  adminAddContact,
  adminDeleteContact,
  adminSignIn,
  adminSignOut,
  adminUpdateContact,
  adminUpdateStatus,
  fetchContacts,
  getAdminSession,
  isSupabaseConfigured,
  type ContactFields,
  type ContactRecord,
} from "../../lib/supabase";
import { adminFetchPosts, postState, type DbPost } from "../../lib/blogPosts";
import AdminWorkspace, { ADMIN_SECTIONS, type AdminSectionId } from "./AdminWorkspace";
import BlogManager from "./BlogManager";
import "./AdminPortal.css";

const sectionFromPath = (): AdminSectionId => {
  const id = window.location.pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return ADMIN_SECTIONS.find(s => s.id === id)?.id ?? "dashboard";
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

type FormMode = { kind: "closed" } | { kind: "add" } | { kind: "edit"; record: ContactRecord };

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatStatusLabel(status: string) {
  return String(status || "")
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return String(name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("");
}

export default function AdminPortal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [detail, setDetail] = useState<ContactRecord | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [section, setSection] = useState<AdminSectionId>(sectionFromPath);
  const [adminEmail, setAdminEmail] = useState("");
  const [blogPosts, setBlogPosts] = useState<DbPost[]>([]);

  useEffect(() => {
    document.title = "Admin — FinanceCalculator";
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
  }, []);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setError("");
    try {
      setContacts(await fetchContacts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load submissions.");
    } finally {
      setLoadingData(false);
    }
    adminFetchPosts().then(setBlogPosts).catch(() => setBlogPosts([]));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }
    getAdminSession()
      .then(session => {
        if (session) {
          setAuthenticated(true);
          setAdminEmail(session.user?.email || "");
          loadData();
        }
      })
      .finally(() => setCheckingSession(false));
  }, [loadData]);

  useEffect(() => {
    const onPop = () => setSection(sectionFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function changeSection(id: AdminSectionId) {
    const path = id === "dashboard" ? "/admin" : `/admin/${id}`;
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setSection(id);
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured for this build (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
      return;
    }
    const result = await adminSignIn(email, password);
    if (!result.ok) {
      setError(result.error || "Incorrect email or password.");
      return;
    }
    setAuthenticated(true);
    getAdminSession().then(session => setAdminEmail(session?.user?.email || email));
    await loadData();
  }

  async function logout() {
    await adminSignOut();
    setAuthenticated(false);
    setEmail("");
    setPassword("");
    setContacts([]);
  }

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries()) as ContactFields;
    try {
      if (formMode.kind === "add") {
        await adminAddContact(fields);
        setSavedMessage("Submission added successfully.");
      } else if (formMode.kind === "edit") {
        await adminUpdateContact(formMode.record.id, fields);
        setSavedMessage("Submission updated successfully.");
      }
      await loadData();
      window.setTimeout(() => {
        setFormMode({ kind: "closed" });
        setSavedMessage("");
      }, 800);
    } catch {
      setSavedMessage("Could not save. Please try again.");
    }
  }

  async function changeStatus(id: string, status: string) {
    try {
      await adminUpdateStatus(id, status);
      setContacts(prev => prev.map(c => (c.id === id ? { ...c, status: status as ContactRecord["status"] } : c)));
    } catch {
      setError("Could not update status.");
    }
  }

  async function deleteRecord(id: string, name: string) {
    if (!window.confirm(`Delete submission from ${name || "this contact"}? This cannot be undone.`)) return;
    try {
      await adminDeleteContact(id);
      if (detail?.id === id) setDetail(null);
      await loadData();
    } catch {
      setError("Could not delete submission.");
    }
  }

  const total = contacts.length;
  const newCount = contacts.filter(c => c.status === "new").length;
  const resolvedCount = contacts.filter(c => c.status === "resolved").length;

  const filtered = contacts.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${c.name || ""} ${c.email || ""} ${c.subject || ""} ${c.message || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (checkingSession) {
    return (
      <div className="fcadmin-boot">
        <span className="fcadmin-boot__spinner" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="fcadmin-login">
        <div className="fcadmin-login__glow fcadmin-login__glow--one" />
        <div className="fcadmin-login__glow fcadmin-login__glow--two" />
        <form className="fcadmin-login__card" onSubmit={login}>
          <div className="fcadmin-login__brand">
            <span className="fcadmin-login__mark">FC</span>
            <span>
              FINANCE <strong>CALCULATOR</strong>
            </span>
          </div>
          <span className="fcadmin-login__eyebrow">SECURE ADMIN PORTAL</span>
          <h1>Welcome back</h1>
          <p>Sign in with your Supabase admin account.</p>

          <label htmlFor="fcadmin-email">Admin email</label>
          <input
            id="fcadmin-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@yourdomain.com"
            autoComplete="username"
            required
          />
          <label htmlFor="fcadmin-password">Password</label>
          <input
            id="fcadmin-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          {error && <span className="fcadmin-login__error">{error}</span>}
          <button type="submit">
            LOGIN TO DASHBOARD <span aria-hidden>→</span>
          </button>
          <small>Authorized personnel only</small>
        </form>
      </main>
    );
  }

  return (
    <AdminWorkspace activeSection={section} onSectionChange={changeSection} email={adminEmail} onSignOut={logout}>
      {section === "dashboard" && <DashboardOverview contacts={contacts} posts={blogPosts} onOpen={changeSection} />}
      {section === "blog" && <BlogManager onPostsChange={setBlogPosts} />}
      {section === "contacts" && (
        <div className="fcadmin-shell fcadmin-shell--embedded">
          <div className="fcadmin-topbar__actions fcadmin-section-actions">
            <button type="button" className="fcadmin-btn-ghost" onClick={loadData}>
              ↻ Refresh
            </button>
            <button type="button" className="fcadmin-btn-primary" onClick={() => setFormMode({ kind: "add" })}>
              + Add Entry
            </button>
          </div>

          <div className="fcadmin-content">
            {error && <p className="fcadmin-banner-error">{error}</p>}

            <section className="fcadmin-stats" aria-label="Overview">
              <div className="fcadmin-stat">
                <span className="fcadmin-stat__icon">📥</span>
                <div>
                  <span>Total Submissions</span>
                  <strong>{total}</strong>
                </div>
              </div>
              <div className="fcadmin-stat fcadmin-stat--gold">
                <span className="fcadmin-stat__icon">🆕</span>
                <div>
                  <span>New / Unread</span>
                  <strong>{newCount}</strong>
                </div>
              </div>
              <div className="fcadmin-stat fcadmin-stat--green">
                <span className="fcadmin-stat__icon">✅</span>
                <div>
                  <span>Resolved</span>
                  <strong>{resolvedCount}</strong>
                </div>
              </div>
            </section>

            <div className="fcadmin-toolbar">
              <input
                className="fcadmin-search"
                type="search"
                placeholder="Search name, email, subject, message…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="fcadmin-filter">
                <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>
                  All
                </button>
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} type="button" className={statusFilter === s.value ? "active" : ""} onClick={() => setStatusFilter(s.value)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <article className="fcadmin-card">
              <header className="fcadmin-card__head">
                <h2>Contact Form Submissions</h2>
                <p>
                  {filtered.length} record{filtered.length === 1 ? "" : "s"}
                </p>
              </header>

              {loadingData && <p className="fcadmin-loading">Loading submissions…</p>}

              <div className="fcadmin-table-scroll">
                <div className="fcadmin-table">
                  <div className="fcadmin-table__head">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Subject</span>
                    <span>Message</span>
                    <span>Received</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {!loadingData && filtered.length === 0 ? (
                    <p className="fcadmin-empty">No submissions found.</p>
                  ) : (
                    filtered.map((c, index) => (
                      <div className="fcadmin-table__row" key={c.id}>
                        <span className={`fcadmin-person fcadmin-person--${(index % 4) + 1}`}>
                          <b>{getInitials(c.name)}</b>
                          <span className="fcadmin-person__name">{c.name || "—"}</span>
                        </span>
                        <span className="fcadmin-stacked">
                          {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "—"}
                        </span>
                        <span>{c.subject || "—"}</span>
                        <span className="fcadmin-message-cell">{c.message || "—"}</span>
                        <span>{formatDate(c.created_at)}</span>
                        <span>
                          <select
                            className={`fcadmin-status-select fcadmin-status--${c.status}`}
                            value={c.status}
                            onChange={e => changeStatus(c.id, e.target.value)}
                            aria-label="Change status"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </span>
                        <span className="fcadmin-row-actions">
                          <button type="button" onClick={() => setDetail(c)}>Detail</button>
                          <button type="button" onClick={() => setFormMode({ kind: "edit", record: c })}>Edit</button>
                          <button type="button" className="danger" onClick={() => deleteRecord(c.id, c.name)}>Delete</button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          </div>

          {formMode.kind !== "closed" && (
            <EntryModal
              mode={formMode}
              savedMessage={savedMessage}
              onClose={() => {
                setFormMode({ kind: "closed" });
                setSavedMessage("");
              }}
              onSubmit={saveEntry}
            />
          )}

          {detail && <DetailModal contact={detail} onClose={() => setDetail(null)} />}
        </div>
      )}
    </AdminWorkspace>
  );
}

function DashboardOverview({ contacts, posts, onOpen }: { contacts: ContactRecord[]; posts: DbPost[]; onOpen: (id: AdminSectionId) => void }) {
  const counts = posts.reduce(
    (acc, p) => {
      acc[postState(p)] += 1;
      return acc;
    },
    { draft: 0, scheduled: 0, published: 0 },
  );
  const upcoming = posts
    .filter(p => postState(p) === "scheduled")
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))
    .slice(0, 5);
  const newContacts = contacts.filter(c => c.status === "new").length;

  return (
    <>
      <section className="aw-overview" aria-label="Overview">
        <div className="aw-overview-card aw-overview-card--gold"><span>Published posts</span><strong>{counts.published}</strong></div>
        <div className="aw-overview-card"><span>Scheduled posts</span><strong>{counts.scheduled}</strong></div>
        <div className="aw-overview-card"><span>Drafts</span><strong>{counts.draft}</strong></div>
        <div className="aw-overview-card"><span>New contact submissions</span><strong>{newContacts}</strong></div>
      </section>
      <section className="aw-panel">
        <h2>Coming up</h2>
        <p>Scheduled posts go live on the blog and sitemap automatically at their publish time.</p>
        {upcoming.length ? (
          <ul className="aw-upcoming">
            {upcoming.map(p => <li key={p.id}><span>{p.title}</span><small>{formatDate(p.publishedAt)}</small></li>)}
          </ul>
        ) : <p>No scheduled posts.</p>}
        <div className="aw-quick-actions">
          <button type="button" className="fcadmin-btn-primary" onClick={() => onOpen("blog")}>Manage blog posts</button>
          <button type="button" className="fcadmin-btn-ghost" onClick={() => onOpen("contacts")}>View contact submissions ({contacts.length})</button>
        </div>
      </section>
    </>
  );
}

function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={full ? "fcadmin-modal__field--full" : undefined}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function EntryModal({ mode, savedMessage, onClose, onSubmit }: {
  mode: FormMode;
  savedMessage: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const r = mode.kind === "edit" ? mode.record : null;

  return (
    <div className="fcadmin-modal" role="dialog" aria-modal="true">
      <button className="fcadmin-modal__backdrop" type="button" aria-label="Close form" onClick={onClose} />
      <form className="fcadmin-modal__panel" onSubmit={onSubmit} key={r?.id || "new"}>
        <header>
          <div>
            <small>{r ? "UPDATE RECORD" : "NEW RECORD"}</small>
            <h2>{r ? "Edit Submission" : "Add Submission"}</h2>
          </div>
          <button type="button" aria-label="Close form" onClick={onClose}>×</button>
        </header>

        <div className="fcadmin-modal__grid">
          <Field label="Full Name">
            <input name="name" placeholder="Enter full name" defaultValue={r?.name || ""} required />
          </Field>
          <Field label="Email">
            <input name="email" type="email" placeholder="name@example.com" defaultValue={r?.email || ""} />
          </Field>
          <Field label="Subject">
            <input name="subject" placeholder="Reason for contact" defaultValue={r?.subject || ""} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={r?.status || "new"}>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Message" full>
            <textarea name="message" rows={4} placeholder="Message / details" defaultValue={r?.message || ""} />
          </Field>
        </div>

        {savedMessage && <p className="fcadmin-modal__success">{savedMessage}</p>}

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">{r ? "Save Changes" : "Add Submission"}</button>
        </footer>
      </form>
    </div>
  );
}

function DetailModal({ contact, onClose }: { contact: ContactRecord; onClose: () => void }) {
  const rows: [string, string | null][] = [
    ["Full Name", contact.name],
    ["Email", contact.email],
    ["Subject", contact.subject],
    ["Status", formatStatusLabel(contact.status)],
    ["Source", formatStatusLabel(contact.source)],
    ["Received On", formatDate(contact.created_at)],
  ];

  return (
    <div className="fcadmin-modal" role="dialog" aria-modal="true">
      <button className="fcadmin-modal__backdrop" type="button" aria-label="Close details" onClick={onClose} />
      <div className="fcadmin-modal__panel">
        <header>
          <div>
            <small>CONTACT SUBMISSION</small>
            <h2>{contact.name || "Unnamed"}</h2>
          </div>
          <button type="button" aria-label="Close details" onClick={onClose}>×</button>
        </header>

        <div className="fcadmin-detail-grid">
          {rows.map(([label, value]) => (
            <div className="fcadmin-detail-item" key={label}>
              <span>{label}</span>
              <strong>{value || "—"}</strong>
            </div>
          ))}
          <div className="fcadmin-detail-item fcadmin-detail-item--full">
            <span>Message</span>
            <div className="fcadmin-detail-scroll">
              <p>{contact.message || "—"}</p>
            </div>
          </div>
        </div>

        <footer>
          <button type="button" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
