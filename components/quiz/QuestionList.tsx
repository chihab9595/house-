import type { Question } from "@/lib/quizTypes";

interface QuestionListProps {
  questions: Question[];
  onRemove: (id: string) => void;
}

export default function QuestionList({ questions, onRemove }: QuestionListProps) {
  if (questions.length === 0) {
    return <div className="empty-hint">Aucune question dans ce module pour l&apos;instant.</div>;
  }

  return (
    <div className="course-list">
      {questions.map((q, i) => (
        <div className="course-card" key={q.id}>
          <span className="file-icon">❓</span>
          <div className="info">
            <div className="name">
              {i + 1}. {q.prompt}
            </div>
            <div className="meta">
              Bonne{q.correctIndexes.length > 1 ? "s" : ""} réponse
              {q.correctIndexes.length > 1 ? "s" : ""} :{" "}
              {q.correctIndexes.map((idx) => q.choices[idx]).join(", ")} · {q.choices.length} choix
            </div>
          </div>
          <button
            type="button"
            className="remove"
            aria-label="Supprimer la question"
            onClick={() => {
              if (window.confirm("Supprimer cette question ?")) {
                onRemove(q.id);
              }
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
