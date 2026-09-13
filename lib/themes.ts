// Registre des thèmes visuels de l'application. Un thème ne change QUE
// l'apparence (variables CSS + agencement de la coquille/du tableau de bord)
// — jamais le fonctionnement ni les données stockées dans IndexedDB.

export type ThemeId = "jarvis" | "clair";

export const THEME_COOKIE = "house-theme";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  swatch: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "jarvis",
    label: "Jarvis",
    description: "Sombre, futuriste, halos cyan — l'ambiance d'origine de HOUSE.",
    swatch: ["#060b14", "#0a1120", "#4de8ff"],
  },
  {
    id: "clair",
    label: "Lumière",
    description: "Clair, épuré, cartes pastel — pour réviser en plein jour.",
    swatch: ["#f7f8fc", "#ffffff", "#6d5bf7"],
  },
];

export const DEFAULT_THEME: ThemeId = "jarvis";

export function isThemeId(value: string | undefined | null): value is ThemeId {
  return value === "jarvis" || value === "clair";
}
