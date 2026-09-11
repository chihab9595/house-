"use client";

import { useState, type FormEvent } from "react";

interface ExamFormProps {
  onCreate: (name: string, date: string) => Promise<void>;
}

export default function ExamForm({ onCreate }: ExamFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    setSaving(true);
    setError(null);
    try {
      // Attend la confirmation avant de vider le formulaire — sinon un échec
      // silencieux fait perdre le contrôle qu'on vient de saisir sans que
      // rien ne le signale.
      await onCreate(name, date);
      setName("");
      setDate("");
    } catch {
      setError("Échec de l'ajout du contrôle — réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit} style={{ flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Nom du contrôle…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flexBasis: 180 }}
        disabled={saving}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="date-input"
        disabled={saving}
      />
      <button type="submit" className="inline-btn" disabled={!name.trim() || !date || saving}>
        {saving ? "Ajout…" : "Ajouter"}
      </button>
      {error && (
        <div className="empty-hint" style={{ color: "var(--pulse)", width: "100%" }}>
          {error}
        </div>
      )}
    </form>
  );
}
