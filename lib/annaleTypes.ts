// Types pour les annales d'examens scannées (OCR), stockées localement.

export interface Annale {
  id: string;
  moduleId: string;
  name: string;
  fileName: string | null;
  fileType: string | null;
  extractedText: string;
  importedAt: number;
}
