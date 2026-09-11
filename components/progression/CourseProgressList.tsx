"use client";

import Link from "next/link";
import { useCourseProgress } from "@/lib/useCourseProgress";

// Sentinelle pour le groupe "Sans cours" dans l'URL — distingue "aucun
// paramètre cours" (revoir tout le module) de "cours = Sans cours"
// (voir components/quiz/RevisionHub.tsx qui la reconnaît).
const NO_COURSE_PARAM = "__sans_cours__";

export default function CourseProgressList() {
  const { loading, courses } = useCourseProgress();

  if (loading) {
    return (
      <div className="panel placeholder-panel" style={{ minHeight: 200 }}>
        <div className="icon">⏳</div>
        <div className="title">Chargement…</div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="panel">
      <div className="panel-title">Progression par cours</div>
      <div className="progress-list">
        {courses.map((c) => (
          <div className="progress-row" key={`${c.moduleId}::${c.courseName ?? ""}`}>
            <div className="progress-row-top">
              <div>
                <div className="name">{c.courseName ?? "Sans cours"}</div>
                <div className="meta">
                  {c.moduleName} · {c.yearLabel} · {c.questionCount} question
                  {c.questionCount > 1 ? "s" : ""}
                </div>
              </div>
              <div className="progress-row-side">
                {c.accuracy === null ? (
                  <span className="progress-accuracy neutral">Pas encore testé</span>
                ) : (
                  <span className={`progress-accuracy ${c.accuracy < 60 ? "warn" : "good"}`}>
                    {c.accuracy}%
                  </span>
                )}
                <Link
                  href={`/revision?moduleId=${encodeURIComponent(c.moduleId)}&course=${encodeURIComponent(
                    c.courseName ?? NO_COURSE_PARAM
                  )}`}
                  className="inline-btn"
                >
                  Réviser
                </Link>
              </div>
            </div>
            {c.accuracy !== null && (
              <div className="mb-track" style={{ marginTop: 10 }}>
                <div
                  className={`mb-fill ${c.accuracy < 60 ? "warn" : ""}`}
                  style={{ width: `${c.accuracy}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
