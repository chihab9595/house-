// Types pour la bibliothèque de cours réelle (année → module → cours),
// stockée localement dans IndexedDB. Distincts des types de data/mockData.ts
// qui n'alimentent que le tableau de bord fictif.

export interface Year {
  id: number;
  label: string;
}

export interface CourseModule {
  id: string;
  yearId: number;
  name: string;
  createdAt: number;
}

export interface Course {
  id: string;
  moduleId: string;
  name: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  file: Blob | null;
  importedAt: number;
}
