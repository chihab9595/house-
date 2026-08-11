"use client";

import { useAiStatus } from "@/lib/useAiStatus";

export default function AiStatusPanel() {
  const { loading, configured } = useAiStatus();

  return (
    <div className="panel">
      <div className="panel-title">Assistant IA (OpenRouter)</div>
      <div className="stat-row">
        <span className="k">Statut</span>
        <span className={`v ${loading ? "" : configured ? "good" : "warn"}`}>
          {loading ? "…" : configured ? "Configuré" : "Non configuré"}
        </span>
      </div>
      {!loading && !configured && (
        <div className="empty-hint" style={{ padding: "10px 0 0" }}>
          Ajoute ta clé gratuite (openrouter.ai → profil → Keys) dans le fichier{" "}
          <code className="mono">.env.local</code> à la racine du projet
          (<code className="mono">OPENROUTER_API_KEY=...</code>), puis redémarre{" "}
          <code className="mono">npm run dev</code>. Sans clé, l&apos;assistant reste utilisable en
          mode basique (réponses sur tes données uniquement, sans génération libre ni questions
          auto-générées).
        </div>
      )}
    </div>
  );
}
