"use client";

// Convertit chaque page d'un PDF en image (Blob PNG) côté client, pour
// pouvoir ensuite les passer à tesseract.js (qui ne sait lire que des
// images, pas des PDF directement). Le worker pdf.js est chargé depuis le
// CDN correspondant à la version installée — même limitation que l'OCR :
// connexion internet nécessaire au premier scan d'un PDF.
//
// pdfjs-dist exécute du code au chargement du module (ex. `new DOMMatrix()`)
// qui plante sous Node.js pendant le rendu statique de Next.js. Importer la
// librairie dynamiquement (uniquement au moment de l'appel, donc uniquement
// dans le navigateur) évite ce problème.

const RENDER_SCALE = 2;

let workerConfigured = false;

// Exporté pour être réutilisé par lib/questionGenerator.ts (extraction de
// texte natif des PDF de cours) sans dupliquer la configuration du worker.
export async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    workerConfigured = true;
  }
  return pdfjsLib;
}

export async function pdfToImageBlobs(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<Blob[]> {
  const pdfjsLib = await loadPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  try {
    const blobs: Blob[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      onProgress?.(pageNum, pdf.numPages);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Impossible de créer le contexte de rendu du PDF.");

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      // Ne jamais sauter une page en silence : le texte OCR final aurait un
      // trou sans que rien ne le signale, avec un décompte de progression
      // qui ne colle plus au nombre réel de pages traitées.
      if (!blob) {
        throw new Error(
          `Échec de conversion de la page ${pageNum}/${pdf.numPages} du PDF — réessaie, ou scanne cette page séparément.`
        );
      }
      blobs.push(blob);
    }

    return blobs;
  } finally {
    // Libère les ressources du document (mémoire + worker pdf.js) dès la
    // conversion terminée, sans attendre un démontage de composant.
    await loadingTask.destroy();
  }
}
