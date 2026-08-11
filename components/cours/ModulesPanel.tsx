"use client";

import { useState, type FormEvent } from "react";
import type { CourseModule } from "@/lib/courseTypes";

interface ModulesPanelProps {
  modules: CourseModule[];
  selectedModuleId: string | null;
  onSelect: (moduleId: string) => void;
  onCreate: (name: string) => void;
  onRemove: (moduleId: string) => void;
}

export default function ModulesPanel({
  modules,
  selectedModuleId,
  onSelect,
  onCreate,
  onRemove,
}: ModulesPanelProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name);
    setName("");
  }

  return (
    <div className="panel">
      <div className="panel-title">Modules</div>

      {modules.length === 0 ? (
        <div className="empty-hint">Aucun module pour cette année. Ajoute-en un pour commencer à importer des cours.</div>
      ) : (
        <div className="entity-list">
          {modules.map((m) => (
            <div
              key={m.id}
              className={`entity-item ${m.id === selectedModuleId ? "active" : ""}`}
              onClick={() => onSelect(m.id)}
            >
              <span className="name">{m.name}</span>
              <button
                type="button"
                className="remove"
                aria-label={`Supprimer ${m.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Supprimer le module « ${m.name} » et tous ses cours ?`)) {
                    onRemove(m.id);
                  }
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nouveau module…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="inline-btn" disabled={!name.trim()}>
          Ajouter
        </button>
      </form>
    </div>
  );
}
