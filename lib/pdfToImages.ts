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

async function loadPdfjs() {
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
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
    if (blob) blobs.push(blob);
  }

  return blobs;
}
