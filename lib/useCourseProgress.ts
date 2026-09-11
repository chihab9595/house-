"use client";

// Progression par cours (pas seulement par module) : un module qui regroupe
// plusieurs cours (ex: importé depuis un cahier de contrôle avec des
// séparateurs "=== Nom du cours ===", voir lib/qcmParser.ts) peut avoir une
// précision très différente d'un cours à l'autre — la moyenne par module
// masque ces écarts.
//
// La précision est calculée réponse par réponse (AttemptAnswer.correct),
// pas tentative par tentative (QuizAttempt.score/total) : chaque réponse
// référence une question précise, qu'on rattache ensuite à son cours via
// Question.courseName — une même tentative de quiz peut ainsi contribuer à
// plusieurs cours différents si ses questions viennent de cours différents.

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import { YEARS } from "./constants";
import type { CourseModule } from "./courseTypes";
import type { Question, QuizAttempt } from "./quizTypes";

export interface CourseProgressStat {
  moduleId: string;
  moduleName: string;
  yearLabel: string;
  // null = groupe "Sans cours" (questions du module sans cours identifié).
  courseName: string | null;
  questionCount: number;
  accuracy: number | null;
  attemptedAnswers: number;
}

function groupKey(moduleId: string, courseName: string | null): string {
  return `${moduleId}::${courseName ?? ""}`;
}

export function useCourseProgress() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshQuestions, freshAttempts] = await Promise.all([
      db.getModules(),
      db.getQuestions(),
      db.getAttempts(),
    ]);
    setModules(freshModules);
    setQuestions(freshQuestions);
    setAttempts(freshAttempts);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const coursesSortedByWeakest: CourseProgressStat[] = useMemo(() => {
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const answerStatsByKey = new Map<string, { correct: number; total: number }>();
    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        const question = questionById.get(answer.questionId);
        if (!question) continue; // question supprimée depuis cette tentative
        const key = groupKey(question.moduleId, question.courseName ?? null);
        const entry = answerStatsByKey.get(key) ?? { correct: 0, total: 0 };
        entry.total += 1;
        if (answer.correct) entry.correct += 1;
        answerStatsByKey.set(key, entry);
      }
    }

    // Un module dont toutes les questions partagent le même groupe (souvent
    // "Sans cours") n'apporte rien de plus que sa carte "par module" déjà
    // affichée ailleurs — on ne le duplique pas ici.
    const questionCountByKey = new Map<string, number>();
    const groupsByModule = new Map<string, Set<string | null>>();
    for (const q of questions) {
      const key = groupKey(q.moduleId, q.courseName ?? null);
      questionCountByKey.set(key, (questionCountByKey.get(key) ?? 0) + 1);
      const set = groupsByModule.get(q.moduleId) ?? new Set<string | null>();
      set.add(q.courseName ?? null);
      groupsByModule.set(q.moduleId, set);
    }

    const stats: CourseProgressStat[] = [];
    for (const m of modules) {
      const groups = groupsByModule.get(m.id);
      if (!groups || groups.size < 2) continue;
      for (const courseName of groups) {
        const key = groupKey(m.id, courseName);
        const answerStats = answerStatsByKey.get(key);
        stats.push({
          moduleId: m.id,
          moduleName: m.name,
          yearLabel: YEARS.find((y) => y.id === m.yearId)?.label ?? "",
          courseName,
          questionCount: questionCountByKey.get(key) ?? 0,
          accuracy:
            answerStats && answerStats.total > 0
              ? Math.round((answerStats.correct / answerStats.total) * 100)
              : null,
          attemptedAnswers: answerStats?.total ?? 0,
        });
      }
    }

    return stats.sort((a, b) => {
      if (a.accuracy === null && b.accuracy === null) {
        return (
          a.moduleName.localeCompare(b.moduleName) || (a.courseName ?? "").localeCompare(b.courseName ?? "")
        );
      }
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      return a.accuracy - b.accuracy;
    });
  }, [modules, questions, attempts]);

  return { loading, courses: coursesSortedByWeakest };
}
