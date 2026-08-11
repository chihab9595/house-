// Type pour les sessions d'étude chronométrées : soit une session de quiz
// (début→fin de la session), soit une session de lecture de cours (bouton
// Commencer/Terminer la lecture).

export type StudySource = "quiz" | "reading";

export interface StudySession {
  id: string;
  moduleId: string;
  durationSeconds: number;
  date: string; // format ISO "yyyy-mm-dd" (jour où la session a eu lieu)
  source: StudySource;
  createdAt: number;
}
