"use client";

import Link from "next/link";
import { useModuleProgress } from "@/lib/useModuleProgress";
import { formatDuration } from "@/lib/format";

export default function ModuleProgressList() {
  const { loading, modules } = useModuleProgress();

  if (loading) {
    return (
      <div className="panel placeholder-panel" style={{ minHeight: 260 }}>
        <div className="icon">⏳</div>
        <div className="title">Chargement…</div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="panel placeholder-panel" style={{ minHeight: 260 }}>
        <div className="icon">📈</div>
        <div className="title">Aucun module pour l&apos;instant</div>
        <div className="desc">
          Crée un module dans « Mes cours » pour commencer à suivre ta progression.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Progression par module</div>
      <div className="progress-list">
        {modules.map((m) => (
          <div className="progress-row" key={m.id}>
            <div className="progress-row-top">
              <div>
                <div className="name">{m.name}</div>
                <div className="meta">
                  {m.yearLabel} · {m.courseCount} cours
                  {m.totalAttempts > 0 ? ` · ${m.totalAttempts} quiz` : ""}
                  {m.studySeconds > 0 ? ` · ${formatDuration(m.studySeconds)} d'étude` : ""}
                </div>
              </div>
              <div className="progress-row-side">
                {m.accuracy === null ? (
                  <span className="progress-accuracy neutral">Pas encore testé</span>
                ) : (
                  <span className={`progress-accuracy ${m.accuracy < 60 ? "warn" : "good"}`}>
                    {m.accuracy}%
                  </span>
                )}
                <Link href={`/revision?module=${encodeURIComponent(m.name)}`} className="inline-btn">
                  Réviser
                </Link>
              </div>
            </div>
            {m.accuracy !== null && (
              <div className="mb-track" style={{ marginTop: 10 }}>
                <div
                  className={`mb-fill ${m.accuracy < 60 ? "warn" : ""}`}
                  style={{ width: `${m.accuracy}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
