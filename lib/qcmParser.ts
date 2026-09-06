// Extraction déterministe de QCM depuis du texte structuré (sans IA) — pour
// les documents qui suivent un format cohérent : questions numérotées
// ("1. Énoncé…"), propositions lettrées ("A. …" à "E. …" ou plus), et
// éventuellement un corrigé séparé sous la forme "1-B", "2 - C", ou le
// format compact d'un cahier de contrôle "1ac", "2abcd" (plusieurs bonnes
// réponses par question, sans séparateur).
// N'invente jamais de bonne réponse : correctIndexes reste vide si aucun
// corrigé correspondant n'est trouvé dans le texte (même règle que le mode
// IA "extract" — l'écran de relecture gère le reste).
//
// Un cahier de contrôle regroupe souvent ses questions par cours, chacun
// avec sa propre numérotation qui repart à 1 — d'où le support d'un
// séparateur "=== Nom du cours ===" (produit par le prompt de mise en forme
// recommandé à l'utilisateur) : le texte est d'abord découpé en sections sur
// ce marqueur, puis chaque section est analysée indépendamment comme un
// mini-document (sa propre numérotation, son propre corrigé), avant que les
// questions résultantes ne soient étiquetées avec le nom de leur cours.
//
// Ciblé sur un format donné plutôt qu'universel : fonctionne très bien sur un
// modèle de document cohérent (comme un cahier de contrôle toujours mis en
// forme pareil), mais peut manquer des questions sur un texte au format très
// différent — dans ce cas, préférer le mode IA.
//
// Fonctionne au niveau du flux de caractères plutôt que ligne par ligne pour
// les questions/propositions : l'extraction PDF native (pdf.js) ne préserve
// aucun saut de ligne à l'intérieur d'une page (tout le texte d'une page
// devient une seule longue chaîne), alors qu'un texte collé ou océrisé en a
// — un découpage par ligne échouerait silencieusement sur le premier cas.
// Le corrigé, lui, est toujours cherché ligne par ligne d'abord (il n'a de
// sens que comme ligne isolée), avec un repli sur le flux de caractères
// quand le texte source n'a justement aucun saut de ligne exploitable.

import type { GeneratedQuestion } from "./questionGenerator";

// Un marqueur de question/proposition est un numéro ou une lettre suivi d'un
// séparateur (point, tiret, parenthèse fermante) puis d'un espace — précédé
// par un début de texte ou un espace (jamais au milieu d'un mot/nombre).
const TOP_LEVEL_MARKER_RE = /(?:^|\s)(\d{1,3})\s*[-.)]\s*/g;
const CHOICE_MARKER_RE = /(?:^|\s)([A-E])\s*[-.)]\s*/g;
// Ligne de corrigé : un numéro suivi d'une ou plusieurs lettres A-E (majuscule
// ou minuscule), séparateur optionnel — couvre aussi bien "1-B" / "2 . C" que
// le format compact d'un cahier de contrôle "1ac" / "2abcd" (plusieurs bonnes
// réponses collées, sans séparateur).
const CORRIGE_LINE_RE = /^(\d{1,3})\s*[-.:)]?\s*([A-Ea-e]{1,5})\s*$/;
const INLINE_CORRIGE_RE = /(?:^|\s)(\d{1,3})\s*[-.:)]?\s*([A-Ea-e]{1,5})(?=\s|$)/g;
// Codes de référence parasites type "(Q27 Unité-5 2025)" — annotation entre
// parenthèses contenant une année à 4 chiffres (20xx).
const NOISE_SPAN_RE = /\([^()]{0,60}20\d{2}[^()]{0,20}\)/g;
// Ligne ne contenant qu'une année isolée (20xx), sans parenthèses — repère
// fréquent dans un cahier de contrôle qui regroupe des questions par année
// d'examen, mais qui ne fait partie ni d'un énoncé ni d'un corrigé.
const YEAR_ONLY_LINE_RE = /^\s*20\d{2}\s*$/;
// Tolère une lettre de proposition sans ponctuation en tout début de ligne
// ("C Permet…" au lieu de "C. Permet…") — coquille fréquente dans un texte
// tapé ou copié à la main. Ancré au vrai début de ligne (et non "après une
// espace" comme CHOICE_MARKER_RE) pour ne jamais confondre une lettre isolée
// au milieu d'une phrase (ex. "groupe A") avec un marqueur de proposition.
const BARE_CHOICE_LETTER_RE = /^([A-E])[ \t]+(?=[A-ZÀ-ÖØ-Ý])/gm;
// Séparateur de cours : une ligne "=== Nom du cours ===" (2 signes "=" ou
// plus de chaque côté, espaces tolérées).
const COURSE_HEADER_RE = /^={2,}\s*(.+?)\s*={2,}$/;

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

