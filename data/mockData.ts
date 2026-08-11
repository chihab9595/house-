// Données fictives pour le tableau de bord HOUSE.
// Seront remplacées par les données réelles issues de l'import de cours,
// du scan d'annales et du suivi de progression.

import type { NavModule, QuickCommand, Weather } from "@/lib/types";

export const navModules: NavModule[] = [
  { label: "Tableau de bord", href: "/" },
  { label: "Assistant IA", href: "/assistant" },
  { label: "Mes cours", href: "/cours" },
  { label: "Annales scannées", href: "/annales" },
  { label: "Sessions de révision", href: "/revision" },
  { label: "Planning", href: "/planning" },
  { label: "Paramètres", href: "/parametres" },
];

export const topNav: NavModule[] = [
  { label: "ACCUEIL", href: "/" },
  { label: "MES COURS", href: "/cours" },
  { label: "ANNALES", href: "/annales" },
  { label: "PROGRESSION", href: "/progression" },
  { label: "PLANNING", href: "/planning" },
];

export const quickCommands: QuickCommand[] = [
  { label: "Réviser la cardiologie", href: "/revision" },
  { label: "Planifier mon contrôle", href: "/planning" },
  { label: "Voir mes points faibles", href: "/progression" },
  { label: "Scanner une annale", href: "/annales" },
];

export const weather: Weather = {
  temp: 21,
  location: "Annaba, DZ",
  icon: "☁️",
  week: [
    { day: "LUN", temp: 23 },
    { day: "MAR", temp: 24 },
    { day: "MER", temp: 22 },
    { day: "JEU", temp: 22 },
  ],
};

export const ekgPoints =
  "0,20 60,20 80,20 90,4 100,36 110,20 140,20 200,20 220,20 230,8 240,32 250,20 280,20 340,20 360,20 370,4 380,36 390,20 420,20 480,20 500,20 510,8 520,32 530,20 600,20";
