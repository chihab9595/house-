"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import type { Exam } from "./examTypes";

export function useExams(moduleId: string | null) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setExams(await db.getExams());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const examsForModule = useMemo(
    () =>
      exams
        .filter((e) => e.moduleId === moduleId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [exams, moduleId]
  );

  const addExam = useCallback(
    async (name: string, date: string) => {
      if (!moduleId) return;
      const trimmed = name.trim();
      if (!trimmed || !date) return;
      await db.addExam(moduleId, trimmed, date);
      await refresh();
    },
    [moduleId, refresh]
  );

  const removeExam = useCallback(
    async (examId: string) => {
      await db.deleteExam(examId);
      await refresh();
    },
    [refresh]
  );

  return { loading, examsForModule, addExam, removeExam };
}
