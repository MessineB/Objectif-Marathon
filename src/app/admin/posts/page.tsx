import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  created_at: string;
  published_at: string | null;
};

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));
}

export default async function AdminPostsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_at, published_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin · Posts</h1>
        <p style={{ color: "crimson", marginTop: 12 }}>❌ {error.message}</p>
      </main>
    );
  }

  const posts = (data ?? []) as AdminPost[];

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin · Posts</h1>
        <Link href="/admin/posts/new">➕ Nouveau post</Link>
      </header>

      <ul style={{ marginTop: 20, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
        {posts.length === 0 && <li>Aucun post.</li>}

        {posts.map((p) => (
          <li
            key={p.id}
            style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  {p.status.toUpperCase()} • {p.slug} • {fmt(p.created_at)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Link href={`/posts/${p.slug}`} style={{ fontSize: 13, opacity: 0.8 }}>
                  Voir
                </Link>
                <Link href={`/admin/posts/${p.id}`} style={{ fontSize: 13 }}>
                  Éditer
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
