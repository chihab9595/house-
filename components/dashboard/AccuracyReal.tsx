"use client";

import { useQuizStats } from "@/lib/useQuizStats";

export default function AccuracyReal() {
  const { loading, accuracyPercent, totalCorrect, totalIncorrect, totalAnswered } = useQuizStats();

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (totalAnswered === 0) {
    return (
      <div className="empty-hint" style={{ textAlign: "center", padding: "20px 6px" }}>
        Aucun quiz complété pour l&apos;instant. Lance une session dans « Sessions de révision ».
      </div>
    );
  }

  return (
    <div className="accuracy-shield">
      <svg className="shield-icon" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L4 5v6c0 5.2 3.4 9.6 8 11 4.6-1.4 8-5.8 8-11V5l-8-3z"
          stroke="#34d399"
          strokeWidth="1.6"
          fill="rgba(52,211,153,0.08)"
        />
        <path
          d="M8.5 12.2l2.3 2.3 4.7-5"
          stroke="#34d399"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="big">{accuracyPercent}%</div>
      <div className="lbl">de réponses correctes</div>
      <div className="breakdown">
        <div>
          <div className="n" style={{ color: "#34d399" }}>
            {totalCorrect}
          </div>
          Justes
        </div>
        <div>
          <div className="n" style={{ color: "#ff5d73" }}>
            {totalIncorrect}
          </div>
          Fausses
        </div>
      </div>
    </div>
  );
}
