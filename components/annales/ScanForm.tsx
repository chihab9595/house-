"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useOcr } from "@/lib/useOcr";

interface ScanFormProps {
  onSave: (name: string, fileName: string | null, fileType: string | null, text: string) => Promise<void>;
}

export default function ScanForm({ onSave }: ScanFormProps) {
  const { recognize, progress, status, running, error } = useOcr();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setText(null);
    if (selected) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function resetForm() {
    setFile(null);
    setText(null);
    setName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleScan() {
    if (!file) return;
    const result = await recognize(file);
    if (result !== null) setText(result);
  }

  async function handleSave() {
    if (!file || text === null || !name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Attend la confirmation de l'écriture avant de vider le formulaire —
      // sinon un échec silencieux (IndexedDB bloquée par un autre onglet,
      // stockage plein...) perd le texte OCR corrigé à la main sans que
      // l'utilisateur s'en aperçoive.
      await onSave(name, file.name, file.type, text);
      resetForm();
    } catch {
      setSaveError("Échec de l'enregistrement de l'annale. Le texte ci-dessus n'a pas été perdu — réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="scan-form">
      <label className="file-input-label" style={{ width: "fit-content" }}>
        {file ? file.name : "🖼️ Choisir une image ou un PDF d'annale"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={running}
          style={{ display: "none" }}
        />
      </label>

      {file && text === null && (
        <button
          type="button"
          className="inline-btn"
          onClick={handleScan}
          disabled={running}
          style={{ marginTop: 10, width: "fit-content" }}
        >
          {running ? `Analyse… ${progress}%` : "Scanner (OCR)"}
        </button>
      )}

      {running && <div className="ocr-status">{status}</div>}
      {error && (
        <div className="empty-hint" style={{ color: "var(--pulse)" }}>
          {error}
        </div>
      )}

      {text !== null && (
        <div className="scan-review">
          <input
            type="text"
            placeholder="Nom de l'annale…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="scan-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
          <div className="empty-hint" style={{ padding: "4px 0" }}>
            Vérifie et corrige le texte extrait avant d&apos;enregistrer — l&apos;OCR n&apos;est jamais
            parfait.
          </div>
          {saveError && (
            <div className="empty-hint" style={{ color: "var(--pulse)" }}>
              {saveError}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="inline-btn" onClick={handleSave} disabled={!name.trim() || saving}>
              {saving ? "Enregistrement…" : "Enregistrer l'annale"}
            </button>
            <button type="button" className="inline-btn" onClick={resetForm} disabled={saving}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
