"use client";

import { useModuleSelection } from "@/lib/useModuleSelection";
import { useExams } from "@/lib/useExams";
import YearTabs from "@/components/cours/YearTabs";
import ModulesPanel from "@/components/cours/ModulesPanel";
import CalendarPanel from "./CalendarPanel";
import ExamList from "./ExamList";
import ExamForm from "./ExamForm";

export default function PlanningHub() {
  const {
    years,
    loadingModules,
    selectedYearId,
    setSelectedYearId,
    modulesForYear,
    selectedModuleId,
    setSelectedModuleId,
    createModule,
    removeModule,
  } = useModuleSelection();
  const { loading: loadingExams, examsForModule, addExam, removeExam } = useExams(selectedModuleId);

  const selectedModule = modulesForYear.find((m) => m.id === selectedModuleId) ?? null;

  if (loadingModules) {
    return (
      <div className="flex flex-col gap-3.5">
        <div className="panel placeholder-panel" style={{ minHeight: 200 }}>
          <div className="icon">⏳</div>
          <div className="title">Chargement…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <CalendarPanel />

      <YearTabs years={years} selectedYearId={selectedYearId} onSelect={setSelectedYearId} />

      <div className="cours-columns">
        <ModulesPanel
          modules={modulesForYear}
          selectedModuleId={selectedModuleId}
          onSelect={setSelectedModuleId}
          onCreate={createModule}
          onRemove={removeModule}
        />

        {!selectedModule ? (
          <div className="panel placeholder-panel" style={{ minHeight: 200 }}>
            <div className="icon">🗓️</div>
            <div className="title">Sélectionne un module</div>
            <div className="desc">Choisis ou crée un module à gauche pour planifier ses contrôles.</div>
          </div>
        ) : (
          <div className="panel">
            <div className="panel-title">Contrôles · {selectedModule.name}</div>
            {loadingExams ? (
              <div className="empty-hint">Chargement…</div>
            ) : (
              <>
                <ExamList exams={examsForModule} onRemove={removeExam} />
                <ExamForm onCreate={addExam} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
