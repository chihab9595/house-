"use client";

import { useState } from "react";
import type { Question } from "@/lib/quizTypes";

// Sentinelle interne pour le groupe "Sans cours" dans le Set de cours
// dépliés (une chaîne, pas null, car Set<string> est plus simple à manier
// que Set<string | null>).
const NO_COURSE_KEY = "__sans_cours__";

interface QuestionListProps {
  questions: Question[];
  onRemove: (id: string) => void;
  // Absent = pas de bouton "lancer" par groupe (ex: écran de relecture avant
  // enregistrement, où il n'y a rien à lancer).
  onLaunchCourse?: (courseName: string | null, weakOnly?: boolean) => void;
  // Questions dont la dernière réponse était fausse (lib/weakQuestions.ts) —
  // sert uniquement à afficher un bouton de révision ciblée par cours.
  weakIds?: Set<string>;
}

export default function QuestionList({ questions, onRemove, onLaunchCourse, weakIds }: QuestionListProps) {
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

  return <GroupedQuestionList order={order} byCourse={byCourse} weakIds={weakIds} onRemove={onRemove} onLaunchCourse={onLaunchCourse} />;
}

function GroupedQuestionList({
  order,
  byCourse,
  weakIds,
  onRemove,
  onLaunchCourse,
}: {
  order: (string | null)[];
  byCourse: Map<string | null, Question[]>;
  weakIds?: Set<string>;
  onRemove: (id: string) => void;
  onLaunchCourse?: (courseName: string | null, weakOnly?: boolean) => void;
}) {
  // Repliés par défaut : avec plusieurs cours de dizaines de questions
  // chacun, tout déplier obligeait à défiler longuement pour trouver le bon
  // cours. Un clic sur l'en-tête déplie/replie ce cours précis.
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpenCourses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3.5">
      {order.map((key) => {
        const group = byCourse.get(key)!;
        const stateKey = key ?? NO_COURSE_KEY;
        const isOpen = openCourses.has(stateKey);
        const weakCount = weakIds ? group.filter((q) => weakIds.has(q.id)).length : 0;
        return (
          <div key={stateKey}>
            <div
              role="button"
              tabIndex={0}
              className="panel-title"
              onClick={() => toggle(stateKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(stateKey);
                }
              }}
              aria-expanded={isOpen}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                width: "100%",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                  ▶
                </span>
                {key ?? "Sans cours"} ({group.length})
              </span>
              {onLaunchCourse && (
                <span style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  {weakCount > 0 && (
                    <button
                      type="button"
                      className="inline-btn weak-btn"
                      onClick={() => onLaunchCourse(key, true)}
                    >
                      🎯 Points faibles ({weakCount})
                    </button>
                  )}
                  <button type="button" className="inline-btn" onClick={() => onLaunchCourse(key)}>
                    ▶ Lancer ({group.length})
                  </button>
                </span>
              )}
            </div>
            {isOpen && <FlatQuestionList questions={group} onRemove={onRemove} />}
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
