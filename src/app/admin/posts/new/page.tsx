"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewPostPage() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const autoSlug = useMemo(() => slugify(title), [title]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const finalSlug = (slug || autoSlug).trim();
    if (!title.trim()) return setMessage("❌ Le titre est obligatoire");
    if (!finalSlug) return setMessage("❌ Le slug est obligatoire");
    if (!content.trim()) return setMessage("❌ Le contenu est obligatoire");

    setSaving(true);

    // ✅ 1) récupérer l'utilisateur connecté
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setSaving(false);
      setMessage("❌ Tu dois être connecté pour créer un post.");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      content,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("posts").insert(payload);
    
    setSaving(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setMessage("✅ Post créé !");
    // reset
    setTitle("");
    setSlug("");
    setContent("");
    setStatus("draft");
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Nouveau post</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Titre</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setMessage(null);
            }}
            placeholder="Ex: Semaine 1 — Objectif Marathon Paris 2027"
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={autoSlug || "ex: semaine-1-objectif-marathon-paris-2027"}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
          <small style={{ opacity: 0.7 }}>
            Laisse vide pour utiliser automatiquement : <strong>{autoSlug || "..."}</strong>
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
            placeholder="Écris ton post ici (markdown si tu veux, mais simple texte OK)."
            rows={12}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, fontFamily: "inherit" }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Enregistrement..." : "Créer le post"}
        </button>

        {message && <p style={{ marginTop: 4 }}>{message}</p>}
      </form>
    </main>
  );
}
