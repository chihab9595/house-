// Format du fichier de sauvegarde exporté/importé sur /parametres.
// Les fichiers de cours (Blob) ne sont pas sérialisables tels quels en JSON,
// donc on les encode en data URL base64 pour l'export et on les redécode à
// l'import.

import type { Annale } from "./annaleTypes";
import type { Course, CourseModule } from "./courseTypes";
import type { ActivityEvent } from "./eventTypes";
import type { Exam } from "./examTypes";
import type { QuizAttempt, Question } from "./quizTypes";
import type { StudySession } from "./studyTypes";

export type BackupCourse = Omit<Course, "file"> & { fileDataUrl: string | null };

export interface BackupData {
  version: 1;
  exportedAt: number;
  modules: CourseModule[];
  courses: BackupCourse[];
  questions: Question[];
  attempts: QuizAttempt[];
  annales: Annale[];
  exams: Exam[];
  studySessions: StudySession[];
  events: ActivityEvent[];
}
