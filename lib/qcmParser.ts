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
//
// Fonctionne au niveau du flux de caractères plutôt que ligne par ligne :
// l'extraction PDF native (pdf.js) ne préserve aucun saut de ligne à
// l'intérieur d'une page (tout le texte d'une page devient une seule longue
// chaîne), alors qu'un texte collé ou océrisé en a — un découpage par ligne
// échouerait silencieusement sur le premier cas.

import type { GeneratedQuestion } from "./questionGenerator";

// Un marqueur de question/proposition est un numéro ou une lettre suivi d'un
// séparateur (point, tiret, parenthèse fermante) puis d'un espace — précédé
// par un début de texte ou un espace (jamais au milieu d'un mot/nombre).
const TOP_LEVEL_MARKER_RE = /(?:^|\s)(\d{1,3})\s*[-.)]\s*/g;
const CHOICE_MARKER_RE = /(?:^|\s)([A-E])\s*[-.)]\s*/g;
const CORRIGE_RE = /^(\d{1,3})\s*[-.]\s*([A-E])\s*$/;
// Codes de référence parasites type "(Q27 Unité-5 2025)" — annotation entre
// parenthèses contenant une année à 4 chiffres (20xx).
const NOISE_SPAN_RE = /\([^()]{0,60}20\d{2}[^()]{0,20}\)/g;

interface Marker {
  index: number;
  value: string;
  contentStart: number;
}

function findMarkers(text: string, re: RegExp): Marker[] {
  const markers: Marker[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text))) {
    markers.push({ index: m.index, value: m[1], contentStart: m.index + m[0].length });
    // Évite les boucles infinies sur un match de longueur nulle (ne devrait
    // pas arriver avec ce pattern, mais reste défensif).
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  return markers;
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function parseQuestionsFromPlainText(rawText: string): GeneratedQuestion[] {
  const text = rawText.replace(NOISE_SPAN_RE, " ");

  const allTopLevel = findMarkers(text, TOP_LEVEL_MARKER_RE).map((m) => ({ ...m, num: parseInt(m.value, 10) }));

  // Un marqueur numéroté n'ouvre une NOUVELLE question que si son numéro est
  // au moins égal au prochain numéro attendu — ce qui distingue une vraie
  // question ("6. Question…") d'un sous-item interne qui repart en arrière
  // ("1- Les dendrites…", ou une ligne de corrigé "1-B" après la question 6).
  const topLevel: typeof allTopLevel = [];
  let expectedNext = 1;
  for (const marker of allTopLevel) {
    if (marker.num >= expectedNext) {
      topLevel.push(marker);
      expectedNext = marker.num + 1;
    }
  }

  const drafts: { prompt: string; choices: string[] }[] = [];
  for (let i = 0; i < topLevel.length; i++) {
    const start = topLevel[i].contentStart;
    const end = i + 1 < topLevel.length ? topLevel[i + 1].index : text.length;
    const span = text.slice(start, end);

    const choiceMarkers = findMarkers(span, CHOICE_MARKER_RE);
    if (choiceMarkers.length < 2) continue;

    const prompt = clean(span.slice(0, choiceMarkers[0].index));
    const choices: string[] = [];
    for (let c = 0; c < choiceMarkers.length; c++) {
      const cStart = choiceMarkers[c].contentStart;
      const cEnd = c + 1 < choiceMarkers.length ? choiceMarkers[c + 1].index : span.length;
      const choiceText = clean(span.slice(cStart, cEnd));
      if (choiceText.length > 0) choices.push(choiceText);
    }

    if (prompt.length === 0 || choices.length < 2 || choices.length > 6) continue;
    drafts.push({ prompt, choices });
  }

  // Corrigé best-effort : cherche des segments "N-B" / "N. C" isolés entre
  // deux marqueurs de question (souvent un tableau ou une liste séparée) et
  // les associe à la Nième question extraite, par position.
  const answerByNumber = new Map<number, number>();
  for (const line of text.split(/\r?\n/)) {
    const m = clean(line).match(CORRIGE_RE);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    const letterIndex = m[2].charCodeAt(0) - "A".charCodeAt(0);
    if (!answerByNumber.has(num)) answerByNumber.set(num, letterIndex);
  }
  // Repli supplémentaire pour un texte sans saut de ligne (PDF natif) : cherche
  // aussi ces mêmes motifs de corrigé directement dans le flux, encadrés
  // d'espaces plutôt que de sauts de ligne.
  if (answerByNumber.size === 0) {
    const inlineCorrigeRe = /(?:^|\s)(\d{1,3})\s*[-.]\s*([A-E])(?=\s|$)/g;
    let m: RegExpExecArray | null;
    inlineCorrigeRe.lastIndex = 0;
    while ((m = inlineCorrigeRe.exec(text))) {
      const num = parseInt(m[1], 10);
      const letterIndex = m[2].charCodeAt(0) - "A".charCodeAt(0);
      if (!answerByNumber.has(num)) answerByNumber.set(num, letterIndex);
    }
  }

  return drafts.map((q, i) => {
    const questionNumber = i + 1;
    const answerIndex = answerByNumber.get(questionNumber);
    const correctIndexes =
      answerIndex !== undefined && answerIndex >= 0 && answerIndex < q.choices.length ? [answerIndex] : [];
    return { prompt: q.prompt, choices: q.choices, correctIndexes };
  });
}
