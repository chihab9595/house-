"use client";

// Version allégée de useCourseLibrary pour les endroits (dashboard) qui n'ont
// besoin que d'agrégats en lecture seule, sans la sélection année/module.

import { useCallback, useEffect, useMemo, useState } from "react";
import * as db from "./db";
import type { Course, CourseModule } from "./courseTypes";
import { useDbSync } from "./dbEvents";

export interface ModuleWithCount {
  id: string;
  name: string;
  courseCount: number;
}

export function useCourseStats() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [freshModules, freshCourses] = await Promise.all([db.getModules(), db.getCourses()]);
    setModules(freshModules);
    setCourses(freshCourses);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useDbSync(refresh);

  const modulesWithCounts: ModuleWithCount[] = useMemo(
    () =>
      modules
        .map((m) => ({
          id: m.id,
          name: m.name,
          courseCount: courses.filter((c) => c.moduleId === m.id).length,
        }))
        .sort((a, b) => b.courseCount - a.courseCount),
    [modules, courses]
  );

  return {
    loading,
    totalCourses: courses.length,
    totalModules: modules.length,
    modulesWithCounts,
  };
}
