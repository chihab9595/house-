"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useModuleSelection } from "@/lib/useModuleSelection";
import { useQuestionBank } from "@/lib/useQuestionBank";
import YearTabs from "@/components/cours/YearTabs";
import ModulesPanel from "@/components/cours/ModulesPanel";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";
import QuizRunner from "./QuizRunner";

type Mode = "bank" | "quiz";

export default function RevisionHub() {
  const {
    years,
    loadingModules,
    modules,
    selectedYearId,
    setSelectedYearId,
    modulesForYear,
    selectedModuleId,
    setSelectedModuleId,
    createModule,
    removeModule,
  } = useModuleSelection();
  const {
    loading: loadingQuestions,
    questionsForModule,
    addQuestion,
    removeQuestion,
  } = useQuestionBank(selectedModuleId);
  const [mode, setMode] = useState<Mode>("bank");

  // Permet à l'assistant House de présélectionner un module via /revision?module=Nom
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get("module");
  const appliedModuleParam = useRef(false);

  useEffect(() => {
    if (appliedModuleParam.current || !moduleParam || loadingModules) return;
    const target = modules.find((m) => m.name.toLowerCase() === moduleParam.toLowerCase());
    if (target) {
      setSelectedYearId(target.yearId);
      setSelectedModuleId(target.id);
      appliedModuleParam.current = true;
    }
  }, [moduleParam, modules, loadingModules, setSelectedYearId, setSelectedModuleId]);

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
      <YearTabs
        years={years}
        selectedYearId={selectedYearId}
        onSelect={(id) => {
          setSelectedYearId(id);
          setMode("bank");
        }}
      />

      <div className="cours-columns">
        <ModulesPanel
          modules={modulesForYear}
          selectedModuleId={selectedModuleId}
          onSelect={(id) => {
            setSelectedModuleId(id);
            setMode("bank");
          }}
          onCreate={createModule}
          onRemove={removeModule}
        />

        {!selectedModule ? (
          <div className="panel placeholder-panel" style={{ minHeight: 300 }}>
            <div className="icon">🧠</div>
            <div className="title">Sélectionne un module</div>
            <div className="desc">
              Choisis ou crée un module à gauche pour gérer ses questions et lancer un quiz.
            </div>
          </div>
        ) : mode === "quiz" ? (
          <div className="panel">
            <div className="panel-title">Quiz · {selectedModule.name}</div>
            <QuizRunner
              moduleId={selectedModule.id}
              questions={questionsForModule}
              onExit={() => setMode("bank")}
            />
          </div>
        ) : (
          <div className="panel">
            <div className="panel-title">Questions · {selectedModule.name}</div>
            {loadingQuestions ? (
              <div className="empty-hint">Chargement…</div>
            ) : (
              <>
                <QuestionList questions={questionsForModule} onRemove={removeQuestion} />
                {questionsForModule.length > 0 && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ marginBottom: 16 }}
                    onClick={() => setMode("quiz")}
                  >
                    LANCER LE QUIZ ({questionsForModule.length} question
                    {questionsForModule.length > 1 ? "s" : ""})
                  </button>
                )}
                <QuestionForm onCreate={addQuestion} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
