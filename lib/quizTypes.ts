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
