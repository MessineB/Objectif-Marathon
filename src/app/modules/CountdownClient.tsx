"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  targetIso: string; 
  label?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CountdownClient({ targetIso, label = "Marathon" }: Props) {
  const target = useMemo(() => new Date(targetIso), [targetIso]);

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs <= 0;

  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const start = useMemo(() => new Date(target.getFullYear(), 0, 1), [target]);
  const totalWindow = target.getTime() - start.getTime();
  const doneWindow = now.getTime() - start.getTime();
  const progress = totalWindow > 0 ? clamp(doneWindow / totalWindow, 0, 1) : 0;

  const motivation =
  days > 720
    ? "On est encore loin. On pose les fondations."
    : days > 540
    ? "Plus de deux ans. Construction mentale et physique."
    : days > 365
    ? "Plus d’un an. La constance est la clé."
    : days > 270
    ? "Moins d’un an. La machine est lancée."
    : days > 180
    ? "Moins de 9 mois. Le vrai travail commence."
    : days > 120
    ? "Moins de 6 mois. Discipline quotidienne."
    : days > 90
    ? "Moins de 3 mois. Chaque séance compte."
    : days > 60
    ? "Moins 2 mois. Le corps s’adapte."
    : days > 30
    ? "Encore 1 mois d'entrainement. On entre dans le dur."
    : days > 14
    ? "Deux semaines. Focus total."
    : days > 7
    ? "Dernière semaine. Gestion et récupération."
    : days > 3
    ? "Plus que quelques jours. Calme et confiance."
    : days > 1
    ? "Dernières heures. Tout est prêt."
    : days === 1
    ? "Demain. Respire."
    : days === 0
    ? "C’est aujourd’hui. 42,195 km."
    : "Objectif atteint 🏁 !";


  return (
    <div
      style={{
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>{label}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {isPast ? "Terminé" : "Compte à rebours"}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 950, letterSpacing: -0.5 }}>
        {isPast ? "🏁" : `J-${days}`}
      </div>

      {!isPast && (
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
          {hours.toString().padStart(2, "0")}h {minutes.toString().padStart(2, "0")}m{" "}
          {seconds.toString().padStart(2, "0")}s
        </div>
      )}

      <div
        aria-label="Progression"
        style={{
          marginTop: 12,
          height: 10,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(progress * 100)}%`,
            background: "rgba(255,255,255,0.35)",
          }}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>{motivation}</div>
    </div>
  );
}
