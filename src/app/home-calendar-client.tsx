"use client";

import { useMemo, useState } from "react";

type Workout = {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  status: "planned" | "done" | "skipped";
  distance_km: number | null;
  duration_min: number | null;
};

function toYMDUTC(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

export default function HomeCalendarClient({ workouts }: { workouts: Workout[] }) {
  const [view, setView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // month: 0-11
  });

  const byDay = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      map.set(w.date, [...(map.get(w.date) ?? []), w]);
    }
    return map;
  }, [workouts]);

  const [selected, setSelected] = useState(() => {
    const d = new Date();
    return toYMDUTC(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(view.year, view.month, 1));

  const first = new Date(view.year, view.month, 1);
  const last = new Date(view.year, view.month + 1, 0);
  const firstWeekday = (first.getDay() + 6) % 7; // lundi=0

  const days = Array.from({ length: last.getDate() }, (_, idx) => {
    const day = idx + 1;
    const ymd = toYMDUTC(view.year, view.month, day);
    return { day, ymd, hasWorkout: byDay.has(ymd) };
  });

  const selectedWorkouts = byDay.get(selected) ?? [];

  function prevMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div>
      {/* Header navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          onClick={prevMonth}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
          aria-label="Mois précédent"
        >
          ◀
        </button>

        <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.9 }}>
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </div>

        <button
          onClick={nextMonth}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
          aria-label="Mois suivant"
        >
          ▶
        </button>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 10, opacity: 0.7, fontSize: 12 }}>
        {["L", "Ma", "Me", "J", "V", "S", "D"].map((d) => (
          <div key={d} style={{ textAlign: "center" }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((d) => {
          const isSelected = d.ymd === selected;
          return (
            <button
              key={d.ymd}
              onClick={() => setSelected(d.ymd)}
              style={{
                padding: "10px 0",
                borderRadius: 12,
                border: isSelected ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                background: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
                color: "inherit",
                cursor: "pointer",
                position: "relative",
              }}
              title={d.hasWorkout ? "Workout prévu" : ""}
            >
              {d.day}
              {d.hasWorkout ? (
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.8)",
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Selected day list */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          Workouts du{" "}
          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
            new Date(selected)
          )}
        </div>

        {selectedWorkouts.length === 0 ? (
          <p style={{ opacity: 0.7 }}>Aucun workout prévu ce jour-là.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {selectedWorkouts.map((w) => (
              <div
                key={w.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {w.type} — {w.status}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                  {w.distance_km != null ? `${w.distance_km} km` : "—"} •{" "}
                  {w.duration_min != null ? `${w.duration_min} min` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.55 }}>
        Astuce : si un mois n’affiche aucun point, c’est qu’aucun workout n’est planifié sur ce mois (dans la fenêtre chargée).
      </div>
    </div>
  );
}
