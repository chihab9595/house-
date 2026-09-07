"use client";

import { useEffect, useRef, useState } from "react";
import * as db from "@/lib/db";
import { parseQuestionsFromPlainText } from "@/lib/qcmParser";

interface GeneratedQuestionsPanelProps {
  moduleId: string;
  getSourceText: () => Promise<string>;
  onClose: () => void;
  // Lance l'analyse automatiquement au montage, sans exiger un second clic
  // sur le bouton du formulaire — utile quand l'action déclenchante (ex:
  // "Créer les QCM" après un collage de texte) est déjà un choix explicite.
  autoStart?: boolean;
}

type Phase = "form" | "loading" | "review" | "saved";

interface ReviewItem {
  prompt: string;
  choices: string[];
  correctIndexes: number[];
  included: boolean;
  courseName?: string;
}

export default function GeneratedQuestionsPanel({
  moduleId,
  getSourceText,
  onClose,
  autoStart = false,
}: GeneratedQuestionsPanelProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const autoStarted = useRef(false);

  async function handleGenerate() {
    setPhase("loading");
    setError(null);
    try {
      const sourceText = await getSourceText();
      const generated = parseQuestionsFromPlainText(sourceText);

      if (generated.length === 0) {
        throw new Error(
          "Aucune question reconnue dans ce texte. Vérifie qu'il contient bien des questions numérotées (1. 2. 3…) avec des propositions lettrées (A. B. C…)."
        );
      }

      setItems(
        generated.map((q) => ({
          prompt: q.prompt,
          choices: q.choices,
          correctIndexes: q.correctIndexes,
          included: q.correctIndexes.length > 0,
          courseName: q.courseName,
        }))
      );
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'analyse.");
      setPhase("form");
    }
  }

  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    autoStarted.current = true;
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  function toggleIncluded(index: number) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, included: !it.included } : it))
    );
  }

  function toggleCorrect(itemIndex: number, choiceIndex: number) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== itemIndex) return it;
        const has = it.correctIndexes.includes(choiceIndex);
        const correctIndexes = has
          ? it.correctIndexes.filter((c) => c !== choiceIndex)
          : [...it.correctIndexes, choiceIndex].sort((a, b) => a - b);

        let included = it.included;
        if (correctIndexes.length === 0) {
          // Plus aucune bonne réponse : ne peut plus être incluse.
          included = false;
        } else if (it.correctIndexes.length === 0) {
          // Première bonne réponse renseignée pour une question qui n'en
          // avait pas : l'inclure par défaut.
          included = true;
        }

        return { ...it, correctIndexes, included };
      })
    );
  }

  async function handleSave() {
    const toSave = items.filter((it) => it.included && it.correctIndexes.length > 0);
    if (toSave.length === 0) return;
    setPhase("loading");
    try {
      for (const it of toSave) {
        await db.addQuestion(moduleId, it.prompt, it.choices, it.correctIndexes, it.courseName);
      }
      setSavedCount(toSave.length);
      setPhase("saved");
    } catch {
      setError("Échec de l'enregistrement des questions.");
      setPhase("review");
    }
  }

  if (phase === "saved") {
    return (
      <div className="ai-generate-panel">
        <div className="empty-hint" style={{ padding: 0, color: "var(--good)" }}>
          {savedCount} question{savedCount > 1 ? "s" : ""} ajoutée{savedCount > 1 ? "s" : ""} à la banque
          de questions du module.
        </div>
        <button type="button" className="inline-btn" onClick={onClose} style={{ marginTop: 10 }}>
          Fermer
        </button>
      </div>
    );
  }

  if (phase === "review") {
    const includableCount = items.filter((it) => it.included && it.correctIndexes.length > 0).length;
    return (
      <div className="ai-generate-panel">
        <div className="empty-hint" style={{ padding: "0 0 10px" }}>
          Relis chaque question. Quand aucun corrigé n&apos;a été trouvé dans le texte, coche toi-même la
          bonne réponse avant d&apos;inclure la question.
        </div>
        <div className="ai-proposal-list">
          {items.map((it, itemIndex) => {
            const needsAnswer = it.correctIndexes.length === 0;
            const showCourseHeading = it.courseName && it.courseName !== items[itemIndex - 1]?.courseName;
            return (
              <div key={itemIndex}>
                {showCourseHeading && (
                  <div className="panel-title" style={{ marginTop: itemIndex > 0 ? 14 : 0 }}>
                    {it.courseName}
                  </div>
                )}
                <div className="ai-proposal" style={{ cursor: "default" }}>
                  <input
                    type="checkbox"
                    checked={it.included && !needsAnswer}
                    disabled={needsAnswer}
                    onChange={() => toggleIncluded(itemIndex)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="ai-proposal-prompt">{it.prompt}</div>
                    <ul className="ai-proposal-choices">
                      {it.choices.map((c, choiceIndex) => {
                        const isCorrect = it.correctIndexes.includes(choiceIndex);
                        return (
                          <li
                            key={choiceIndex}
                            className={`ai-choice-toggle ${isCorrect ? "correct" : ""}`}
                            onClick={() => toggleCorrect(itemIndex, choiceIndex)}
                          >
                            {c}
                          </li>
                        );
                      })}
                    </ul>
                    {needsAnswer && (
                      <div className="ai-needs-answer">
                        ⚠️ Aucun corrigé trouvé — clique sur la bonne réponse ci-dessus.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" className="inline-btn" onClick={handleSave} disabled={includableCount === 0}>
            Enregistrer ({includableCount})
          </button>
          <button type="button" className="inline-btn" onClick={onClose}>
            Annuler
          </button>
        </div>
        {error && (
          <div className="empty-hint" style={{ color: "var(--pulse)", marginTop: 10, padding: 0 }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ai-generate-panel">
      <div className="inline-form" style={{ flexWrap: "wrap" }}>
        <button type="button" className="inline-btn" onClick={handleGenerate} disabled={phase === "loading"}>
          {phase === "loading" ? "Analyse…" : "⚡ Analyser le texte"}
        </button>
        <button type="button" className="inline-btn" onClick={onClose} disabled={phase === "loading"}>
          Annuler
        </button>
      </div>
      {error && (
        <div className="empty-hint" style={{ color: "var(--pulse)", marginTop: 10, padding: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
