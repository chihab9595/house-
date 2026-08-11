"use client";

import { useExamCalendar } from "@/lib/useExamCalendar";
import { daysLeftLabel, formatExamDate } from "@/lib/format";

export default function CalendarPanel() {
  const { loading, upcoming } = useExamCalendar();

  return (
    <div className="panel">
      <div className="panel-title">Calendrier · Prochains contrôles</div>
      {loading ? (
        <div className="empty-hint">Chargement…</div>
      ) : upcoming.length === 0 ? (
        <div className="empty-hint">
          Aucun contrôle planifié pour l&apos;instant. Ajoute une date de contrôle sur un module
          ci-dessous.
        </div>
      ) : (
        <div className="course-list">
          {upcoming.map((e) => (
            <div className="course-card" key={e.id}>
              <span className="file-icon">🗓️</span>
              <div className="info">
                <div className="name">
                  {e.name} · {e.moduleName}
                </div>
                <div className="meta">{formatExamDate(e.date)}</div>
              </div>
              <span className={`exam-badge ${e.daysLeft <= 7 ? "warn-badge" : ""}`}>
                {daysLeftLabel(e.daysLeft)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
