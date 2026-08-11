"use client";

import { useCourseStats } from "@/lib/useCourseStats";

const MAX_SHOWN = 4;

export default function ModuleProgressReal() {
  const { loading, modulesWithCounts } = useCourseStats();

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (modulesWithCounts.length === 0) {
    return <div className="empty-hint">Importe des cours dans « Mes cours » pour voir la répartition ici.</div>;
  }

  const shown = modulesWithCounts.slice(0, MAX_SHOWN);
  const max = Math.max(...shown.map((m) => m.courseCount), 1);

  return (
    <div className="module-bar">
      {shown.map((m) => (
        <div key={m.id}>
          <div className="mb-top">
            <span className="name">{m.name}</span>
            <span className="pct">{m.courseCount} cours</span>
          </div>
          <div className="mb-track">
            <div className="mb-fill" style={{ width: `${(m.courseCount / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
