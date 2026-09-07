// Stockage local (IndexedDB) de la bibliothèque de cours de l'utilisateur.
// Pas de backend : tout reste sur l'appareil, y compris les fichiers importés
// (stockés en Blob, ce que localStorage ne permet pas de faire correctement).

import type { Annale } from "./annaleTypes";
import type { BackupCourse, BackupData } from "./backupTypes";
import type { Course, CourseModule } from "./courseTypes";
import { notifyDbChange } from "./dbEvents";
import type { ActivityEvent, ActivityEventType } from "./eventTypes";
import type { Exam } from "./examTypes";
import { formatExamDate } from "./format";
import type { QuizAttempt, Question } from "./quizTypes";
import type { StudySession } from "./studyTypes";

const DB_NAME = "house-db";
const DB_VERSION = 6;
const MODULES_STORE = "modules";
const COURSES_STORE = "courses";
const QUESTIONS_STORE = "questions";
const ATTEMPTS_STORE = "attempts";
const ANNALES_STORE = "annales";
const EXAMS_STORE = "exams";
const STUDY_SESSIONS_STORE = "study_sessions";
const EVENTS_STORE = "events";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MODULES_STORE)) {
        db.createObjectStore(MODULES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(COURSES_STORE)) {
        db.createObjectStore(COURSES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        db.createObjectStore(QUESTIONS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ATTEMPTS_STORE)) {
        db.createObjectStore(ATTEMPTS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ANNALES_STORE)) {
        db.createObjectStore(ANNALES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(EXAMS_STORE)) {
        db.createObjectStore(EXAMS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STUDY_SESSIONS_STORE)) {
        db.createObjectStore(STUDY_SESSIONS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        db.createObjectStore(EVENTS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      // Une future montée de DB_VERSION peut rester bloquée si un autre
      // onglet de la PWA garde une connexion ouverte sur l'ancienne version.
      // Pas de mécanisme de blocage silencieux : au moins un signal diagnostiquable.
      console.warn(
        "HOUSE : mise à jour de la base locale bloquée par un autre onglet ouvert. Ferme les autres onglets de l'application et recharge la page."
      );
    };
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyDbChange();
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyDbChange();
}

function generateId(): string {
  return crypto.randomUUID();
}

async function resolveModuleName(moduleId: string): Promise<string> {
  const modules = await getModules();
  return modules.find((m) => m.id === moduleId)?.name ?? "Module";
}

async function logEvent(type: ActivityEventType, title: string, desc: string): Promise<void> {
  const event: ActivityEvent = { id: generateId(), type, title, desc, createdAt: Date.now() };
  await put(EVENTS_STORE, event);
}

// Le journal d'activité est secondaire : si résoudre le nom du module ou
// écrire l'événement échoue après que la donnée principale (cours, examen,
// annale, tentative) a déjà été enregistrée avec succès, ça ne doit jamais
// faire échouer toute la fonction d'ajout — sinon l'utilisateur voit une
// erreur pour une opération qui a en fait réussi, et risque de la relancer
// en double.
async function logEventBestEffort(
  moduleId: string,
  type: ActivityEventType,
  build: (moduleName: string) => { title: string; desc: string }
): Promise<void> {
  try {
    const moduleName = await resolveModuleName(moduleId);
    const { title, desc } = build(moduleName);
    await logEvent(type, title, desc);
  } catch (err) {
    console.warn("HOUSE : échec de la journalisation d'activité (sans impact sur la donnée déjà enregistrée) :", err);
  }
}

export async function getEvents(): Promise<ActivityEvent[]> {
  return getAll<ActivityEvent>(EVENTS_STORE);
}

export async function getModules(): Promise<CourseModule[]> {
  return getAll<CourseModule>(MODULES_STORE);
}

export async function getCourses(): Promise<Course[]> {
  return getAll<Course>(COURSES_STORE);
}

export async function addModule(yearId: number, name: string): Promise<CourseModule> {
  const courseModule: CourseModule = {
    id: generateId(),
    yearId,
    name,
    createdAt: Date.now(),
  };
  await put(MODULES_STORE, courseModule);
  return courseModule;
}

export async function deleteModule(moduleId: string): Promise<void> {
  const [courses, questions, attempts, annales, exams, studySessions] = await Promise.all([
    getCourses(),
    getQuestions(),
    getAttempts(),
    getAnnales(),
    getExams(),
    getStudySessions(),
  ]);
  // allSettled plutôt que all : si une suppression échoue, on veut quand même
  // avoir tenté toutes les autres (moins d'orphelins qu'un abandon immédiat),
  // puis refuser de supprimer le module tant que ses données ne sont pas
  // toutes parties — un module réapparaîtrait sinon avec des enfants restants
  // qu'aucun écran ne liste, invisibles mais toujours en base.
  const results = await Promise.allSettled([
    ...courses.filter((c) => c.moduleId === moduleId).map((c) => remove(COURSES_STORE, c.id)),
    ...questions.filter((q) => q.moduleId === moduleId).map((q) => remove(QUESTIONS_STORE, q.id)),
    ...attempts.filter((a) => a.moduleId === moduleId).map((a) => remove(ATTEMPTS_STORE, a.id)),
    ...annales.filter((a) => a.moduleId === moduleId).map((a) => remove(ANNALES_STORE, a.id)),
    ...exams.filter((e) => e.moduleId === moduleId).map((e) => remove(EXAMS_STORE, e.id)),
    ...studySessions
      .filter((s) => s.moduleId === moduleId)
      .map((s) => remove(STUDY_SESSIONS_STORE, s.id)),
  ]);
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (failures.length > 0) {
    throw new Error(
      `Suppression incomplète du module : ${failures.length} élément(s) associé(s) n'ont pas pu être supprimés. Réessaie — le module reste en place tant que tout n'a pas été retiré.`
    );
  }
  await remove(MODULES_STORE, moduleId);
}

export async function addCourse(moduleId: string, name: string, file: File | null): Promise<Course> {
  const course: Course = {
    id: generateId(),
    moduleId,
    name,
    fileName: file?.name ?? null,
    fileType: file?.type ?? null,
    fileSize: file?.size ?? null,
    file: file ?? null,
    importedAt: Date.now(),
  };
  await put(COURSES_STORE, course);
  await logEventBestEffort(moduleId, "course_imported", (moduleName) => ({
    title: `Cours importé : ${name}`,
    desc: moduleName,
  }));
  return course;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await remove(COURSES_STORE, courseId);
}

export async function getQuestions(): Promise<Question[]> {
  return getAll<Question>(QUESTIONS_STORE);
}

export async function addQuestion(
  moduleId: string,
  prompt: string,
  choices: string[],
  correctIndexes: number[],
  courseName?: string
): Promise<Question> {
  const question: Question = {
    id: generateId(),
    moduleId,
    courseName: courseName?.trim() || undefined,
    prompt,
    choices,
    correctIndexes,
    createdAt: Date.now(),
  };
  await put(QUESTIONS_STORE, question);
  return question;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await remove(QUESTIONS_STORE, questionId);
}

export async function getAttempts(): Promise<QuizAttempt[]> {
  return getAll<QuizAttempt>(ATTEMPTS_STORE);
}

export async function saveAttempt(attempt: Omit<QuizAttempt, "id">): Promise<QuizAttempt> {
  const full: QuizAttempt = { ...attempt, id: generateId() };
  await put(ATTEMPTS_STORE, full);
  await logEventBestEffort(attempt.moduleId, "quiz_completed", (moduleName) => ({
    title: `Quiz ${moduleName} terminé`,
    desc: `${attempt.score}/${attempt.total} bonnes réponses`,
  }));
  return full;
}

export async function getAnnales(): Promise<Annale[]> {
  return getAll<Annale>(ANNALES_STORE);
}

export async function addAnnale(
  moduleId: string,
  name: string,
  fileName: string | null,
  fileType: string | null,
  extractedText: string
): Promise<Annale> {
  const annale: Annale = {
    id: generateId(),
    moduleId,
    name,
    fileName,
    fileType,
    extractedText,
    importedAt: Date.now(),
  };
  await put(ANNALES_STORE, annale);
  await logEventBestEffort(moduleId, "annale_scanned", (moduleName) => ({
    title: `Annale numérisée : ${name}`,
    desc: `${moduleName} · ${extractedText.trim().length} caractères extraits`,
  }));
  return annale;
}

export async function deleteAnnale(annaleId: string): Promise<void> {
  await remove(ANNALES_STORE, annaleId);
}

export async function getExams(): Promise<Exam[]> {
  return getAll<Exam>(EXAMS_STORE);
}

export async function addExam(moduleId: string, name: string, date: string): Promise<Exam> {
  const exam: Exam = {
    id: generateId(),
    moduleId,
    name,
    date,
    createdAt: Date.now(),
  };
  await put(EXAMS_STORE, exam);
  await logEventBestEffort(moduleId, "exam_added", (moduleName) => ({
    title: `Contrôle planifié : ${name}`,
    desc: `${moduleName} · ${formatExamDate(date)}`,
  }));
  return exam;
}

export async function deleteExam(examId: string): Promise<void> {
  await remove(EXAMS_STORE, examId);
}

export async function getStudySessions(): Promise<StudySession[]> {
  return getAll<StudySession>(STUDY_SESSIONS_STORE);
}

export async function addStudySession(
  moduleId: string,
  durationSeconds: number,
  date: string,
  source: StudySession["source"] = "quiz"
): Promise<StudySession> {
  const session: StudySession = {
    id: generateId(),
    moduleId,
    durationSeconds,
    date,
    source,
    createdAt: Date.now(),
  };
  await put(STUDY_SESSIONS_STORE, session);
  return session;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function exportAllData(): Promise<BackupData> {
  const [modules, courses, questions, attempts, annales, exams, studySessions, events] = await Promise.all([
    getModules(),
    getCourses(),
    getQuestions(),
    getAttempts(),
    getAnnales(),
    getExams(),
    getStudySessions(),
    getEvents(),
  ]);

  const backupCourses: BackupCourse[] = await Promise.all(
    courses.map(async ({ file, ...rest }) => ({
      ...rest,
      fileDataUrl: file ? await blobToDataUrl(file) : null,
    }))
  );

  return {
    version: 1,
    exportedAt: Date.now(),
    modules,
    courses: backupCourses,
    questions,
    attempts,
    annales,
    exams,
    studySessions,
    events,
  };
}

// Restaure une sauvegarde en fusionnant avec les données existantes (les IDs
// d'origine sont conservés, rien n'est supprimé). N'émet pas d'événements
// d'activité — restaurer d'anciennes données ne doit pas polluer le journal
// avec des entrées "à l'instant".
const BACKUP_ARRAY_FIELDS = [
  "modules",
  "courses",
  "questions",
  "attempts",
  "annales",
  "exams",
  "studySessions",
  "events",
] as const;

export async function restoreBackup(backup: BackupData): Promise<void> {
  // Valider la forme complète avant d'écrire quoi que ce soit : sinon une
  // sauvegarde corrompue (ex. "courses" manquant) importe partiellement les
  // premiers stores avant de planter, laissant la base dans un état incohérent.
  for (const field of BACKUP_ARRAY_FIELDS) {
    if (!Array.isArray(backup[field])) {
      throw new Error(`Sauvegarde invalide : champ "${field}" manquant ou incorrect.`);
    }
  }

  // Décode aussi tous les fichiers AVANT d'écrire quoi que ce soit : un
  // fileDataUrl corrompu ne doit pas planter APRÈS que "modules" ait déjà été
  // committé — sinon l'utilisateur voit "sauvegarde invalide" alors qu'une
  // partie a bel et bien été importée.
  const courses: Course[] = await Promise.all(
    backup.courses.map(async ({ fileDataUrl, ...rest }) => ({
      ...rest,
      file: fileDataUrl ? await dataUrlToBlob(fileDataUrl) : null,
    }))
  );

  await Promise.all(backup.modules.map((m) => put(MODULES_STORE, m)));
  await Promise.all(courses.map((c) => put(COURSES_STORE, c)));
  await Promise.all(backup.questions.map((q) => put(QUESTIONS_STORE, q)));
  await Promise.all(backup.attempts.map((a) => put(ATTEMPTS_STORE, a)));
  await Promise.all(backup.annales.map((a) => put(ANNALES_STORE, a)));
  await Promise.all(backup.exams.map((e) => put(EXAMS_STORE, e)));
  await Promise.all(backup.studySessions.map((s) => put(STUDY_SESSIONS_STORE, s)));
  await Promise.all(backup.events.map((e) => put(EVENTS_STORE, e)));
}
