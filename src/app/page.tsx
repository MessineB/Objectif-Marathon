import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import HomeCalendarClient from "./home-calendar-client";

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

export default async function HomePage() {
  // 1️⃣ Client user → savoir qui est connecté
  const supabaseUser = await createClient();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);

  // 2️⃣ Client admin → lire les données globales
  const supabase = createAdminClient();

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, published_at, status") 
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  if (postsError) {
    console.error("POSTS ERROR:", postsError);
  }

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const startDate = new Date(Date.UTC(y, m - 6, 1));
  const endDate = new Date(Date.UTC(y, m + 7, 0));
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, date, type, status, distance_km, duration_min")
    .eq("status", "planned")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 34, fontWeight: 900 }}>Marathon Journal</h1>

      {/* 🔒 Liens admin — visibles UNIQUEMENT si admin connecté */}
      {isAdmin && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/admin/posts/new">➕ Nouveau post</Link>
          <Link href="/admin/workouts/new">➕ Nouveau workout</Link>
          <Link href="/admin">⚙️ Admin</Link>
        </div>
      )}

      {/* ===== TOP : Objectif + Calendrier ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2.3fr", // ≈ 30% / 70%
          gap: 20,
          marginTop: 24,
          alignItems: "start",
        }}
      >
        {/* OBJECTIF – GAUCHE */}
        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>
            🎯 Objectif marathon
          </h2>

          <p style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
            Préparer un marathon sur la durée, avec régularité, progression et
            plaisir. Ce journal documente chaque étape du processus.
          </p>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              fontSize: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Distance</span>
              <strong>42,195 km</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span>Course cible</span>
              <strong>Paris 2027</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span>Focus</span>
              <strong>Endurance & constance</strong>
            </div>
          </div>
        </aside>

        {/* CALENDRIER – DROITE */}
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            📅 Workouts prévus
          </h2>
          <HomeCalendarClient workouts={workouts ?? []} />
        </section>
      </div>

      {/* ===== POSTS – EN DESSOUS ===== */}
      <section style={{ marginTop: 40 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>📝 Journal</h2>
          <Link href="/posts" style={{ fontSize: 13, opacity: 0.8 }}>
            Voir tous les posts →
          </Link>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
          {(posts ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{p.title}</div>

                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                    new Date(p.published_at ?? p.created_at)
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
