"use client";

// Agrégat global des contrôles à venir, tous modules confondus — utilisé à la
// fois par la page /planning (vue calendrier) et par la carte "Prochain
// contrôle" du dashboard.

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { CourseModule } from "./courseTypes";
import { useDbSync } from "./dbEvents";
import type { Exam } from "./examTypes";
import { daysUntil, todayIsoDate } from "./format";

export interface UpcomingExam extends Exam {
  moduleName: string;
  daysLeft: number;
}

export function useExamCalendar() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshExams] = await Promise.all([db.getModules(), db.getExams()]);
    setModules(freshModules);
    setExams(freshExams);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const upcoming: UpcomingExam[] = useMemo(() => {
    const today = todayIsoDate();
    return exams
      .filter((e) => e.date >= today)
      .map((e) => ({
        ...e,
        moduleName: modules.find((m) => m.id === e.moduleId)?.name ?? "Module",
        daysLeft: daysUntil(e.date),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [modules, exams]);

  const next = upcoming[0] ?? null;

  return { loading, upcoming, next };
}
