"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { Course } from "./courseTypes";
import { useDbSync } from "./dbEvents";
import { useModuleSelection } from "./useModuleSelection";

export function useCourseLibrary() {
  const moduleSelection = useModuleSelection();
  const { selectedModuleId } = moduleSelection;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const refreshCourses = useCallback(async () => {
    setCourses(await db.getCourses());
  }, []);

  useEffect(() => {
    refreshCourses().finally(() => setLoadingCourses(false));
  }, [refreshCourses]);

  useDbSync(refreshCourses);

  const coursesForSelectedModule = useMemo(
    () =>
      courses
        .filter((c) => c.moduleId === selectedModuleId)
        .sort((a, b) => a.importedAt - b.importedAt),
    [courses, selectedModuleId]
  );

  const importCourse = useCallback(
    async (name: string, file: File | null) => {
      if (!selectedModuleId) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      await db.addCourse(selectedModuleId, trimmed, file);
      await refreshCourses();
    },
    [selectedModuleId, refreshCourses]
  );

  const removeCourse = useCallback(
    async (courseId: string) => {
      await db.deleteCourse(courseId);
      await refreshCourses();
    },
    [refreshCourses]
  );

  return {
    ...moduleSelection,
    loading: moduleSelection.loadingModules || loadingCourses,
    coursesForSelectedModule,
    totalCourses: courses.length,
    importCourse,
    removeCourse,
  };
}
