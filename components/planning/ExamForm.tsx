"use client";

import { useState, type FormEvent } from "react";

interface ExamFormProps {
  onCreate: (name: string, date: string) => void;
}

export default function ExamForm({ onCreate }: ExamFormProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onCreate(name, date);
    setName("");
    setDate("");
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit} style={{ flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Nom du contrôle…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flexBasis: 180 }}
      />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-input" />
      <button type="submit" className="inline-btn" disabled={!name.trim() || !date}>
        Ajouter
      </button>
    </form>
  );
}
