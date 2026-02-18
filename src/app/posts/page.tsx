import Link from "next/link";
import { createClient } from "@/lib/supabase/server";



type PostListItem = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
}

export default async function PostsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Posts</h1>
        <p style={{ marginTop: 12, color: "crimson" }}>
          ❌ Erreur lors du chargement : {error.message}
        </p>
      </main>
    );
  }

  const posts = (data ?? []) as PostListItem[];

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>Posts</h1>
        <Link href="/" style={{ opacity: 0.8 }}>
          ← Accueil
        </Link>
      </header>

      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Journal de préparation — Marathon de Paris 2027
      </p>

      {posts.length === 0 ? (
        <p style={{ marginTop: 24 }}>Aucun post publié pour le moment.</p>
      ) : (
        <ul style={{ marginTop: 24, display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {posts.map((p) => {
            const date = p.published_at ?? p.created_at;
            return (
              <li
                key={p.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.7 }}>{formatDate(date)}</div>

                <Link
                  href={`/posts/${p.slug}`}
                  style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  {p.title}
                </Link>

                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
                  /posts/{p.slug}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
