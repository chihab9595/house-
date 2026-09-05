"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="panel" style={{ margin: "60px auto", maxWidth: 480, textAlign: "center" }}>
      <p className="panel-title">Erreur</p>
      <h2 className="tech" style={{ fontSize: 20, marginBottom: 8 }}>
        Un problème est survenu
      </h2>
      <p style={{ color: "var(--text-mute)", fontSize: 14, marginBottom: 20 }}>
        Cette page a rencontré une erreur inattendue. Tes cours, annales et résultats
        enregistrés en local ne sont pas affectés.
      </p>
      <button type="button" className="inline-btn" onClick={() => reset()}>
        Réessayer
      </button>
    </div>
  );
}
