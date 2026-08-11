"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { Annale } from "./annaleTypes";
import { useDbSync } from "./dbEvents";

export function useAnnales(moduleId: string | null) {
  const [annales, setAnnales] = useState<Annale[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setAnnales(await db.getAnnales());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const annalesForModule = useMemo(
    () =>
      annales
        .filter((a) => a.moduleId === moduleId)
        .sort((a, b) => b.importedAt - a.importedAt),
    [annales, moduleId]
  );

  const saveAnnale = useCallback(
    async (name: string, fileName: string | null, fileType: string | null, extractedText: string) => {
      if (!moduleId) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      await db.addAnnale(moduleId, trimmed, fileName, fileType, extractedText);
      await refresh();
    },
    [moduleId, refresh]
  );

  const removeAnnale = useCallback(
    async (annaleId: string) => {
      await db.deleteAnnale(annaleId);
      await refresh();
    },
    [refresh]
  );

  return { loading, annalesForModule, saveAnnale, removeAnnale };
}
