"use client";

// Logique année → module partagée par toutes les sections qui organisent du
// contenu par module (cours, questions de quiz, annales) : les modules sont
// une notion globale à l'app, pas propre à /cours.

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { CourseModule } from "./courseTypes";
import { YEARS } from "./constants";
import { useDbSync } from "./dbEvents";

export function useModuleSelection() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedYearId, setSelectedYearId] = useState<number>(YEARS[0].id);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const refreshModules = useCallback(async () => {
    setModules(await db.getModules());
  }, []);

  useEffect(() => {
    refreshModules().finally(() => setLoadingModules(false));
  }, [refreshModules]);

  useDbSync(refreshModules);

  const modulesForYear = useMemo(
    () => modules.filter((m) => m.yearId === selectedYearId).sort((a, b) => a.createdAt - b.createdAt),
    [modules, selectedYearId]
  );

  useEffect(() => {
    if (!modulesForYear.some((m) => m.id === selectedModuleId)) {
      setSelectedModuleId(modulesForYear[0]?.id ?? null);
    }
  }, [modulesForYear, selectedModuleId]);

  const createModule = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const created = await db.addModule(selectedYearId, trimmed);
      await refreshModules();
      setSelectedModuleId(created.id);
    },
    [selectedYearId, refreshModules]
  );

  const removeModule = useCallback(
    async (moduleId: string) => {
      await db.deleteModule(moduleId);
      await refreshModules();
    },
    [refreshModules]
  );

  return {
    years: YEARS,
    loadingModules,
    modules,
    selectedYearId,
    setSelectedYearId,
    modulesForYear,
    selectedModuleId,
    setSelectedModuleId,
    createModule,
    removeModule,
  };
}
