"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import { useDbSync } from "./dbEvents";
import type { Question } from "./quizTypes";

export function useQuestionBank(moduleId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setQuestions(await db.getQuestions());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const questionsForModule = useMemo(
    () =>
      questions
        .filter((q) => q.moduleId === moduleId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [questions, moduleId]
  );

  const addQuestion = useCallback(
    async (prompt: string, choices: string[], correctIndexes: number[], courseName?: string) => {
      if (!moduleId) return;
      await db.addQuestion(moduleId, prompt, choices, correctIndexes, courseName);
      await refresh();
    },
    [moduleId, refresh]
  );

  const removeQuestion = useCallback(
    async (id: string) => {
      await db.deleteQuestion(id);
      await refresh();
    },
    [refresh]
  );

  return { loading, questionsForModule, addQuestion, removeQuestion };
}
