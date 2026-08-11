"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import { YEARS } from "./constants";
import type { Course, CourseModule } from "./courseTypes";
import type { QuizAttempt } from "./quizTypes";
import type { StudySession } from "./studyTypes";

export interface ModuleProgressStat {
  id: string;
  name: string;
  yearLabel: string;
  courseCount: number;
  accuracy: number | null;
  totalAttempts: number;
  studySeconds: number;
}

export function useModuleProgress() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshCourses, freshAttempts, freshStudySessions] = await Promise.all([
      db.getModules(),
      db.getCourses(),
      db.getAttempts(),
      db.getStudySessions(),
    ]);
    setModules(freshModules);
    setCourses(freshCourses);
    setAttempts(freshAttempts);
    setStudySessions(freshStudySessions);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const modulesSortedByWeakest: ModuleProgressStat[] = useMemo(() => {
    const stats = modules.map((m) => {
      const moduleAttempts = attempts.filter((a) => a.moduleId === m.id);
      const correct = moduleAttempts.reduce((sum, a) => sum + a.score, 0);
      const total = moduleAttempts.reduce((sum, a) => sum + a.total, 0);
      const studySeconds = studySessions
        .filter((s) => s.moduleId === m.id)
        .reduce((sum, s) => sum + s.durationSeconds, 0);

      return {
        id: m.id,
        name: m.name,
        yearLabel: YEARS.find((y) => y.id === m.yearId)?.label ?? "",
        courseCount: courses.filter((c) => c.moduleId === m.id).length,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
        totalAttempts: moduleAttempts.length,
        studySeconds,
      };
    });

    return stats.sort((a, b) => {
      if (a.accuracy === null && b.accuracy === null) return a.name.localeCompare(b.name);
      if (a.accuracy === null) return 1;
      if (b.accuracy === null) return -1;
      return a.accuracy - b.accuracy;
    });
  }, [modules, courses, attempts, studySessions]);

  return { loading, modules: modulesSortedByWeakest };
}
