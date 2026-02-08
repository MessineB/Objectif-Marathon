import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ unwrap

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, published_at, created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) notFound();

  const date = data.published_at ?? data.created_at;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <Link href="/posts">← Retour aux posts</Link>

      <h1 style={{ marginTop: 16, fontSize: 32, fontWeight: 900 }}>{data.title}</h1>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>
        {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(date))}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{data.content}</div>
    </main>
  );
}
