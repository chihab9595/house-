// Types pour la banque de questions et les tentatives de quiz,
// stockées localement dans IndexedDB (aucune génération IA pour l'instant :
// les questions sont créées manuellement par l'étudiant, à terme depuis les annales OCR).
//
// QCM à réponses multiples possibles (comme les vraies annales de médecine) :
// une question peut avoir une ou plusieurs bonnes réponses, notée juste
// uniquement si l'étudiant coche exactement l'ensemble des bonnes réponses.

export interface Question {
  id: string;
  moduleId: string;
  // Nom du cours/chapitre dans le module (ex: "Dysphagie", "Troubles de
  // l'hémostase") — optionnel, absent sur les questions créées avant cette
  // fonctionnalité ou ajoutées manuellement sans le préciser. Un simple
  // libellé texte plutôt qu'une relation vers Course (lib/courseTypes.ts) :
  // un cahier de contrôle regroupe des questions par intitulé de cours sans
  // que ce cours ait forcément été importé comme document dans l'app.
  courseName?: string;
  prompt: string;
  choices: string[];
  correctIndexes: number[];
  createdAt: number;
}

export interface AttemptAnswer {
  questionId: string;
  chosenIndexes: number[];
  correct: boolean;
}

export interface QuizAttempt {
  id: string;
  moduleId: string;
  answers: AttemptAnswer[];
  score: number;
  total: number;
  completedAt: number;
}
