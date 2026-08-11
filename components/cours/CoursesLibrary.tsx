"use client";

import { useCourseLibrary } from "@/lib/useCourseLibrary";
import YearTabs from "./YearTabs";
import ModulesPanel from "./ModulesPanel";
import CoursesPanel from "./CoursesPanel";

export default function CoursesLibrary() {
  const {
    loading,
    years,
    selectedYearId,
    setSelectedYearId,
    modulesForYear,
    selectedModuleId,
    setSelectedModuleId,
    coursesForSelectedModule,
    createModule,
    removeModule,
    importCourse,
    removeCourse,
  } = useCourseLibrary();

  const selectedModule = modulesForYear.find((m) => m.id === selectedModuleId) ?? null;

  if (loading) {
    return (
      <div className="flex flex-col gap-3.5">
        <div className="panel placeholder-panel" style={{ minHeight: 300 }}>
          <div className="icon">⏳</div>
          <div className="title">Chargement…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <YearTabs years={years} selectedYearId={selectedYearId} onSelect={setSelectedYearId} />

      <div className="cours-columns">
        <ModulesPanel
          modules={modulesForYear}
          selectedModuleId={selectedModuleId}
          onSelect={setSelectedModuleId}
          onCreate={createModule}
          onRemove={removeModule}
        />
        <CoursesPanel
          selectedModule={selectedModule}
          courses={coursesForSelectedModule}
          onImport={importCourse}
          onRemove={removeCourse}
        />
      </div>
    </div>
  );
}
