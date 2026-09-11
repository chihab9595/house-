"use client";

// Extraction de texte natif depuis un cours (PDF ou texte brut), pour
// alimenter le mode "parse" déterministe (lib/qcmParser.ts) sur un cours
// importé — pas d'IA ici, juste de la lecture de fichier.

import { loadPdfjs } from "./pdfToImages";
import type { Course } from "./courseTypes";

export interface GeneratedQuestion {
  prompt: string;
  choices: string[];
  correctIndexes: number[];
  // Renseigné uniquement par parseQuestionsFromPlainText (lib/qcmParser.ts)
  // quand le texte collé contient des séparateurs de cours ("=== Nom ===").
  courseName?: string;
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

  throw new Error("Extraction non supportée pour ce type de fichier pour l'instant (PDF ou texte uniquement).");
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
