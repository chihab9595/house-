import type { Question } from "@/lib/quizTypes";

interface QuestionListProps {
  questions: Question[];
  onRemove: (id: string) => void;
  // Absent = pas de bouton "lancer" par groupe (ex: écran de relecture avant
  // enregistrement, où il n'y a rien à lancer).
  onLaunchCourse?: (courseName: string | null) => void;
}

export default function QuestionList({ questions, onRemove, onLaunchCourse }: QuestionListProps) {
  if (questions.length === 0) {
    return <div className="empty-hint">Aucune question dans ce module pour l&apos;instant.</div>;
  }

  const distinctCourses = new Set(questions.map((q) => q.courseName ?? null));
  // Un seul groupe (toutes sans cours, ou toutes du même cours) : liste plate
  // comme avant l'ajout de cette fonctionnalité, pas de bandeau superflu.
  if (distinctCourses.size <= 1) {
    return <FlatQuestionList questions={questions} onRemove={onRemove} />;
  }

  // Regroupe en préservant l'ordre d'apparition (celui du cahier importé,
  // cours par cours) plutôt qu'un tri alphabétique qui le mélangerait.
  const order: (string | null)[] = [];
  const byCourse = new Map<string | null, Question[]>();
  for (const q of questions) {
    const key = q.courseName ?? null;
    if (!byCourse.has(key)) {
      byCourse.set(key, []);
      order.push(key);
    }
    byCourse.get(key)!.push(q);
  }

  return (
    <div className="flex flex-col gap-3.5">
      {order.map((key) => {
        const group = byCourse.get(key)!;
        return (
          <div key={key ?? "__sans_cours__"}>
            <div
              className="panel-title"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span>{key ?? "Sans cours"}</span>
              {onLaunchCourse && (
                <button type="button" className="inline-btn" onClick={() => onLaunchCourse(key)}>
                  ▶ Lancer ({group.length})
                </button>
              )}
            </div>
            <FlatQuestionList questions={group} onRemove={onRemove} />
          </div>
        );
      })}
    </div>
  );
}

function FlatQuestionList({
  questions,
  onRemove,
}: {
  questions: Question[];
  onRemove: (id: string) => void;
}) {
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
