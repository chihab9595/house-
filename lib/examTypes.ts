// Type pour les dates de contrôle planifiées par module.

export interface Exam {
  id: string;
  moduleId: string;
  name: string;
  date: string; // format ISO "yyyy-mm-dd"
  createdAt: number;
}
