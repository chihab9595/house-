// Type pour les sessions d'étude chronométrées (pour l'instant : durée d'une
// session de quiz du début à la fin ; d'autres sources pourront s'ajouter
// plus tard, ex. temps de lecture d'un cours).

export interface StudySession {
  id: string;
  moduleId: string;
  durationSeconds: number;
  date: string; // format ISO "yyyy-mm-dd" (jour où la session a eu lieu)
  createdAt: number;
}
