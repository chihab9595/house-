// Icône décorative devinée à partir du nom du module (thème "Lumière"
// uniquement) — purement visuel, ne modifie ni ne stocke rien. Repli
// générique si aucun mot-clé ne correspond, plutôt que de deviner au hasard.

import type { ComponentType } from "react";
import {
  IconBacteria,
  IconBandage,
  IconBaby,
  IconBone,
  IconBrain,
  IconBook,
  IconDroplet,
  IconEar,
  IconEye,
  IconFlower,
  IconHeart,
  IconKidney,
  IconLungs,
  IconPill,
  IconPuzzle,
  IconStomach,
  type IconProps,
} from "@/components/icons/Icons";

export interface ModuleIconMatch {
  Icon: ComponentType<IconProps>;
  bg: string;
  fg: string;
}

const FALLBACK: ModuleIconMatch = { Icon: IconBook, bg: "#e7e9fb", fg: "#5b5fc7" };

const KEYWORD_ICONS: [RegExp, ModuleIconMatch][] = [
  [/cardio/i, { Icon: IconHeart, bg: "#fde2e7", fg: "#e0405f" }],
  [/digesti|gastro|hépato|foie/i, { Icon: IconStomach, bg: "#fde2e7", fg: "#e0405f" }],
  [/hémato|sang/i, { Icon: IconDroplet, bg: "#fde2e7", fg: "#d6335a" }],
  [/pneumo|respir|pulmo/i, { Icon: IconLungs, bg: "#dbeafe", fg: "#2f6fed" }],
  [/pharmaco|médicament/i, { Icon: IconPill, bg: "#fef3c7", fg: "#d97706" }],
  [/neuro/i, { Icon: IconBrain, bg: "#ede9fe", fg: "#7c5cf7" }],
  [/uro|néphro|rein/i, { Icon: IconKidney, bg: "#dcfce7", fg: "#16a34a" }],
  [/gynéco|obstétri/i, { Icon: IconFlower, bg: "#fce7f3", fg: "#db2777" }],
  [/pédiatr/i, { Icon: IconBaby, bg: "#fef3c7", fg: "#d97706" }],
  [/dermato|peau/i, { Icon: IconBandage, bg: "#ffedd5", fg: "#ea580c" }],
  [/ophtalmo|œil|yeux/i, { Icon: IconEye, bg: "#dbeafe", fg: "#2f6fed" }],
  [/orl|oto|rhino/i, { Icon: IconEar, bg: "#ede9fe", fg: "#7c5cf7" }],
  [/immuno|infectio/i, { Icon: IconBacteria, bg: "#dcfce7", fg: "#16a34a" }],
  [/anatomie/i, { Icon: IconBone, bg: "#f1f5f9", fg: "#64748b" }],
  [/psychiatr|psycho/i, { Icon: IconPuzzle, bg: "#ede9fe", fg: "#7c5cf7" }],
];

export function iconForModuleName(name: string): ModuleIconMatch {
  const match = KEYWORD_ICONS.find(([re]) => re.test(name));
  return match ? match[1] : FALLBACK;
}
