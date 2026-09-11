"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useModuleSelection } from "@/lib/useModuleSelection";
import { useQuestionBank } from "@/lib/useQuestionBank";
import { useAttempts } from "@/lib/useAttempts";
import { computeWeakQuestionIds } from "@/lib/weakQuestions";
import YearTabs from "@/components/cours/YearTabs";
import ModulesPanel from "@/components/cours/ModulesPanel";
import PasteExtractPanel from "./PasteExtractPanel";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";
import QuizRunner from "./QuizRunner";

type Mode = "bank" | "quiz";

// Sentinelle utilisée par CourseProgressList pour désigner le groupe "Sans
// cours" dans l'URL (le distingue de "pas de paramètre course" = tout le
// module).
const NO_COURSE_PARAM = "__sans_cours__";

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
  const { attempts } = useAttempts();
  const [mode, setMode] = useState<Mode>("bank");
  // undefined = tout le module (bouton "LANCER LE QUIZ" global), null = le
  // groupe "Sans cours", une chaîne = un cours précis — distingue bien "pas
  // de filtre" de "filtré sur le groupe sans cours".
  const [quizCourseName, setQuizCourseName] = useState<string | null | undefined>(undefined);
  // Filtre additionnel : ne garder que les questions dont la dernière
  // réponse était fausse (voir lib/weakQuestions.ts), combinable avec un
  // filtre par cours ou appliqué à tout le module.
  const [quizWeakOnly, setQuizWeakOnly] = useState(false);

  const weakIds = useMemo(
    () => computeWeakQuestionIds(questionsForModule, attempts),
    [questionsForModule, attempts]
  );
  const weakCountForModule = useMemo(
    () => questionsForModule.filter((q) => weakIds.has(q.id)).length,
    [questionsForModule, weakIds]
  );

  // Présélectionne un module via /revision?moduleId=... (utilisé par la page
  // Progression). Par ID, pas par nom : deux modules peuvent légitimement
  // s'appeler pareil dans des années différentes, et .find() par nom
  // atterrirait alors sur un module au hasard parmi les homonymes.
  // Un ?course=... additionnel (CourseProgressList) lance directement le
  // quiz filtré sur ce cours, plutôt que de laisser l'utilisateur rechercher
  // le bon bouton "Lancer" dans une liste qui peut compter des dizaines de
  // cours. ?weak=1 restreint en plus aux points faibles.
  const searchParams = useSearchParams();
  const moduleIdParam = searchParams.get("moduleId");
  const courseParam = searchParams.get("course");
  const weakParam = searchParams.get("weak") === "1";
  const appliedModuleParam = useRef(false);

  useEffect(() => {
    if (appliedModuleParam.current || !moduleIdParam || loadingModules) return;
    const target = modules.find((m) => m.id === moduleIdParam);
    if (target) {
      setSelectedYearId(target.yearId);
      setSelectedModuleId(target.id);
      if (courseParam !== null) {
        setQuizCourseName(courseParam === NO_COURSE_PARAM ? null : courseParam);
        setQuizWeakOnly(weakParam);
        setMode("quiz");
      }
      appliedModuleParam.current = true;
    }
  }, [moduleIdParam, courseParam, weakParam, modules, loadingModules, setSelectedYearId, setSelectedModuleId]);

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
            let quizQuestions =
              quizCourseName === undefined
                ? questionsForModule
                : questionsForModule.filter((q) => (q.courseName ?? null) === quizCourseName);
            if (quizWeakOnly) {
              quizQuestions = quizQuestions.filter((q) => weakIds.has(q.id));
            }
            const baseTitle =
              quizCourseName === undefined
                ? selectedModule.name
                : `${selectedModule.name} · ${quizCourseName ?? "Sans cours"}`;
            const quizTitle = quizWeakOnly ? `${baseTitle} · Points faibles` : baseTitle;
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
                  weakIds={weakIds}
                  onRemove={removeQuestion}
                  onLaunchCourse={(courseName, weakOnly) => {
                    setQuizCourseName(courseName);
                    setQuizWeakOnly(Boolean(weakOnly));
                    setMode("quiz");
                  }}
                />
                {questionsForModule.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ marginTop: 0, flex: 1, minWidth: 200 }}
                      onClick={() => {
                        setQuizCourseName(undefined);
                        setQuizWeakOnly(false);
                        setMode("quiz");
                      }}
                    >
                      LANCER LE QUIZ ({questionsForModule.length} question
                      {questionsForModule.length > 1 ? "s" : ""})
                    </button>
                    {weakCountForModule > 0 && (
                      <button
                        type="button"
                        className="btn-ghost weak-btn"
                        style={{ marginTop: 0, flex: 1, minWidth: 200 }}
                        onClick={() => {
                          setQuizCourseName(undefined);
                          setQuizWeakOnly(true);
                          setMode("quiz");
                        }}
                      >
                        🎯 RÉVISER MES POINTS FAIBLES ({weakCountForModule})
                      </button>
                    )}
                  </div>
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
