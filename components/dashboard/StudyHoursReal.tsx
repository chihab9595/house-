"use client";

import { useStudyStats } from "@/lib/useStudyStats";
import { formatDuration } from "@/lib/format";

export default function StudyHoursReal() {
  const { loading, days, totalSeconds } = useStudyStats();

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (totalSeconds === 0) {
    return (
      <div className="empty-hint" style={{ textAlign: "center", padding: "20px 6px" }}>
        Termine une session de quiz dans « Sessions de révision » pour voir ton temps d&apos;étude
        apparaître ici.
      </div>
    );
  }

  return (
    <>
      <div className="hours-graph">
        {days.map((d) => (
          <div key={d.dateIso} className="hbar" style={{ height: `${d.heightPercent}%` }} />
        ))}
      </div>
      <div className="hlabels">
        {days.map((d) => (
          <span key={d.dateIso}>{d.label}</span>
        ))}
      </div>
      <div className="hours-total">
        Total semaine : <b>{formatDuration(totalSeconds)}</b>
      </div>
    </>
  );
}
