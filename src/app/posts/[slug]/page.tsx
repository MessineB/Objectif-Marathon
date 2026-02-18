import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import {
  JournalCover,
  JournalPage,
  JournalSection,
  JournalThumb,
} from "@/app/modules/JournalMotion";
import Runes from "@/app/modules/Runes";
import CornerRune from "@/app/modules/CornerRune";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const supabase = createAdminClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, content, status, created_at, published_at,
      post_media (
        media:media_id ( id, path, alt )
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) console.error("POST PAGE ERROR:", error);

  if (!post) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <p>Post introuvable.</p>
        <Link href="/" style={{ opacity: 0.8 }}>
          ← Retour
        </Link>
      </main>
    );
  }

  const dateIso = post.published_at ?? post.created_at;

  const images =
    post.post_media?.map((pm: any) => {
      const m = pm.media;
      const url = supabase.storage
        .from("media")
        .getPublicUrl(m.path).data.publicUrl;
      return { id: m.id, url, alt: m.alt ?? "" };
    }) ?? [];

  // ✅ Lettrine
  const content = (post.content ?? "").trim();
  const firstChar = content.slice(0, 1);
  const restText = content.slice(1);

  return (
    <JournalPage>
      <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
        {/* Retour */}
        <Link
          href="/"
          style={{
            opacity: 0.85,
            textDecoration: "none",
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          ← Retour
        </Link>

        {/* Page journal */}
        <section
          style={{
            marginTop: 16,
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
            position: "relative",

            // ✅ papier + vignette + bord interne
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.06)",
            background:
              "radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.07), transparent 60%)," +
              "radial-gradient(900px 520px at 50% 100%, rgba(0,0,0,0.22), transparent 60%)," +
              "radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.06), transparent 60%)," +
              "radial-gradient(800px 500px at 80% 20%, rgba(255,255,255,0.04), transparent 55%)," +
              "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
          }}
        >
          {/* Coin artefact */}
          <CornerRune />

          {/* Ruban / bookmark (discret) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 26,
              width: 18,
              height: 46,
              background: "rgba(255,255,255,0.07)",
              borderLeft: "1px solid rgba(255,255,255,0.14)",
              borderRight: "1px solid rgba(255,255,255,0.14)",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
              opacity: 0.9,
            }}
          />

          {/* En-tête */}
          <JournalSection delay={0}>
            <header style={{ padding: 22, paddingBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontSize: 34,
                    fontWeight: 950,
                    letterSpacing: -0.6,
                    margin: 0,
                  }}
                >
                  {post.title}
                </h1>

                {/* Badge date */}
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.88,
                    border: "1px solid rgba(255,255,255,0.14)",
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.03)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                    new Date(dateIso)
                  )}
                </div>
              </div>

              {/* Séparateur rune */}
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: 0.85,
                }}
              >
                <div
                  style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }}
                />
                <Runes />
                <div
                  style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }}
                />
              </div>
            </header>
          </JournalSection>

          {/* Cover */}
          {images[0] && (
            <JournalSection delay={0.05}>
              <div style={{ padding: "0 22px" }}>
                {/* ✅ utilise ton composant anim */}
                <JournalCover src={images[0].url} alt={images[0].alt} />
              </div>
            </JournalSection>
          )}

          {/* Contenu */}
          <JournalSection delay={0.1}>
            <article
              style={{
                padding: 22,
                paddingTop: 18,

                // ✅ lecture "lettre"
                maxWidth: 760,
                margin: "0 auto",

                lineHeight: 1.95,
                fontSize: 16,
                whiteSpace: "pre-wrap",
                color: "rgba(255,255,255,0.92)",
                textShadow: "0 1px 0 rgba(0,0,0,0.25)",

                // ✅ encre / journal
                fontFamily:
                  "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
                letterSpacing: 0.1,
              }}
            >
              {/* ✅ Lettrine */}
              {content.length > 0 ? (
                <div>
                  <span
                    style={{
                      float: "left",
                      fontSize: 54,
                      lineHeight: "52px",
                      fontWeight: 900,
                      marginRight: 10,
                      marginTop: 4,
                      opacity: 0.95,
                      textShadow: "0 8px 22px rgba(0,0,0,0.35)",
                    }}
                  >
                    {firstChar}
                  </span>
                  <span>{restText}</span>
                </div>
              ) : null}
            </article>
          </JournalSection>

          {/* Galerie */}
          {images.length > 1 && (
            <JournalSection delay={0.12}>
              <section style={{ padding: 22, paddingTop: 0 }}>
                <div
                  style={{
                    marginTop: 6,
                    marginBottom: 10,
                    fontSize: 12,
                    opacity: 0.75,
                    letterSpacing: 2,
                    maxWidth: 760,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  ANNEXES
                </div>

                <div
                  style={{
                    maxWidth: 760,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {images.slice(1).map((img, i) => (
                    <JournalThumb key={img.id} src={img.url} alt={img.alt} i={i} />
                  ))}
                </div>
              </section>
            </JournalSection>
          )}

          {/* Bas de page */}
          <footer style={{ padding: 22, paddingTop: 14 }}>
            <div
              style={{
                maxWidth: 760,
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                opacity: 0.78,
                fontSize: 12,
                borderTop: "1px solid rgba(255,255,255,0.10)",
                paddingTop: 14,
                alignItems: "center",
              }}
            >
              <span>Marathon Journal</span>
              <Runes />
              <span style={{ letterSpacing: 2 }}>— Fin de page —</span>
            </div>
          </footer>

          {/* petit coin bas droit (décor discret) */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 14,
              height: 14,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.10)",
              opacity: 0.35,
              transform: "rotate(-8deg)",
            }}
          />
        </section>
      </main>
    </JournalPage>
  );
}