// "ac" -> [0, 2], "ABCD" -> [0, 1, 2, 3]. Une seule lettre pour un corrigé
// classique, plusieurs pour le format compact multi-réponses.
function letterGroupToIndexes(letters: string): number[] {
  return [...letters.toUpperCase()].map((ch) => ch.charCodeAt(0) - "A".charCodeAt(0));
}

// Découpe le texte en sections sur les séparateurs "=== Nom du cours ===".
// Le texte avant le tout premier séparateur (ou l'unique section s'il n'y en
// a aucun) a courseName undefined — cas normal d'un simple collage sans
// notion de cours, qui doit continuer à fonctionner exactement comme avant.
function splitByCourse(rawText: string): { courseName: string | undefined; text: string }[] {
  const sections: { courseName: string | undefined; text: string }[] = [];
  let currentName: string | undefined;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentLines.length > 0) sections.push({ courseName: currentName, text: currentLines.join("\n") });
    currentLines = [];
  };

  for (const line of rawText.split(/\r?\n/)) {
    const header = clean(line).match(COURSE_HEADER_RE);
    if (header) {
      flush();
      currentName = header[1];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return sections;
}

export function parseQuestionsFromPlainText(rawText: string): GeneratedQuestion[] {
  return splitByCourse(rawText).flatMap(({ courseName, text }) =>
    parseSection(text).map((q) => (courseName ? { ...q, courseName } : q))
  );
}

function parseSection(rawText: string): GeneratedQuestion[] {
  // 1) Isole le corrigé ligne par ligne AVANT toute autre analyse : une ligne
  //    reconnue comme corrigé (ou comme simple repère d'année) est retirée du
  //    texte, sinon elle pollue le prompt ou la dernière proposition de la
  //    question qui la précède (elle n'a alors plus de marqueur suivant pour
  //    borner sa fin).
  const answerByNumber = new Map<number, number[]>();
  const keptLines: string[] = [];
  for (const line of rawText.split(/\r?\n/)) {
    const cleaned = clean(line);
    const corrige = cleaned.match(CORRIGE_LINE_RE);
    if (corrige) {
      const num = parseInt(corrige[1], 10);
      if (!answerByNumber.has(num)) answerByNumber.set(num, letterGroupToIndexes(corrige[2]));
      continue;
    }
    if (YEAR_ONLY_LINE_RE.test(cleaned)) continue;
    keptLines.push(line);
  }

  let text = keptLines.join("\n").replace(NOISE_SPAN_RE, " ");
  text = text.replace(BARE_CHOICE_LETTER_RE, "$1. ");

  // Repli pour un texte sans saut de ligne exploitable (extraction PDF
  // native) : si aucune ligne de corrigé n'a été trouvée, cherche le même
  // motif directement dans le flux de caractères.
  if (answerByNumber.size === 0) {
    let m: RegExpExecArray | null;
    INLINE_CORRIGE_RE.lastIndex = 0;
    while ((m = INLINE_CORRIGE_RE.exec(text))) {
      const num = parseInt(m[1], 10);
      if (!answerByNumber.has(num)) answerByNumber.set(num, letterGroupToIndexes(m[2]));
    }
  }

  const allTopLevel = findMarkers(text, TOP_LEVEL_MARKER_RE).map((m) => ({ ...m, num: parseInt(m.value, 10) }));

  // Un marqueur numéroté n'ouvre une NOUVELLE question que si son numéro est
  // au moins égal au prochain numéro attendu — ce qui distingue une vraie
  // question ("6. Question…") d'un sous-item interne qui repart en arrière
  // ("1- Les dendrites…").
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

  return drafts.map((q, i) => {
    const questionNumber = i + 1;
    const answerIndexes = answerByNumber.get(questionNumber) ?? [];
    const correctIndexes = answerIndexes.filter((idx) => idx >= 0 && idx < q.choices.length);
    return { prompt: q.prompt, choices: q.choices, correctIndexes };
  });
}
