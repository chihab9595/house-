"use client";

import { useState } from "react";
import GeneratedQuestionsPanel from "./GeneratedQuestionsPanel";

interface PasteExtractPanelProps {
  moduleId: string;
}

export default function PasteExtractPanel({ moduleId }: PasteExtractPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [committedText, setCommittedText] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setText("");
    setCommittedText(null);
  }

  if (committedText !== null) {
    return (
      <GeneratedQuestionsPanel
        moduleId={moduleId}
        mode="extract"
        getSourceText={async () => committedText}
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
        📋 Coller le contenu d&apos;une page (IA)
      </button>
    );
  }

  return (
    <div className="ai-generate-panel" style={{ marginBottom: 16 }}>
      <div className="empty-hint" style={{ padding: "0 0 10px" }}>
        Colle ici le texte copié depuis une page (Word, PDF, cahier de contrôle…) — l&apos;IA repère les
        vraies questions et leurs bonnes réponses si elles sont indiquées, sans rien inventer.
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Colle le texte de la page ici…"
        rows={10}
        style={{ width: "100%", resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          className="inline-btn"
          disabled={text.trim().length < 20}
          onClick={() => setCommittedText(text)}
        >
          🤖 Créer les QCM
        </button>
        <button type="button" className="inline-btn" onClick={reset}>
          Annuler
        </button>
      </div>
    </div>
  );
}
