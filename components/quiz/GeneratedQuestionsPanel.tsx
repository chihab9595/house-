"use client";

import { useState } from "react";
import * as db from "@/lib/db";
import { generateQuestionsFromText, type GeneratedQuestion } from "@/lib/questionGenerator";
import { useAiStatus } from "@/lib/useAiStatus";

interface GeneratedQuestionsPanelProps {
  moduleId: string;
  getSourceText: () => Promise<string>;
  onClose: () => void;
}

type Phase = "form" | "loading" | "review" | "saved";

export default function GeneratedQuestionsPanel({
  moduleId,
  getSourceText,
  onClose,
}: GeneratedQuestionsPanelProps) {
  const aiStatus = useAiStatus();
  const [phase, setPhase] = useState<Phase>("form");
  const [count, setCount] = useState(5);
  const [proposals, setProposals] = useState<GeneratedQuestion[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  async function handleGenerate() {
    setPhase("loading");
    setError(null);
    try {
      const sourceText = await getSourceText();
      const generated = await generateQuestionsFromText(sourceText, count);
      setProposals(generated);
      setSelected(generated.map(() => true));
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération.");
      setPhase("form");
    }
  }

  async function handleSave() {
    const toSave = proposals.filter((_, i) => selected[i]);
    if (toSave.length === 0) return;
    setPhase("loading");
    try {
      for (const q of toSave) {
        await db.addQuestion(moduleId, q.prompt, q.choices, q.correctIndexes);
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
          Génération IA non disponible : configure une clé Groq dans{" "}
          <strong>Paramètres</strong> pour activer cette fonctionnalité.
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
    return (
      <div className="ai-generate-panel">
        <div className="empty-hint" style={{ padding: "0 0 10px" }}>
          Relis chaque question avant d&apos;enregistrer — une IA peut se tromper, surtout sur du contenu
          médical. Décoche celles à écarter.
        </div>
        <div className="ai-proposal-list">
          {proposals.map((q, i) => (
            <label className="ai-proposal" key={i}>
              <input
                type="checkbox"
                checked={selected[i]}
                onChange={() =>
                  setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                }
              />
              <div>
                <div className="ai-proposal-prompt">{q.prompt}</div>
                <ul className="ai-proposal-choices">
                  {q.choices.map((c, ci) => (
                    <li key={ci} className={q.correctIndexes.includes(ci) ? "correct" : ""}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="inline-btn"
            onClick={handleSave}
            disabled={selected.every((v) => !v)}
          >
            Enregistrer ({selected.filter(Boolean).length})
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
        <button type="button" className="inline-btn" onClick={handleGenerate} disabled={phase === "loading"}>
          {phase === "loading" ? "Génération…" : "🤖 Générer"}
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
