import type { Exam } from "@/lib/examTypes";
import { daysLeftLabel, daysUntil, examBadgeTone, formatExamDate } from "@/lib/format";

interface ExamListProps {
  exams: Exam[];
  onRemove: (id: string) => void;
}

export default function ExamList({ exams, onRemove }: ExamListProps) {
  if (exams.length === 0) {
    return <div className="empty-hint">Aucun contrôle planifié pour ce module.</div>;
  }

  return (
    <div className="course-list">
      {exams.map((e) => {
        const daysLeft = daysUntil(e.date);
        return (
          <div className="course-card" key={e.id}>
            <span className="file-icon">🗓️</span>
            <div className="info">
              <div className="name">{e.name}</div>
              <div className="meta">{formatExamDate(e.date)}</div>
            </div>
            <span className={`exam-badge ${examBadgeTone(daysLeft)}`}>{daysLeftLabel(daysLeft)}</span>
            <button
              type="button"
              className="remove"
              aria-label={`Supprimer ${e.name}`}
              onClick={() => {
                if (window.confirm(`Supprimer le contrôle « ${e.name} » ?`)) {
                  onRemove(e.id);
                }
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
