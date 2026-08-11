"use client";

import { useRef, useState, type ChangeEvent } from "react";
import * as db from "@/lib/db";
import type { BackupData } from "@/lib/backupTypes";

function summarize(backup: BackupData): string {
  return `${backup.modules.length} module(s), ${backup.courses.length} cours, ${backup.questions.length} question(s), ${backup.annales.length} annale(s), ${backup.exams.length} contrôle(s)`;
}

export default function BackupPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const backup = await db.exportAllData();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateLabel = new Date(backup.exportedAt).toISOString().slice(0, 10);
      a.href = url;
      a.download = `house-sauvegarde-${dateLabel}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Sauvegarde téléchargée : ${summarize(backup)}.`);
    } catch {
      setError("Échec de l'export. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as BackupData;
      if (backup.version !== 1 || !Array.isArray(backup.modules)) {
        throw new Error("format invalide");
      }
      await db.restoreBackup(backup);
      setStatus(`Sauvegarde importée : ${summarize(backup)}. Ajoutés à tes données existantes.`);
    } catch {
      setError("Ce fichier n'est pas une sauvegarde HOUSE valide.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Sauvegarde locale</div>
      <div className="empty-hint" style={{ padding: "0 0 14px" }}>
        Toutes tes données (modules, cours, questions, annales, planning, historique) sont stockées
        uniquement dans ce navigateur. Exporte régulièrement une sauvegarde pour ne rien perdre en cas
        de changement d&apos;appareil ou de navigateur.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="inline-btn" onClick={handleExport} disabled={busy}>
          📤 Exporter mes données
        </button>
        <label className="file-input-label">
          📥 Importer une sauvegarde
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            disabled={busy}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {status && (
        <div className="empty-hint" style={{ color: "var(--good)", marginTop: 14, padding: 0 }}>
          {status}
        </div>
      )}
      {error && (
        <div className="empty-hint" style={{ color: "var(--pulse)", marginTop: 14, padding: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
