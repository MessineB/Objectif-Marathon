"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function EditPostPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [post, setPost] = useState<Post | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [message, setMessage] = useState<string | null>(null);

  const autoSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, content, status, published_at, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setMessage(error?.message ?? "Post introuvable");
        setLoading(false);
        return;
      }

      const p = data as Post;
      setPost(p);
      setTitle(p.title);
      setSlug(p.slug);
      setContent(p.content);
      setStatus(p.status);
      setLoading(false);
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const finalSlug = (slug || autoSlug).trim();
    if (!title.trim()) return setMessage("❌ Le titre est obligatoire");
    if (!finalSlug) return setMessage("❌ Le slug est obligatoire");
    if (!content.trim()) return setMessage("❌ Le contenu est obligatoire");

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      content,
      status,
      published_at: status === "published" ? (post?.published_at ?? new Date().toISOString()) : null,
    };

    const { error } = await supabase.from("posts").update(payload).eq("id", id);

    setSaving(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setMessage("✅ Enregistré !");
    router.refresh();
  }

  async function togglePublish() {
    if (!post) return;
    setMessage(null);
    setSaving(true);

    const nextStatus = status === "published" ? "draft" : "published";

    const payload = {
      status: nextStatus,
      published_at: nextStatus === "published" ? (post.published_at ?? new Date().toISOString()) : null,
    };

    const { error } = await supabase.from("posts").update(payload).eq("id", id);

    setSaving(false);

    if (error) return setMessage(`❌ ${error.message}`);

    setStatus(nextStatus);
    setMessage(nextStatus === "published" ? "✅ Publié !" : "✅ Repassé en brouillon");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Supprimer ce post ? (action irréversible)")) return;

    setDeleting(true);
    setMessage(null);

    const { error } = await supabase.from("posts").delete().eq("id", id);

    setDeleting(false);

    if (error) return setMessage(`❌ ${error.message}`);

    router.push("/admin/posts");
    router.refresh();
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <p>Chargement...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <Link href="/admin/posts">← Retour</Link>
        <p style={{ marginTop: 12, color: "crimson" }}>{message ?? "Post introuvable"}</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <Link href="/admin/posts">← Retour</Link>
          <h1 style={{ marginTop: 10, fontSize: 28, fontWeight: 900 }}>Éditer le post</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Statut actuel : <strong>{status.toUpperCase()}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href={`/posts/${slug}`} style={{ fontSize: 13, opacity: 0.8 }}>
            Voir public
          </Link>

          <button
            type="button"
            onClick={togglePublish}
            disabled={saving}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            {status === "published" ? "Repasser en brouillon" : "Publier"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              color: "crimson",
            }}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </header>

      <form onSubmit={onSave} style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={autoSlug}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
          <small style={{ opacity: 0.7 }}>
            Laisse vide pour utiliser : <strong>{autoSlug || "..."}</strong>
          </small>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Statut</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Contenu</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, fontFamily: "inherit" }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>

        {message && <p style={{ marginTop: 4 }}>{message}</p>}
      </form>
    </main>
  );
}
