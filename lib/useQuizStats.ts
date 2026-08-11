"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { CourseModule } from "./courseTypes";
import { useDbSync } from "./dbEvents";
import type { QuizAttempt } from "./quizTypes";

const REVIEW_THRESHOLD = 60;

export interface ModuleAccuracy {
  id: string;
  name: string;
  accuracy: number | null;
  attempted: boolean;
}

export function useQuizStats() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshAttempts] = await Promise.all([db.getModules(), db.getAttempts()]);
    setModules(freshModules);
    setAttempts(freshAttempts);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalAnswered = attempts.reduce((sum, a) => sum + a.total, 0);
  const totalIncorrect = totalAnswered - totalCorrect;
  const accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const perModule: ModuleAccuracy[] = useMemo(() => {
    const byModule = new Map<string, { correct: number; total: number }>();
    for (const a of attempts) {
      const entry = byModule.get(a.moduleId) ?? { correct: 0, total: 0 };
      entry.correct += a.score;
      entry.total += a.total;
      byModule.set(a.moduleId, entry);
    }
    return modules.map((m) => {
      const stats = byModule.get(m.id);
      return {
        id: m.id,
        name: m.name,
        accuracy: stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
        attempted: Boolean(stats),
      };
    });
  }, [modules, attempts]);

  const modulesToReview = perModule.filter(
    (m) => m.accuracy !== null && m.accuracy < REVIEW_THRESHOLD
  ).length;

  return {
    loading,
    totalAttempts,
    totalCorrect,
    totalIncorrect,
    totalAnswered,
    accuracyPercent,
    perModule,
    modulesToReview,
  };
}
