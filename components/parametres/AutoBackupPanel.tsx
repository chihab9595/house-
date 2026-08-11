"use client";

import { useEffect, useState } from "react";
import {
  chooseBackupFolder,
  clearBackupFolder,
  getBackupFolderInfo,
  isFsAccessSupported,
  reauthorizeBackupFolder,
  writeBackupNow,
  type BackupFolderInfo,
} from "@/lib/fsBackup";
import { formatImportedDate } from "@/lib/format";

export default function AutoBackupPanel() {
  // null tant que le support navigateur n'est pas vérifié : calculer
  // `isFsAccessSupported()` directement au premier rendu casserait
  // l'hydratation (le serveur n'a pas `window`, le client si).
  const [supported, setSupported] = useState<boolean | null>(null);
  const [info, setInfo] = useState<BackupFolderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const current = await getBackupFolderInfo();
    setInfo(current);
    setLoading(false);
  }

  useEffect(() => {
    setSupported(isFsAccessSupported());
  }, []);

  useEffect(() => {
    if (supported === null) return;
    if (supported) {
      refresh();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  async function handleChoose() {
    setBusy(true);
    setError(null);
    try {
      await chooseBackupFolder();
      await refresh();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError("Impossible d'activer la sauvegarde automatique.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReauthorize() {
    setBusy(true);
    setError(null);
    try {
      const granted = await reauthorizeBackupFolder();
      if (!granted) setError("Autorisation refusée.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await clearBackupFolder();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleBackupNow() {
    setBusy(true);
    setError(null);
    try {
      const ok = await writeBackupNow();
      if (!ok) setError("Échec de la sauvegarde. Réautorise l'accès au dossier.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (supported === null || loading) {
    return (
      <div className="panel">
        <div className="panel-title">Sauvegarde automatique</div>
        <div className="empty-hint">Chargement…</div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="panel">
        <div className="panel-title">Sauvegarde automatique</div>
        <div className="empty-hint">
          Non disponible sur ce navigateur — fonctionne uniquement sur Chrome et Edge. Utilise
          l&apos;export manuel ci-dessous en attendant.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Sauvegarde automatique</div>

      {!info ? (
        <>
          <div className="empty-hint" style={{ padding: "0 0 14px" }}>
            Choisis un dossier sur ton disque : House y écrira automatiquement une sauvegarde à jour à
            chaque changement, sans action de ta part.
          </div>
          <button type="button" className="inline-btn" onClick={handleChoose} disabled={busy}>
            📁 Choisir un dossier
          </button>
        </>
      ) : (
        <>
          <div className="stat-row">
            <span className="k">Dossier</span>
            <span className="v">{info.name}</span>
          </div>
          <div className="stat-row">
            <span className="k">Autorisation</span>
            <span className={`v ${info.permissionGranted ? "good" : "warn"}`}>
              {info.permissionGranted ? "Active" : "À renouveler"}
            </span>
          </div>
          <div className="stat-row">
            <span className="k">Dernière sauvegarde</span>
            <span className="v">{info.updatedAt ? formatImportedDate(info.updatedAt) : "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {!info.permissionGranted && (
              <button type="button" className="inline-btn" onClick={handleReauthorize} disabled={busy}>
                Réautoriser
              </button>
            )}
            <button
              type="button"
              className="inline-btn"
              onClick={handleBackupNow}
              disabled={busy || !info.permissionGranted}
            >
              Sauvegarder maintenant
            </button>
            <button type="button" className="inline-btn" onClick={handleDisable} disabled={busy}>
              Désactiver
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="empty-hint" style={{ color: "var(--pulse)", marginTop: 12, padding: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
