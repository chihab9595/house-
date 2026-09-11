// Détection des "points faibles" : une question est faible si sa dernière
// réponse (tous quiz confondus, la plus récente par date) était incorrecte.
// Une question jamais tentée n'est pas "faible", juste "nouvelle" — on ne
// force pas la révision de ce qui n'a simplement jamais été testé.

import type { Question, QuizAttempt } from "./quizTypes";

export function computeWeakQuestionIds(questions: Question[], attempts: QuizAttempt[]): Set<string> {
  const lastCorrectByQuestion = new Map<string, boolean>();
  const lastTimeByQuestion = new Map<string, number>();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const previousTime = lastTimeByQuestion.get(answer.questionId) ?? -1;
      if (attempt.completedAt >= previousTime) {
        lastTimeByQuestion.set(answer.questionId, attempt.completedAt);
        lastCorrectByQuestion.set(answer.questionId, answer.correct);
      }
    }
  }

  const weak = new Set<string>();
  for (const q of questions) {
    if (lastCorrectByQuestion.get(q.id) === false) weak.add(q.id);
  }
  return weak;
}
