"use client";

// Génération de questions QCM par IA à partir du texte d'un cours ou d'une
// annale. Ne crée jamais de questions directement dans la base — retourne
// des propositions que l'UI (GeneratedQuestionsPanel) fait relire et valider
// par l'utilisateur avant tout enregistrement, vu le risque d'erreur d'une
// IA sur du contenu médical.

import { askAi } from "./aiClient";
import { loadPdfjs } from "./pdfToImages";
import type { Course } from "./courseTypes";

const MAX_SOURCE_CHARS = 12_000;

export interface GeneratedQuestion {
  prompt: string;
  choices: string[];
  correctIndexes: number[];
}

export async function extractCourseText(course: Course): Promise<string> {
  if (!course.file) {
    throw new Error("Ce cours n'a pas de fichier associé — impossible d'en extraire le texte.");
  }

  const type = course.fileType ?? "";
  const name = course.fileName ?? "";

  if (type.startsWith("text/") || /\.(txt|md)$/i.test(name)) {
    return course.file.text();
  }

  if (type === "application/pdf" || /\.pdf$/i.test(name)) {
    return extractPdfText(course.file);
  }

  throw new Error(
    "Génération IA non supportée pour ce type de fichier pour l'instant (PDF ou texte uniquement)."
  );
}

async function extractPdfText(file: Blob): Promise<string> {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  try {
    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pageTexts.push(pageText);
    }

    const fullText = pageTexts.join("\n\n").trim();
    if (fullText.length < 50) {
      throw new Error(
        "Impossible d'extraire du texte de ce PDF — c'est probablement un scan sans texte. Utilise plutôt le scan OCR depuis Annales."
      );
    }
    return fullText;
  } finally {
    await loadingTask.destroy();
  }
}

function isValidGenerated(value: unknown): value is GeneratedQuestion {
  if (typeof value !== "object" || value === null) return false;
  const q = value as Record<string, unknown>;
  if (typeof q.prompt !== "string" || q.prompt.trim().length === 0) return false;
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return false;
  if (!q.choices.every((c) => typeof c === "string" && c.trim().length > 0)) return false;
  if (!Array.isArray(q.correctIndexes) || q.correctIndexes.length === 0) return false;
  if (!q.correctIndexes.every((i) => Number.isInteger(i) && (i as number) >= 0 && (i as number) < 4)) {
    return false;
  }
  if (new Set(q.correctIndexes).size !== q.correctIndexes.length) return false;
  return true;
}

export async function generateQuestionsFromText(
  sourceText: string,
  count: number
): Promise<GeneratedQuestion[]> {
  const trimmed = sourceText.trim();
  if (trimmed.length < 50) {
    throw new Error("Le texte source est trop court pour générer des questions fiables.");
  }

  const truncated = trimmed.length > MAX_SOURCE_CHARS;
  const text = truncated ? trimmed.slice(0, MAX_SOURCE_CHARS) : trimmed;

  const prompt = [
    "Tu es un générateur de questions de type QCM pour des étudiants en médecine, à partir du texte de cours ci-dessous.",
    `Génère exactement ${count} questions à choix multiples en français, basées uniquement sur les informations présentes dans ce texte — n'invente rien qui n'y figure pas.`,
    "Chaque question doit avoir exactement 4 propositions de réponse. Indique le ou les index (0 à 3) des bonnes réponses ; il peut y en avoir plusieurs.",
    "",
    'Réponds uniquement avec un objet JSON strictement de cette forme (aucun texte autour) :',
    '{"questions":[{"prompt":"...","choices":["...","...","...","..."],"correctIndexes":[0]}]}',
    "",
    "Texte du cours :",
    '"""',
    text,
    '"""',
  ].join("\n");

  const response = await askAi(
    [
      {
        role: "system",
        content: "Tu réponds uniquement en JSON valide, sans aucun texte ni markdown autour.",
      },
      { role: "user", content: prompt },
    ],
    // maxTokens généreux : le modèle par défaut est un modèle "reasoning" qui
    // consomme une bonne partie du budget en raisonnement interne avant de
    // produire le JSON final, surtout pour un nombre de questions élevé.
    { jsonMode: true, temperature: 0.3, maxTokens: 6000 }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error("L'IA n'a pas renvoyé un JSON valide. Réessaie.");
  }

  const questionsRaw =
    typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : [];

  const valid = questionsRaw.filter(isValidGenerated);
  if (valid.length === 0) {
    throw new Error("L'IA n'a proposé aucune question exploitable. Réessaie, ou avec un texte plus riche.");
  }

  return valid;
}
