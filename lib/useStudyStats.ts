"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import { frenchDayLetter, lastNDaysIso } from "./format";
import type { StudySession } from "./studyTypes";

const DAYS_SHOWN = 7;
const MIN_VISIBLE_HEIGHT = 6;

export interface StudyDayStat {
  dateIso: string;
  label: string;
  totalSeconds: number;
  heightPercent: number;
}

export function useStudyStats() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setSessions(await db.getStudySessions());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const { days, totalSeconds } = useMemo(() => {
    const dateIsos = lastNDaysIso(DAYS_SHOWN);
    const byDate = new Map<string, number>(dateIsos.map((d) => [d, 0]));
    for (const s of sessions) {
      if (byDate.has(s.date)) {
        byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.durationSeconds);
      }
    }
    const max = Math.max(...byDate.values(), 1);
    const days: StudyDayStat[] = dateIsos.map((dateIso) => {
      const totalSeconds = byDate.get(dateIso) ?? 0;
      return {
        dateIso,
        label: frenchDayLetter(dateIso),
        totalSeconds,
        heightPercent: totalSeconds > 0 ? Math.max((totalSeconds / max) * 100, MIN_VISIBLE_HEIGHT) : 0,
      };
    });
    const totalSeconds = days.reduce((sum, d) => sum + d.totalSeconds, 0);
    return { days, totalSeconds };
  }, [sessions]);

  return { loading, days, totalSeconds };
}
