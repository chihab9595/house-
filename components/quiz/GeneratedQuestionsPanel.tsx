"use client";

import { useEffect, useRef, useState } from "react";
import * as db from "@/lib/db";
import {
  extractQuestionsFromAnnaleText,
  generateQuestionsFromText,
  type GeneratedQuestion,
} from "@/lib/questionGenerator";
import { useAiStatus } from "@/lib/useAiStatus";

interface GeneratedQuestionsPanelProps {
  moduleId: string;
  mode: "generate" | "extract";
  getSourceText: () => Promise<string>;
  onClose: () => void;
  // Lance l'extraction automatiquement au montage, sans exiger un second clic
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
}

export default function GeneratedQuestionsPanel({
  moduleId,
  mode,
  getSourceText,
  onClose,
  autoStart = false,
}: GeneratedQuestionsPanelProps) {
  const aiStatus = useAiStatus();
  const [phase, setPhase] = useState<Phase>("form");
  const [count, setCount] = useState(5);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const autoStarted = useRef(false);

  async function handleGenerate() {
    setPhase("loading");
    setError(null);
    setProgress(null);
    try {
      const sourceText = await getSourceText();
      const generated: GeneratedQuestion[] =
        mode === "extract"
          ? await extractQuestionsFromAnnaleText(sourceText, (done, total) => setProgress({ done, total }))
          : await generateQuestionsFromText(sourceText, count);

      setItems(
        generated.map((q) => ({
          prompt: q.prompt,
          choices: q.choices,
          correctIndexes: q.correctIndexes,
          included: q.correctIndexes.length > 0,
        }))
      );
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération.");
      setPhase("form");
    }
  }

  useEffect(() => {
    if (!autoStart || autoStarted.current || aiStatus.loading || !aiStatus.configured) return;
    autoStarted.current = true;
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, aiStatus.loading, aiStatus.configured]);

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
        await db.addQuestion(moduleId, it.prompt, it.choices, it.correctIndexes);
      }
      setSavedCount(toSave.length);
      setPhase("saved");
    } catch {
      setError("Échec de l'enregistrement des questions.");
      setPhase("review");
    }
  }

  if (!aiStatus.loading && !aiStatus.configured) {
    return (
      <div className="ai-generate-panel">
        <div className="empty-hint" style={{ padding: 0 }}>
          {mode === "extract" ? "Extraction" : "Génération"} IA non disponible : configure une clé
          OpenRouter dans <strong>Paramètres</strong> pour activer cette fonctionnalité.
        </div>
        <button type="button" className="inline-btn" onClick={onClose} style={{ marginTop: 10 }}>
          Fermer
        </button>
      </div>
    );
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
          {mode === "extract"
            ? "Relis chaque question. Quand aucun corrigé n'a été trouvé dans le texte, coche toi-même la bonne réponse avant d'inclure la question."
            : "Relis chaque question avant d'enregistrer — une IA peut se tromper, surtout sur du contenu médical."}
        </div>
        <div className="ai-proposal-list">
          {items.map((it, itemIndex) => {
            const needsAnswer = it.correctIndexes.length === 0;
            return (
              <div className="ai-proposal" key={itemIndex} style={{ cursor: "default" }}>
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
        {mode === "generate" && (
          <label className="ai-count-label">
            Nombre de questions
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              className="ai-count-input"
            />
          </label>
        )}
        <button type="button" className="inline-btn" onClick={handleGenerate} disabled={phase === "loading"}>
          {phase === "loading"
            ? mode === "extract"
              ? progress && progress.total > 1
                ? `Extraction… bloc ${Math.min(progress.done + 1, progress.total)}/${progress.total}`
                : "Extraction…"
              : "Génération…"
            : mode === "extract"
              ? "🤖 Extraire les questions"
              : "🤖 Générer"}
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
