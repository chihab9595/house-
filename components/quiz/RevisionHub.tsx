"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useModuleSelection } from "@/lib/useModuleSelection";
import { useQuestionBank } from "@/lib/useQuestionBank";
import YearTabs from "@/components/cours/YearTabs";
import ModulesPanel from "@/components/cours/ModulesPanel";
import PasteExtractPanel from "./PasteExtractPanel";
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
  // undefined = tout le module (bouton "LANCER LE QUIZ" global), null = le
  // groupe "Sans cours", une chaîne = un cours précis — distingue bien "pas
  // de filtre" de "filtré sur le groupe sans cours".
  const [quizCourseName, setQuizCourseName] = useState<string | null | undefined>(undefined);

  // Présélectionne un module via /revision?moduleId=... (utilisé par la page
  // Progression). Par ID, pas par nom : deux modules peuvent légitimement
  // s'appeler pareil dans des années différentes, et .find() par nom
  // atterrirait alors sur un module au hasard parmi les homonymes.
  const searchParams = useSearchParams();
  const moduleIdParam = searchParams.get("moduleId");
  const appliedModuleParam = useRef(false);

  useEffect(() => {
    if (appliedModuleParam.current || !moduleIdParam || loadingModules) return;
    const target = modules.find((m) => m.id === moduleIdParam);
    if (target) {
      setSelectedYearId(target.yearId);
      setSelectedModuleId(target.id);
      appliedModuleParam.current = true;
    }
  }, [moduleIdParam, modules, loadingModules, setSelectedYearId, setSelectedModuleId]);

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
          (() => {
            const quizQuestions =
              quizCourseName === undefined
                ? questionsForModule
                : questionsForModule.filter((q) => (q.courseName ?? null) === quizCourseName);
            const quizTitle =
              quizCourseName === undefined
                ? selectedModule.name
                : `${selectedModule.name} · ${quizCourseName ?? "Sans cours"}`;
            return (
              <div className="panel">
                <div className="panel-title">Quiz · {quizTitle}</div>
                <QuizRunner
                  moduleId={selectedModule.id}
                  questions={quizQuestions}
                  onExit={() => setMode("bank")}
                />
              </div>
            );
          })()
        ) : (
          <div className="panel">
            <div className="panel-title">Questions · {selectedModule.name}</div>
            {loadingQuestions ? (
              <div className="empty-hint">Chargement…</div>
            ) : (
              <>
                <QuestionList
                  questions={questionsForModule}
                  onRemove={removeQuestion}
                  onLaunchCourse={(courseName) => {
                    setQuizCourseName(courseName);
                    setMode("quiz");
                  }}
                />
                {questionsForModule.length > 0 && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ marginBottom: 16 }}
                    onClick={() => {
                      setQuizCourseName(undefined);
                      setMode("quiz");
                    }}
                  >
                    LANCER LE QUIZ ({questionsForModule.length} question
                    {questionsForModule.length > 1 ? "s" : ""})
                  </button>
                )}
                <PasteExtractPanel moduleId={selectedModule.id} />
                <QuestionForm onCreate={addQuestion} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
