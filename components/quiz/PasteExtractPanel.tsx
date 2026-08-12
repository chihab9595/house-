"use client";

import { useState } from "react";
import GeneratedQuestionsPanel from "./GeneratedQuestionsPanel";

interface PasteExtractPanelProps {
  moduleId: string;
}

type PasteMode = "parse" | "extract";

export default function PasteExtractPanel({ moduleId }: PasteExtractPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [committed, setCommitted] = useState<{ text: string; mode: PasteMode } | null>(null);

  function reset() {
    setOpen(false);
    setText("");
    setCommitted(null);
  }

  if (committed !== null) {
    return (
      <GeneratedQuestionsPanel
        moduleId={moduleId}
        mode={committed.mode}
        getSourceText={async () => committed.text}
        onClose={reset}
        autoStart
      />
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn-ghost"
        style={{ marginBottom: 16 }}
        onClick={() => setOpen(true)}
      >
        📋 Coller le contenu d&apos;une page
      </button>
    );
  }

  return (
    <div className="ai-generate-panel" style={{ marginBottom: 16 }}>
      <div className="empty-hint" style={{ padding: "0 0 10px" }}>
        Colle ici le texte copié depuis une page (Word, PDF, cahier de contrôle…). Choisis ensuite comment
        le traiter :
        <br />
        ⚡ <strong>Analyse directe</strong> — instantané et gratuit, marche très bien si le texte est bien
        structuré (questions numérotées, propositions A/B/C/D…).
        <br />
        🤖 <strong>IA</strong> — plus lent, à réserver à un texte moins propre (OCR imprécis, mise en page
        irrégulière).
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Colle le texte de la page ici…"
        rows={10}
        style={{ width: "100%", resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="inline-btn"
          disabled={text.trim().length < 20}
          onClick={() => setCommitted({ text, mode: "parse" })}
        >
          ⚡ Analyser directement
        </button>
        <button
          type="button"
          className="inline-btn"
          disabled={text.trim().length < 20}
          onClick={() => setCommitted({ text, mode: "extract" })}
        >
          🤖 Utiliser l&apos;IA
        </button>
        <button type="button" className="inline-btn" onClick={reset}>
          Annuler
        </button>
      </div>
    </div>
  );
}
