import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Workout = {
  id: string;
  date: string;
  type: string;
  status: "planned" | "done" | "skipped";
  distance_km: number | null;
  duration_min: number | null;
  reminder_enabled: boolean;
  reminder_at: string | null;
};

export default async function AdminWorkoutsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workouts")
    .select("id, date, type, status, distance_km, duration_min, reminder_enabled, reminder_at")
    .order("date", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin · Workouts</h1>
        <p style={{ color: "crimson" }}>❌ {error.message}</p>
      </main>
    );
  }

  const workouts = (data ?? []) as Workout[];

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Admin · Workouts</h1>
        <Link href="/admin/workouts/new">➕ Nouveau workout</Link>
      </header>

      <ul style={{ marginTop: 20, listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {workouts.length === 0 && <li>Aucun workout.</li>}
        {workouts.map((w) => (
          <li key={w.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>
              {w.date} — {w.type} — {w.status}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {w.distance_km ? `${w.distance_km} km` : ""}{" "}
              {w.duration_min ? `• ${w.duration_min} min` : ""}
              {w.reminder_enabled ? ` • Rappel: ${w.reminder_at ?? "non défini"}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
