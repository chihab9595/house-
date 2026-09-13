"use client";

// Agrégats supplémentaires pour le tableau de bord du thème "Lumière" —
// tout ce que useQuizStats/useCourseProgress/useExamCalendar ne couvrent pas
// déjà : file d'attente de révision, précision du jour, tendance sur 7 jours,
// quiz récents, cours récemment importés, total d'annales. Un seul hook pour
// éviter de relire IndexedDB une fois par carte du dashboard.

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import { frenchDayLetter, lastNDaysIso } from "./format";
import type { CourseModule, Course } from "./courseTypes";
import type { Question, QuizAttempt } from "./quizTypes";
import type { Annale } from "./annaleTypes";

const REVIEW_THRESHOLD = 60;
const TREND_DAYS = 7;
const RECENT_LIMIT = 3;

export interface TrendDay {
  dateIso: string;
  label: string;
  accuracy: number | null;
}

export interface RecentAttemptStat {
  id: string;
  moduleName: string;
  score: number;
  total: number;
  completedAt: number;
}

export interface RecentCourseStat {
  id: string;
  name: string;
  moduleName: string;
  fileType: string | null;
  fileSize: number | null;
  importedAt: number;
  hasFile: boolean;
}

function dateIsoOf(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useHomeExtras() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [annales, setAnnales] = useState<Annale[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshCourses, freshQuestions, freshAttempts, freshAnnales] = await Promise.all([
      db.getModules(),
      db.getCourses(),
      db.getQuestions(),
      db.getAttempts(),
      db.getAnnales(),
    ]);
    setModules(freshModules);
    setCourses(freshCourses);
    setQuestions(freshQuestions);
    setAttempts(freshAttempts);
    setAnnales(freshAnnales);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const moduleNameById = useMemo(() => new Map(modules.map((m) => [m.id, m.name])), [modules]);

  const reviewCount = useMemo(() => {
    const statsByModule = new Map<string, { correct: number; total: number }>();
    for (const a of attempts) {
      const entry = statsByModule.get(a.moduleId) ?? { correct: 0, total: 0 };
      entry.correct += a.score;
      entry.total += a.total;
      statsByModule.set(a.moduleId, entry);
    }
    const weakModuleIds = new Set(
      [...statsByModule.entries()]
        .filter(([, s]) => s.total > 0 && Math.round((s.correct / s.total) * 100) < REVIEW_THRESHOLD)
        .map(([moduleId]) => moduleId)
    );
    return questions.filter((q) => weakModuleIds.has(q.moduleId)).length;
  }, [attempts, questions]);

  const trend: TrendDay[] = useMemo(() => {
    const dateIsos = lastNDaysIso(TREND_DAYS);
    const byDate = new Map<string, { correct: number; total: number }>(
      dateIsos.map((d) => [d, { correct: 0, total: 0 }])
    );
    for (const a of attempts) {
      const dateIso = dateIsoOf(a.completedAt);
      const entry = byDate.get(dateIso);
      if (!entry) continue;
      entry.correct += a.score;
      entry.total += a.total;
    }
    return dateIsos.map((dateIso) => {
      const entry = byDate.get(dateIso)!;
      return {
        dateIso,
        label: frenchDayLetter(dateIso),
        accuracy: entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : null,
      };
    });
  }, [attempts]);

  const todayAccuracy = useMemo(() => {
    const today = trend[trend.length - 1];
    return today?.accuracy ?? null;
  }, [trend]);

  const recentAttempts: RecentAttemptStat[] = useMemo(
    () =>
      [...attempts]
        .sort((a, b) => b.completedAt - a.completedAt)
        .slice(0, RECENT_LIMIT)
        .map((a) => ({
          id: a.id,
          moduleName: moduleNameById.get(a.moduleId) ?? "Module",
          score: a.score,
          total: a.total,
          completedAt: a.completedAt,
        })),
    [attempts, moduleNameById]
  );

  const recentCourses: RecentCourseStat[] = useMemo(
    () =>
      [...courses]
        .sort((a, b) => b.importedAt - a.importedAt)
        .slice(0, RECENT_LIMIT)
        .map((c) => ({
          id: c.id,
          name: c.name,
          moduleName: moduleNameById.get(c.moduleId) ?? "Module",
          fileType: c.fileType,
          fileSize: c.fileSize,
          importedAt: c.importedAt,
          hasFile: Boolean(c.fileName),
        })),
    [courses, moduleNameById]
  );

  return {
    loading,
    reviewCount,
    todayAccuracy,
    trend,
    recentAttempts,
    recentCourses,
    annalesTotal: annales.length,
  };
}
