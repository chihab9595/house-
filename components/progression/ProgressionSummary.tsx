"use client";

import { useCourseStats } from "@/lib/useCourseStats";
import { useQuizStats } from "@/lib/useQuizStats";
import { useStudyStats } from "@/lib/useStudyStats";
import { formatDuration } from "@/lib/format";

export default function ProgressionSummary() {
  const courseStats = useCourseStats();
  const quizStats = useQuizStats();
  const studyStats = useStudyStats();

  const loading = courseStats.loading || quizStats.loading || studyStats.loading;

  return (
    <div className="panel">
      <div className="panel-title">Vue d&apos;ensemble</div>
      <div className="stat-row">
        <span className="k">Précision globale</span>
        <span className={`v ${quizStats.totalAnswered > 0 ? "good" : ""}`}>
          {loading ? "…" : quizStats.totalAnswered > 0 ? `${quizStats.accuracyPercent}%` : "—"}
        </span>
      </div>
      <div className="stat-row">
        <span className="k">Modules à revoir</span>
        <span className={`v ${quizStats.modulesToReview > 0 ? "warn" : ""}`}>
          {loading ? "…" : quizStats.modulesToReview}
        </span>
      </div>
      <div className="stat-row">
        <span className="k">Temps d&apos;étude (7 jours)</span>
        <span className="v">{loading ? "…" : formatDuration(studyStats.totalSeconds)}</span>
      </div>
      <div className="stat-row">
        <span className="k">Cours importés</span>
        <span className="v">{loading ? "…" : courseStats.totalCourses}</span>
      </div>
    </div>
  );
}
