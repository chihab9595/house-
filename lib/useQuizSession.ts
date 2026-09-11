"use client";

import { useCallback, useRef, useState } from "react";
import * as db from "./db";
import { todayIsoDate } from "./format";
import type { AttemptAnswer, Question } from "./quizTypes";

export type QuizPhase = "idle" | "running" | "finished";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setsEqual(a: Set<number>, b: number[]): boolean {
  return a.size === b.length && b.every((n) => a.has(n));
}

export function useQuizSession(moduleId: string | null) {
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [order, setOrder] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const finishingRef = useRef(false);

  const start = useCallback((questions: Question[]) => {
    setOrder(shuffle(questions));
    setIndex(0);
    setAnswers([]);
    setSelected(new Set());
    setRevealed(false);
    startedAtRef.current = Date.now();
    finishingRef.current = false;
    setPhase("running");
  }, []);

  const currentQuestion = order[index] ?? null;

  const toggleAnswer = useCallback(
    (choiceIndex: number) => {
      if (revealed) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(choiceIndex)) next.delete(choiceIndex);
        else next.add(choiceIndex);
        return next;
      });
    },
    [revealed]
  );

  const confirmAnswer = useCallback(() => {
    if (selected.size === 0 || !currentQuestion) return;
    const chosenIndexes = [...selected].sort((a, b) => a - b);
    const correct = setsEqual(selected, currentQuestion.correctIndexes);
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, chosenIndexes, correct }]);
    setRevealed(true);
  }, [selected, currentQuestion]);

  const persistProgress = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    if (moduleId && answers.length > 0) {
      const score = answers.filter((a) => a.correct).length;
      await db.saveAttempt({ moduleId, answers, score, total: answers.length, completedAt: Date.now() });
      const startedAt = startedAtRef.current;
      if (startedAt) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        await db.addStudySession(moduleId, durationSeconds, todayIsoDate());
      }
    }
  }, [moduleId, answers]);

  const next = useCallback(async () => {
    if (index + 1 >= order.length) {
      await persistProgress();
      setPhase("finished");
    } else {
      setIndex((i) => i + 1);
      setSelected(new Set());
      setRevealed(false);
    }
  }, [index, order.length, persistProgress]);

  // Quitter en cours de route ne doit pas perdre les réponses déjà données :
  // on enregistre une tentative partielle (uniquement les questions
  // réellement répondues) avant de sortir, comme si l'étudiant avait choisi
  // de s'arrêter là plutôt que de tout recommencer plus tard.
  const quit = useCallback(async () => {
    await persistProgress();
  }, [persistProgress]);

  const reset = useCallback(() => setPhase("idle"), []);

  return {
    phase,
    order,
    index,
    currentQuestion,
    selected,
    revealed,
    answers,
    start,
    toggleAnswer,
    confirmAnswer,
    next,
    quit,
    reset,
  };
}
