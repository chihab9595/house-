// Types partagés pour les données encore décoratives du dashboard HOUSE
// (navigation, météo) — les données métier réelles vivent dans leurs propres
// fichiers *Types.ts (courseTypes, quizTypes, examTypes, annaleTypes, etc.).

export interface NavModule {
  label: string;
  href: string;
}

export interface QuickCommand {
  label: string;
  href: string;
}

export interface WeatherDay {
  day: string;
  temp: number;
}

export interface Weather {
  temp: number;
  location: string;
  icon: string;
  week: WeatherDay[];
}
