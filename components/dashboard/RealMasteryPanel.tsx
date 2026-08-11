"use client";

import Link from "next/link";
import { useCourseStats } from "@/lib/useCourseStats";
import { useQuizStats } from "@/lib/useQuizStats";
import MasteryRing from "./MasteryRing";

export default function RealMasteryPanel() {
  const { loading: loadingCourses, totalCourses } = useCourseStats();
  const {
    loading: loadingQuiz,
    totalAttempts,
    accuracyPercent,
    totalAnswered,
    modulesToReview,
  } = useQuizStats();

  const loading = loadingCourses || loadingQuiz;

  return (
    <div className="panel">
      <div className="panel-title">Maîtrise globale</div>
      <MasteryRing percent={loading ? 0 : accuracyPercent} />
      <div style={{ marginTop: 14 }}>
        <div className="stat-row">
          <span className="k">Cours importés</span>
          <span className="v">{loading ? "…" : totalCourses}</span>
        </div>
        <div className="stat-row">
          <span className="k">Quiz complétés</span>
          <span className="v">{loading ? "…" : totalAttempts}</span>
        </div>
        <div className="stat-row">
          <span className="k">Précision moyenne</span>
          <span className={`v ${totalAnswered > 0 ? "good" : ""}`}>
            {loading ? "…" : totalAnswered > 0 ? `${accuracyPercent}%` : "—"}
          </span>
        </div>
        <div className="stat-row">
          <span className="k">Modules à revoir</span>
          <span className={`v ${modulesToReview > 0 ? "warn" : ""}`}>
            {loading ? "…" : modulesToReview}
          </span>
        </div>
      </div>
      <Link href="/revision" className="btn-ghost">
        SESSION DE RÉVISION RAPIDE
      </Link>
    </div>
  );
}
