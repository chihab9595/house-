"use client";

import { useState } from "react";
import type { Annale } from "@/lib/annaleTypes";
import { formatImportedDate } from "@/lib/format";
import GeneratedQuestionsPanel from "@/components/quiz/GeneratedQuestionsPanel";

const SNIPPET_LENGTH = 160;

interface AnnaleListProps {
  annales: Annale[];
  onRemove: (id: string) => void;
}

export default function AnnaleList({ annales, onRemove }: AnnaleListProps) {
  const [openAnnaleId, setOpenAnnaleId] = useState<string | null>(null);

  function togglePanel(annaleId: string) {
    setOpenAnnaleId((prev) => (prev === annaleId ? null : annaleId));
  }

  if (annales.length === 0) {
    return <div className="empty-hint">Aucune annale scannée dans ce module pour l&apos;instant.</div>;
  }

  return (
    <div className="course-list">
      {annales.map((a) => {
        const snippet = a.extractedText.trim();
        return (
          <div key={a.id}>
            <div className="course-card" style={{ alignItems: "flex-start" }}>
              <span className="file-icon">🖨️</span>
              <div className="info">
                <div className="name">{a.name}</div>
                <div className="meta">
                  {formatImportedDate(a.importedAt)}
                  {a.fileName ? ` · ${a.fileName}` : ""}
                </div>
                <div className="annale-snippet">
                  {snippet.length > 0
                    ? snippet.slice(0, SNIPPET_LENGTH) + (snippet.length > SNIPPET_LENGTH ? "…" : "")
                    : "(aucun texte extrait)"}
                </div>
              </div>
              <button type="button" className="inline-btn" onClick={() => togglePanel(a.id)}>
                ⚡ Analyser directement
              </button>
              <button
                type="button"
                className="remove"
                aria-label={`Supprimer ${a.name}`}
                onClick={() => {
                  if (window.confirm(`Supprimer l'annale « ${a.name} » ?`)) {
                    onRemove(a.id);
                  }
                }}
              >
                ✕
              </button>
            </div>
            {openAnnaleId === a.id && (
              <GeneratedQuestionsPanel
                moduleId={a.moduleId}
                getSourceText={async () => a.extractedText}
                onClose={() => setOpenAnnaleId(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
