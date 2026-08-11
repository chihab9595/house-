// Journal d'activité : événements générés automatiquement par les actions de
// l'utilisateur (import, scan OCR, quiz, planification), pour alimenter
// "Activité récente" et "Notifications" sur le dashboard.

export type ActivityEventType =
  | "course_imported"
  | "annale_scanned"
  | "quiz_completed"
  | "exam_added";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  desc: string;
  createdAt: number;
}
