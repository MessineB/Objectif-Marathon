"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WorkoutStatus = "planned" | "done" | "skipped";

export default function NewWorkoutPage() {
  const supabase = createClient();

  const [date, setDate] = useState("");
  const [type, setType] = useState("easy");
  const [status, setStatus] = useState<WorkoutStatus>("planned");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [durationMin, setDurationMin] = useState<string>("");

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderAt, setReminderAt] = useState(""); // datetime-local
  const [reminderEmail, setReminderEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!date) return setMsg("❌ La date est obligatoire");
    if (!type.trim()) return setMsg("❌ Le type est obligatoire");

    setSaving(true);

    // ✅ Important pour RLS: on récupère l'user connecté (owner)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setSaving(false);
      return setMsg("❌ Tu dois être connecté en admin pour créer un workout.");
    }

    const payload = {
      // ✅ Ajout requis si ta policy RLS vérifie auth.uid() = owner_user_id
      owner_user_id: user.id,

      date,
      type,
      status,
      distance_km: distanceKm ? Number(distanceKm) : null,
      duration_min: durationMin ? Number(durationMin) : null,

      reminder_enabled: reminderEnabled,
      reminder_at:
        reminderEnabled && reminderAt ? new Date(reminderAt).toISOString() : null,
      reminder_email: reminderEnabled ? reminderEmail.trim() || null : null,
      reminder_sent_at: null,
    };

    const { error } = await supabase.from("workouts").insert(payload);

    setSaving(false);

    if (error) return setMsg(`❌ ${error.message}`);

    setMsg("✅ Workout créé !");
    setDate("");
    setType("easy");
    setStatus("planned");
    setDistanceKm("");
    setDurationMin("");
    setReminderEnabled(false);
    setReminderAt("");
    setReminderEmail("");
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Nouveau workout</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Type</span>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="easy, intervals..."
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Statut</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkoutStatus)}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
          >
            <option value="planned">planned</option>
            <option value="done">done</option>
            <option value="skipped">skipped</option>
          </select>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Distance (km)</span>
            <input
              inputMode="decimal"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Durée (min)</span>
            <input
              inputMode="numeric"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
            />
          </label>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />
          <span>Envoyer un rappel par email</span>
        </label>

        {reminderEnabled && (
          <>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Date/heure du rappel</span>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Email de rappel (optionnel)</span>
              <input
                type="email"
                placeholder="ton@email.com"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}
              />
              <small style={{ opacity: 0.7 }}>
                Si vide, l’Edge Function peut utiliser une valeur par défaut.
              </small>
            </label>
          </>
        )}

        <button disabled={saving} style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}>
          {saving ? "Enregistrement..." : "Créer"}
        </button>

        {msg && <p>{msg}</p>}
      </form>
    </main>
  );
}
