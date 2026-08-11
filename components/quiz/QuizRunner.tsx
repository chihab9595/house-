"use client";

import { useEffect } from "react";
import { useQuizSession } from "@/lib/useQuizSession";
import type { Question } from "@/lib/quizTypes";

interface QuizRunnerProps {
  moduleId: string;
  questions: Question[];
  onExit: () => void;
}

export default function QuizRunner({ moduleId, questions, onExit }: QuizRunnerProps) {
  const session = useQuizSession(moduleId);

  useEffect(() => {
    session.start(questions);
    // Ne démarrer qu'une fois au montage, avec les questions fournies à cet instant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session.phase === "finished") {
    const score = session.answers.filter((a) => a.correct).length;
    const total = session.answers.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="quiz-result">
        <div className="icon">🏁</div>
        <div className="title">Quiz terminé</div>
        <div className="score">
          {score}/{total}
        </div>
        <div className="desc">{pct}% de bonnes réponses</div>
        <div className="quiz-result-actions">
          <button type="button" className="inline-btn" onClick={() => session.start(questions)}>
            Recommencer
          </button>
          <button type="button" className="inline-btn" onClick={onExit}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  const q = session.currentQuestion;
  if (!q) return null;

  const isLast = session.index + 1 >= session.order.length;

  return (
    <div className="quiz-runner">
      <div className="quiz-progress">
        Question {session.index + 1} / {session.order.length}
      </div>
      <div className="quiz-prompt">{q.prompt}</div>
      {q.correctIndexes.length > 1 && (
        <div className="quiz-hint">Plusieurs réponses sont attendues.</div>
      )}
      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          const isSelected = session.selected.has(i);
          const isCorrectChoice = q.correctIndexes.includes(i);
          const classes = ["quiz-choice"];
          if (session.revealed) {
            if (isCorrectChoice) classes.push("correct");
            else if (isSelected) classes.push("incorrect");
          } else if (isSelected) {
            classes.push("selected");
          }
          return (
            <button
              key={i}
              type="button"
              className={classes.join(" ")}
              onClick={() => session.toggleAnswer(i)}
              disabled={session.revealed}
            >
              <span className="quiz-choice-check">{isSelected ? "☑" : "☐"}</span>
              {choice}
            </button>
          );
        })}
      </div>
      <div className="quiz-runner-actions">
        <button type="button" className="inline-btn" onClick={onExit}>
          Quitter
        </button>
        {!session.revealed ? (
          <button
            type="button"
            className="inline-btn"
            onClick={session.confirmAnswer}
            disabled={session.selected.size === 0}
          >
            Valider
          </button>
        ) : (
          <button type="button" className="inline-btn" onClick={session.next}>
            {isLast ? "Voir le résultat" : "Question suivante"}
          </button>
        )}
      </div>
    </div>
  );
}
