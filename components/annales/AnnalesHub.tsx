"use client";

import { useModuleSelection } from "@/lib/useModuleSelection";
import { useAnnales } from "@/lib/useAnnales";
import YearTabs from "@/components/cours/YearTabs";
import ModulesPanel from "@/components/cours/ModulesPanel";
import ScanForm from "./ScanForm";
import AnnaleList from "./AnnaleList";

export default function AnnalesHub() {
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
  const { loading: loadingAnnales, annalesForModule, saveAnnale, removeAnnale } = useAnnales(selectedModuleId);

  const selectedModule = modulesForYear.find((m) => m.id === selectedModuleId) ?? null;

  if (loadingModules) {
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

        {!selectedModule ? (
          <div className="panel placeholder-panel" style={{ minHeight: 300 }}>
            <div className="icon">🖨️</div>
            <div className="title">Sélectionne un module</div>
            <div className="desc">Choisis ou crée un module à gauche pour scanner des annales.</div>
          </div>
        ) : (
          <div className="panel">
            <div className="panel-title">Annales · {selectedModule.name}</div>
            {loadingAnnales ? (
              <div className="empty-hint">Chargement…</div>
            ) : (
              <>
                <AnnaleList annales={annalesForModule} onRemove={removeAnnale} />
                <ScanForm onSave={saveAnnale} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
