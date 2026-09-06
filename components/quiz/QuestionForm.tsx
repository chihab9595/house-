"use client";

import { useState, type FormEvent } from "react";

const EMPTY_CHOICES = ["", "", "", ""];

interface QuestionFormProps {
  onCreate: (prompt: string, choices: string[], correctIndexes: number[], courseName?: string) => void;
}

export default function QuestionForm({ onCreate }: QuestionFormProps) {
  const [prompt, setPrompt] = useState("");
  const [courseName, setCourseName] = useState("");
  const [choices, setChoices] = useState<string[]>(EMPTY_CHOICES);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>([]);

  const isValid =
    prompt.trim().length > 0 && choices.every((c) => c.trim().length > 0) && correctIndexes.length > 0;

  function handleChoiceChange(i: number, value: string) {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  }

  function toggleCorrect(i: number) {
    setCorrectIndexes((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onCreate(
      prompt.trim(),
      choices.map((c) => c.trim()),
      correctIndexes,
      courseName.trim() || undefined
    );
    setPrompt("");
    setCourseName("");
    setChoices(EMPTY_CHOICES);
    setCorrectIndexes([]);
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Énoncé de la question…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <input
        type="text"
        placeholder="Cours (optionnel)…"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />

      <div className="question-choices">
        {choices.map((choice, i) => (
          <label key={i} className="question-choice-row">
            <input
              type="checkbox"
              checked={correctIndexes.includes(i)}
              onChange={() => toggleCorrect(i)}
            />
            <input
              type="text"
              placeholder={`Réponse ${i + 1}…`}
              value={choice}
              onChange={(e) => handleChoiceChange(i, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="empty-hint" style={{ padding: "0 0 8px" }}>
        Coche la ou les bonne(s) réponse(s) — une question peut en avoir plusieurs.
      </div>

      <button type="submit" className="inline-btn" disabled={!isValid}>
        Ajouter la question
      </button>
    </form>
  );
}
