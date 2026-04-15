import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BlogArticle } from "../data/blog/types";
import { getSupabaseBrowserClient } from "../lib/supabaseBrowser";
import type { AppLang } from "../utils/routes";

type Props = {
  lang: AppLang;
  onOpenGeneratedPost: (slug: string) => void;
  onGoLogin: () => void;
};

type BlogRunResult = {
  ok: boolean;
  message: string;
  article?: BlogArticle;
};

type ManagedBlog = {
  id: string;
  lang: AppLang;
  status: "draft" | "published";
  article: BlogArticle;
};

async function safeReadJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function resolveApiError(response: Response, payload: { message?: string } | null, fallback: string): string {
  if (payload?.message) return payload.message;
  if (response.status === 404 || response.status === 405) {
    return "API route is unavailable. Run backend API and frontend together.";
  }
  if (response.status >= 500) {
    return "Server error while calling API. Check environment variables and API logs.";
  }
  return fallback;
}

export default function BlogAutomationPage({ lang, onOpenGeneratedPost, onGoLogin }: Props) {
  const [adminEmail, setAdminEmail] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [contentLanguage, setContentLanguage] = useState<AppLang>(lang);
  const [listLanguage, setListLanguage] = useState<AppLang>(lang);
  const [busy, setBusy] = useState(false);
  const [listBusy, setListBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [managedPosts, setManagedPosts] = useState<ManagedBlog[]>([]);
  const [adminPage, setAdminPage] = useState(1);
  const [editing, setEditing] = useState<ManagedBlog | null>(null);
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft");
  const [editTitle, setEditTitle] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDescription, setEditMetaDescription] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  const labels = useMemo(
    () =>
      lang === "ru"
        ? {
            title: "Секретная панель блога",
            lead: "Создавайте черновики через workflow, редактируйте и публикуйте вручную.",
            create: "Создать",
            createTitle: "Создать новый блог (черновик)",
            topic: "Тема (опционально)",
            primaryKeyword: "Основной ключ",
            country: "Страна ({Country})",
            contentLanguage: "Язык статьи",
            createDraft: "Создать черновик",
            cancel: "Отмена",
            running: "Генерация...",
            logout: "Выйти",
            refresh: "Обновить",
            adminList: "Список блогов",
            edit: "Редактировать",
            remove: "Удалить",
            save: "Сохранить",
            open: "Открыть",
            publish: "Опубликовать",
            published: "Опубликовано",
            loading: "Загрузка...",
            noPosts: "Посты не найдены.",
            colIndex: "#",
            colTitle: "Заголовок",
            colSlug: "Slug",
            colStatus: "Статус",
            prev: "Назад",
            next: "Вперед",
            editTitle: "Заголовок",
            editMetaTitle: "Meta Title",
            editMetaDescription: "Meta Description",
            editExcerpt: "Excerpt",
            editKeywords: "Keywords",
            editStatus: "Статус",
            loginFirst: "Сначала войдите на странице /login.",
            keywordHint: "Например: loan calculator with early repayment",
            countryHint: "Например: United States",
          }
        : {
            title: "Secret Blog Manager",
            lead: "Create workflow-based drafts, then update and publish manually.",
            create: "Create",
            createTitle: "Create New Blog (Draft)",
            topic: "Topic (optional)",
            primaryKeyword: "Primary keyword",
            country: "Country ({Country})",
            contentLanguage: "Article language",
            createDraft: "Create Draft",
            cancel: "Cancel",
            running: "Generating...",
            logout: "Logout",
            refresh: "Refresh",
            adminList: "Blog List",
            edit: "Edit",
            remove: "Delete",
            save: "Save",
            open: "Open",
            publish: "Publish",
            published: "Published",
            loading: "Loading...",
            noPosts: "No posts found.",
            colIndex: "#",
            colTitle: "Title",
            colSlug: "Slug",
            colStatus: "Status",
            prev: "Prev",
            next: "Next",
            editTitle: "Title",
            editMetaTitle: "Meta Title",
            editMetaDescription: "Meta Description",
            editExcerpt: "Excerpt",
            editKeywords: "Keywords",
            editStatus: "Status",
            loginFirst: "Please login first at /login.",
            keywordHint: "Example: loan calculator with early repayment",
            countryHint: "Example: United States",
          },
    [lang],
  );

  async function loadPosts(targetLang = listLanguage) {
    if (!sessionToken) return;
    setListBusy(true);
    try {
      const response = await fetch(`/api/blogs?lang=${targetLang}&status=all`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await safeReadJson<{ ok?: boolean; message?: string; posts?: ManagedBlog[] }>(response);
      if (!response.ok || !data?.ok) {
        throw new Error(resolveApiError(response, data, "Failed to load posts."));
      }
      setManagedPosts(Array.isArray(data.posts) ? data.posts : []);
      setAdminPage(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load posts.");
    } finally {
      setListBusy(false);
    }
  }

  useEffect(() => {
    try {
      const sb = getSupabaseBrowserClient();
      sb.auth.getSession().then(({ data }) => {
        setSessionToken(data.session?.access_token || "");
        setAdminEmail(data.session?.user?.email || "");
      });
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        setSessionToken(session?.access_token || "");
        setAdminEmail(session?.user?.email || "");
      });
      return () => data.subscription.unsubscribe();
    } catch {
      setSessionToken("");
      setAdminEmail("");
      return;
    }
  }, []);

  useEffect(() => {
    if (!sessionToken) return;
    void loadPosts(listLanguage);
  }, [sessionToken, listLanguage]);

  async function logoutAdmin() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    setSessionToken("");
    setManagedPosts([]);
    setEditing(null);
    onGoLogin();
  }

  function openCreateModal() {
    setTopic("");
    setPrimaryKeyword("");
    setCountry("");
    setContentLanguage(listLanguage);
    setError(null);
    setNotice(null);
    setShowCreateModal(true);
  }

  async function createDraft(e: FormEvent) {
    e.preventDefault();
    if (!sessionToken) {
      setError(labels.loginFirst);
      return;
    }
    if (!primaryKeyword.trim() || !country.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const resolvedTopic = topic.trim() || primaryKeyword.trim();
    try {
      const response = await fetch("/api/blog-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({
          topic: resolvedTopic,
          language: contentLanguage,
          country: country.trim(),
          primaryKeyword: primaryKeyword.trim(),
          status: "draft",
        }),
      });
      const data = await safeReadJson<BlogRunResult>(response);
      if (!response.ok || !data?.ok || !data.article) {
        throw new Error(resolveApiError(response, data, "Draft creation failed."));
      }
      setShowCreateModal(false);
      setListLanguage(contentLanguage);
      await loadPosts(contentLanguage);
      window.dispatchEvent(new CustomEvent("fc-blog-updated"));
      setNotice(lang === "ru" ? "Черновик создан и добавлен в список." : "Draft created and added to list.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Draft creation failed.");
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(post: ManagedBlog) {
    setEditing(post);
    setEditTitle(post.article.title);
    setEditMetaTitle(post.article.metaTitle);
    setEditMetaDescription(post.article.metaDescription);
    setEditExcerpt(post.article.excerpt);
    setEditKeywords(post.article.keywords);
    setEditStatus(post.status);
    setError(null);
    setNotice(null);
  }

  async function saveEdit() {
    if (!editing || !sessionToken) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/blogs/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({
          title: editTitle,
          metaTitle: editMetaTitle,
          metaDescription: editMetaDescription,
          excerpt: editExcerpt,
          keywords: editKeywords,
          status: editStatus,
        }),
      });
      const data = await safeReadJson<{ ok?: boolean; message?: string }>(response);
      if (!response.ok || !data?.ok) {
        throw new Error(resolveApiError(response, data, "Update failed."));
      }
      setEditing(null);
      await loadPosts(listLanguage);
      window.dispatchEvent(new CustomEvent("fc-blog-updated"));
      setNotice(lang === "ru" ? "Изменения сохранены." : "Changes saved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: "draft" | "published") {
    if (!sessionToken) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ status }),
      });
      const data = await safeReadJson<{ ok?: boolean; message?: string }>(response);
      if (!response.ok || !data?.ok) {
        throw new Error(resolveApiError(response, data, "Status update failed."));
      }
      await loadPosts(listLanguage);
      window.dispatchEvent(new CustomEvent("fc-blog-updated"));
      setNotice(
        status === "published"
          ? lang === "ru"
            ? "Пост опубликован."
            : "Post published."
          : lang === "ru"
            ? "Пост возвращен в черновик."
            : "Post moved to draft.",
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    if (!sessionToken) return;
    const ok = window.confirm(lang === "ru" ? "Удалить этот пост?" : "Delete this post?");
    if (!ok) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await safeReadJson<{ ok?: boolean; message?: string }>(response);
      if (!response.ok || !data?.ok) {
        throw new Error(resolveApiError(response, data, "Delete failed."));
      }
      await loadPosts(listLanguage);
      window.dispatchEvent(new CustomEvent("fc-blog-updated"));
      setNotice(lang === "ru" ? "Пост удален." : "Post deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  const pageItems = managedPosts.slice((adminPage - 1) * 10, adminPage * 10);

  if (!sessionToken) {
    return (
      <div className="fc-page-box fc-page-box--narrow">
        <div className="alert alert-warning mb-0 d-flex justify-content-between align-items-center">
          <span>{labels.loginFirst}</span>
          <button type="button" className="btn btn-dark btn-sm" onClick={onGoLogin}>
            {lang === "ru" ? "Открыть login" : "Open Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fc-page-box fc-page-box--narrow">
        <h1 className="h3 text-primary d-flex align-items-center gap-2 border-bottom pb-3 mb-3">
          <i className="fa-solid fa-lock"></i> {labels.title}
        </h1>
        <p className="text-body-secondary mb-3">{labels.lead}</p>

        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
          <div className="small text-muted">{adminEmail}</div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
              <i className="fa-solid fa-plus me-1"></i>
              {labels.create}
            </button>
            <select
              className="form-select form-select-sm"
              style={{ width: 120 }}
              value={listLanguage}
              onChange={e => setListLanguage(e.target.value as AppLang)}
            >
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => loadPosts()} disabled={listBusy}>
              {labels.refresh}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logoutAdmin}>
              {labels.logout}
            </button>
          </div>
        </div>

        {error ? <div className="alert alert-danger mb-3">{error}</div> : null}
        {notice ? <div className="alert alert-success mb-3">{notice}</div> : null}

        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th style={{ width: 46 }}>{labels.colIndex}</th>
                <th>{labels.colTitle}</th>
                <th>{labels.colSlug}</th>
                <th>{labels.colStatus}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((post, idx) => (
                <tr key={post.id}>
                  <td>{(adminPage - 1) * 10 + idx + 1}</td>
                  <td>{post.article.title}</td>
                  <td>{post.article.slug}</td>
                  <td>
                    <span className={`badge ${post.status === "published" ? "text-bg-success" : "text-bg-secondary"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="text-nowrap">
                    <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={() => beginEdit(post)}>
                      {labels.edit}
                    </button>
                    <button type="button" className="btn btn-outline-danger btn-sm me-2" onClick={() => deletePost(post.id)}>
                      {labels.remove}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm me-2"
                      disabled={post.status === "published"}
                      onClick={() => updateStatus(post.id, "published")}
                    >
                      {post.status === "published" ? labels.published : labels.publish}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={post.status !== "published"}
                      onClick={() => onOpenGeneratedPost(post.article.slug)}
                    >
                      {labels.open}
                    </button>
                  </td>
                </tr>
              ))}
              {!managedPosts.length ? (
                <tr>
                  <td colSpan={5} className="text-muted">{listBusy ? labels.loading : labels.noPosts}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {managedPosts.length > 10 ? (
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={adminPage <= 1}
              onClick={() => setAdminPage(p => p - 1)}
            >
              {labels.prev}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={adminPage * 10 >= managedPosts.length}
              onClick={() => setAdminPage(p => p + 1)}
            >
              {labels.next}
            </button>
          </div>
        ) : null}

        {editing ? (
          <div className="mt-4 p-3 border rounded-3 bg-light-subtle d-grid gap-3">
            <h3 className="h6 mb-0">{labels.edit}: {editing.article.slug}</h3>
            <label className="form-label mb-0 small">{labels.editTitle}</label>
            <input className="form-control" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <label className="form-label mb-0 small">{labels.editMetaTitle}</label>
            <input className="form-control" value={editMetaTitle} onChange={e => setEditMetaTitle(e.target.value)} />
            <label className="form-label mb-0 small">{labels.editMetaDescription}</label>
            <textarea className="form-control" rows={2} value={editMetaDescription} onChange={e => setEditMetaDescription(e.target.value)} />
            <label className="form-label mb-0 small">{labels.editExcerpt}</label>
            <textarea className="form-control" rows={2} value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} />
            <label className="form-label mb-0 small">{labels.editKeywords}</label>
            <input className="form-control" value={editKeywords} onChange={e => setEditKeywords(e.target.value)} />
            <label className="form-label mb-0 small">{labels.editStatus}</label>
            <select className="form-select" value={editStatus} onChange={e => setEditStatus(e.target.value as "draft" | "published")}>
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={saveEdit} disabled={busy}>{labels.save}</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(null)}>{labels.cancel}</button>
            </div>
          </div>
        ) : null}
      </div>

      {showCreateModal ? (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h2 className="h5 mb-0">{labels.createTitle}</h2>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <form onSubmit={createDraft}>
                  <div className="modal-body d-grid gap-3">
                    <div>
                      <label className="form-label fw-semibold">{labels.topic}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={lang === "ru" ? "Опционально" : "Optional"}
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold">{labels.primaryKeyword}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={primaryKeyword}
                        onChange={e => setPrimaryKeyword(e.target.value)}
                        placeholder={labels.keywordHint}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold">{labels.country}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder={labels.countryHint}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label fw-semibold">{labels.contentLanguage}</label>
                      <select
                        className="form-select"
                        value={contentLanguage}
                        onChange={e => setContentLanguage(e.target.value as AppLang)}
                      >
                        <option value="en">English</option>
                        <option value="ru">Russian</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                      {labels.cancel}
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                      <i className="fa-solid fa-wand-magic-sparkles me-2"></i>
                      {busy ? labels.running : labels.createDraft}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      ) : null}
    </>
  );
}
