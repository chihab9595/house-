// Icône décorative devinée à partir du nom du module (thème "Lumière"
// uniquement) — purement visuel, ne modifie ni ne stocke rien. Repli
// générique si aucun mot-clé ne correspond, plutôt que de deviner au hasard.

const KEYWORD_ICONS: [RegExp, string][] = [
  [/cardio/i, "❤️"],
  [/digesti|gastro|hépato|foie/i, "🍽️"],
  [/hémato|sang/i, "🩸"],
  [/pneumo|respir|pulmo/i, "🫁"],
  [/pharmaco|médicament/i, "💊"],
  [/neuro/i, "🧠"],
  [/uro|néphro|rein/i, "🩺"],
  [/gynéco|obstétri/i, "🌸"],
  [/pédiatr/i, "🧒"],
  [/dermato|peau/i, "🩹"],
  [/ophtalmo|œil|yeux/i, "👁️"],
  [/orl|oto|rhino/i, "👂"],
  [/immuno|infectio/i, "🦠"],
  [/anatomie/i, "🦴"],
  [/psychiatr|psycho/i, "🧩"],
];

export function iconForModuleName(name: string): string {
  const match = KEYWORD_ICONS.find(([re]) => re.test(name));
  return match ? match[1] : "📘";
}
