"use client";

import { useCallback, useEffect, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import type { QuizAttempt } from "./quizTypes";

export function useAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setAttempts(await db.getAttempts());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  return { loading, attempts };
}
