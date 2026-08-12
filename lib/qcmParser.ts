// Extraction déterministe de QCM depuis du texte structuré (sans IA) — pour
// les documents qui suivent un format cohérent : questions numérotées
// ("1. Énoncé…"), propositions lettrées ("A. …" à "E. …" ou plus), et
// éventuellement un corrigé séparé sous la forme "1-B", "2 - C", etc.
// N'invente jamais de bonne réponse : correctIndexes reste vide si aucun
// corrigé correspondant n'est trouvé dans le texte (même règle que le mode
// IA "extract" — l'écran de relecture gère le reste).
//
// Ciblé sur un format donné plutôt qu'universel : fonctionne très bien sur un
// modèle de document cohérent (comme un cahier de contrôle toujours mis en
// forme pareil), mais peut manquer des questions sur un texte au format très
// différent — dans ce cas, préférer le mode IA.

import type { GeneratedQuestion } from "./questionGenerator";

// Accepte "N." ou "N)" ou "N-" comme numérotation de question — le style
// varie d'un document à l'autre (certains utilisent le tiret aussi bien pour
// les questions que pour des sous-listes internes). La distinction entre une
// vraie nouvelle question et un sous-item numéroté ne se fait donc pas sur la
// ponctuation mais sur la suite logique du numéro (voir plus bas).
const TOP_LEVEL_RE = /^(\d{1,3})\s*[-.)]\s*(.+)$/;
const CHOICE_RE = /^([A-E])\s*[-.)]\s*(.*)$/;
const CORRIGE_RE = /^(\d{1,3})\s*[-.]\s*([A-E])\b/;
// Ligne de bruit type "(Q27 Unité-5 2025)" ou variantes mal océrisées
// ("1026 Unité-5 2025)", "(028 Unité-5 2025)") — courte et contenant une
// année à 4 chiffres (20xx).
const NOISE_LINE_RE = /^.{0,50}20\d{2}.{0,15}$/;

interface DraftQuestion {
  promptLines: string[];
  choices: string[];
}

function isNoiseLine(line: string): boolean {
  return NOISE_LINE_RE.test(line) && !CHOICE_RE.test(line) && !TOP_LEVEL_RE.test(line);
}

function finalizeDraft(draft: DraftQuestion): { prompt: string; choices: string[] } | null {
  const prompt = draft.promptLines.join(" ").replace(/\s+/g, " ").trim();
  const choices = draft.choices.map((c) => c.replace(/\s+/g, " ").trim()).filter((c) => c.length > 0);
  if (prompt.length === 0 || choices.length < 2 || choices.length > 6) return null;
  return { prompt, choices };
}

// Sépare une ligne contenant plusieurs propositions collées sans saut de
// ligne (ex: "C. (4,5). D. (2,5).") en plusieurs lignes, une par proposition —
// artefact fréquent d'un copier-coller depuis un PDF à deux colonnes.
function splitEmbeddedChoices(line: string): string[] {
  if (CHOICE_RE.test(line)) {
    const parts = line.split(/(?=\s[A-E][-.)]\s)/);
    if (parts.length > 1) {
      return [parts[0].trim(), ...parts.slice(1).map((p) => p.trim())];
    }
  }
  return [line];
}

export function parseQuestionsFromPlainText(text: string): GeneratedQuestion[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .flatMap(splitEmbeddedChoices);

  const drafts: DraftQuestion[] = [];
  let current: DraftQuestion | null = null;
  // Une ligne numérotée n'est une NOUVELLE question que si son numéro est au
  // moins égal au prochain numéro attendu — ce qui distingue "6. Question…"
  // (nouvelle question) de "1- Les dendrites…" juste après (sous-item interne,
  // le numéro repart en arrière) quel que soit le style de ponctuation utilisé.
  let expectedNext = 1;

  for (const line of lines) {
    if (isNoiseLine(line)) continue;

    const topLevelMatch = line.match(TOP_LEVEL_RE);
    const num = topLevelMatch ? parseInt(topLevelMatch[1], 10) : null;
    if (topLevelMatch && num !== null && (current === null || num >= expectedNext)) {
      if (current) drafts.push(current);
      current = { promptLines: [topLevelMatch[2]], choices: [] };
      expectedNext = num + 1;
      continue;
    }

    const choiceMatch = line.match(CHOICE_RE);
    if (choiceMatch && current) {
      current.choices.push(choiceMatch[2]);
      continue;
    }

    if (!current) continue;

    // Une ligne de corrigé isolée ("1-B") ne doit jamais polluer l'énoncé ou
    // la dernière proposition en cours.
    if (CORRIGE_RE.test(line) && line.length <= 8) continue;

    if (current.choices.length === 0) {
      // Encore dans l'énoncé : les items numérotés ("1- Les dendrites…")
      // en font partie tant qu'aucune proposition lettrée n'a démarré.
      current.promptLines.push(line);
    } else {
      // Suite d'une proposition sur plusieurs lignes (pas de nouvelle lettre).
      current.choices[current.choices.length - 1] += " " + line;
    }
  }
  if (current) drafts.push(current);

  const finalized = drafts.map(finalizeDraft).filter((q): q is { prompt: string; choices: string[] } => q !== null);

  // Corrigé best-effort : cherche des lignes "N-B" / "N. C" isolées dans tout
  // le texte (souvent un tableau ou une liste séparée des questions) et les
  // associe à la Nième question extraite, par position.
  const answerByNumber = new Map<number, number>();
  for (const line of lines) {
    const m = line.match(CORRIGE_RE);
    if (!m) continue;
    // Une ligne de choix ("1. …") ne doit pas être confondue avec un corrigé :
    // le corrigé est court (numéro + lettre, rien d'autre de substantiel après).
    const rest = line.slice(m[0].length).trim();
    if (rest.length > 3 && !/^[).,;:\s]*$/.test(rest)) continue;
    const num = parseInt(m[1], 10);
    const letterIndex = m[2].charCodeAt(0) - "A".charCodeAt(0);
    if (!answerByNumber.has(num)) answerByNumber.set(num, letterIndex);
  }

  return finalized.map((q, i) => {
    const questionNumber = i + 1;
    const answerIndex = answerByNumber.get(questionNumber);
    const correctIndexes =
      answerIndex !== undefined && answerIndex >= 0 && answerIndex < q.choices.length ? [answerIndex] : [];
    return { prompt: q.prompt, choices: q.choices, correctIndexes };
  });
}
