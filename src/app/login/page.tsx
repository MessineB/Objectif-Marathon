"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = "messinebelaroussi@gmail.com"; // ⬅️ mets TON email ici

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // 🔒 Blocage si l'email n'est pas le tien
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError("Accès refusé");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Connexion Admin</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Entre ton email pour recevoir un lien de connexion.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 12 }}>
        <input
          type="email"
          required
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Envoyer le lien magique
        </button>
      </form>

      {sent && (
        <p style={{ marginTop: 12 }}>
          ✅ Email envoyé. Clique sur le lien reçu pour te connecter.
        </p>
      )}

      {error && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          ❌ {error}
        </p>
      )}
    </main>
  );
}
