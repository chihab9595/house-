"use client";

// Deux modes IA à partir du texte d'un cours ou d'une annale :
//  - génération : invente de nouvelles questions QCM sur le thème (cours).
//  - extraction : repère les vraies questions déjà présentes dans le texte
//    (annales scannées) et n'invente jamais une bonne réponse qu'elle ne
//    peut pas vérifier via un corrigé présent dans le texte — dans ce cas
//    correctIndexes est renvoyé vide et l'utilisateur doit la compléter
//    lui-même dans l'écran de relecture.
// Ne crée jamais de questions directement dans la base — retourne des
// propositions que l'UI (GeneratedQuestionsPanel) fait relire et valider
// par l'utilisateur avant tout enregistrement, vu le risque d'erreur d'une
// IA sur du contenu médical.

import { askAi } from "./aiClient";
import { loadPdfjs } from "./pdfToImages";
import type { Course } from "./courseTypes";

const MAX_SOURCE_CHARS = 12_000;
const MAX_EXTRACTED_QUESTIONS = 20;

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

function isValidQuestionShape(value: unknown): value is GeneratedQuestion {
  if (typeof value !== "object" || value === null) return false;
  const q = value as Record<string, unknown>;
  if (typeof q.prompt !== "string" || q.prompt.trim().length === 0) return false;
  if (!Array.isArray(q.choices) || q.choices.length !== 4) return false;
  if (!q.choices.every((c) => typeof c === "string" && c.trim().length > 0)) return false;
  // correctIndexes peut être vide (cas "extraction" sans corrigé trouvé) —
  // seule contrainte : si présent, chaque index doit être valide et unique.
  if (!Array.isArray(q.correctIndexes)) return false;
  if (!q.correctIndexes.every((i) => Number.isInteger(i) && (i as number) >= 0 && (i as number) < 4)) {
    return false;
  }
  if (new Set(q.correctIndexes).size !== q.correctIndexes.length) return false;
  return true;
}

async function callQuestionAi(prompt: string, maxTokens: number): Promise<GeneratedQuestion[]> {
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
    // produire le JSON final, surtout pour un texte ou un nombre de questions élevé.
    { jsonMode: true, temperature: 0.3, maxTokens }
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

  return questionsRaw.filter(isValidQuestionShape);
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

  const valid = await callQuestionAi(prompt, 6000);
  if (valid.length === 0) {
    throw new Error("L'IA n'a proposé aucune question exploitable. Réessaie, ou avec un texte plus riche.");
  }
  return valid;
}

export async function extractQuestionsFromAnnaleText(sourceText: string): Promise<GeneratedQuestion[]> {
  const trimmed = sourceText.trim();
  if (trimmed.length < 50) {
    throw new Error("Le texte extrait est trop court pour y repérer des questions.");
  }

  const truncated = trimmed.length > MAX_SOURCE_CHARS;
  const text = truncated ? trimmed.slice(0, MAX_SOURCE_CHARS) : trimmed;

  const prompt = [
    "Voici le texte issu de l'OCR d'une annale d'examen de médecine (il peut contenir des erreurs de reconnaissance de caractères).",
    `Identifie TOUTES les questions à choix multiples déjà présentes dans ce texte, jusqu'à ${MAX_EXTRACTED_QUESTIONS} maximum — n'en invente aucune, transcris uniquement celles qui existent réellement.`,
    "Pour chaque question, extrais l'énoncé et les propositions de réponse. Utilise toujours exactement 4 propositions : si le texte en donne plus, garde les 4 plus pertinentes ; s'il en donne moins ou si le format n'est pas exploitable en QCM, ignore cette question.",
    "Si une correction ou un corrigé indiquant les bonnes réponses figure dans le texte (même à la fin, séparément des questions), utilise-le pour renseigner correctIndexes.",
    "Si aucune correction n'est disponible pour une question donnée, renvoie correctIndexes comme un tableau VIDE pour cette question — n'invente jamais une bonne réponse que tu ne peux pas vérifier dans le texte fourni.",
    "",
    'Réponds uniquement avec un objet JSON strictement de cette forme (aucun texte autour) :',
    '{"questions":[{"prompt":"...","choices":["...","...","...","..."],"correctIndexes":[0]}]}',
    "",
    "Texte de l'annale :",
    '"""',
    text,
    '"""',
  ].join("\n");

  const valid = await callQuestionAi(prompt, 7000);
  if (valid.length === 0) {
    throw new Error(
      "Aucune question exploitable n'a été repérée dans ce texte. Le texte OCR est peut-être trop imprécis, ou ne contient pas de QCM identifiable."
    );
  }
  return valid;
}
