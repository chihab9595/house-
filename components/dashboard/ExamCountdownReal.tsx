"use client";

import Link from "next/link";
import { useExamCalendar } from "@/lib/useExamCalendar";
import { formatExamDate } from "@/lib/format";

function unitLabel(daysLeft: number): string {
  if (daysLeft === 0) return "aujourd'hui";
  if (daysLeft === 1) return "jour restant";
  return "jours restants";
}

export default function ExamCountdownReal() {
  const { loading, next } = useExamCalendar();

  if (loading) {
    return <div className="empty-hint">Chargement…</div>;
  }

  if (!next) {
    return (
      <div className="empty-hint" style={{ padding: "6px 0" }}>
        Aucun contrôle planifié.{" "}
        <Link href="/planning" style={{ color: "var(--cyan)" }}>
          Ajoute une date
        </Link>{" "}
        pour voir le compte à rebours ici.
      </div>
    );
  }

  return (
    <>
      <div className="countdown">
        <span className="num mono">{Math.max(next.daysLeft, 0)}</span>
        <span className="unit">{unitLabel(next.daysLeft)}</span>
      </div>
      <div className="exam-name">{next.name}</div>
      <div className="exam-date">
        {formatExamDate(next.date)} · {next.moduleName}
      </div>
    </>
  );
}
