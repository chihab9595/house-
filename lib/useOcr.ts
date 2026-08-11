"use client";

// OCR côté client (aucun serveur) via tesseract.js. Le worker et le modèle de
// langue sont téléchargés depuis le CDN de tesseract.js au premier scan puis
// mis en cache par la librairie elle-même — connexion internet requise une
// première fois, réutilisable hors-ligne ensuite. Les PDF sont d'abord
// convertis en images page par page (lib/pdfToImages.ts) avant l'OCR, car
// tesseract.js ne sait lire que des images.

import { useCallback, useRef, useState } from "react";
import { createWorker, type Worker } from "tesseract.js";
import { pdfToImageBlobs } from "./pdfToImages";

const PAGE_SEPARATOR = "\n\n--- Page suivante ---\n\n";

export function useOcr() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWorker = useCallback(async (): Promise<Worker> => {
    if (!workerRef.current) {
      workerRef.current = await createWorker("fra", undefined, {
        logger: (m) => {
          setStatus(m.status);
          if (typeof m.progress === "number") setProgress(Math.round(m.progress * 100));
        },
      });
    }
    return workerRef.current;
  }, []);

  const recognize = useCallback(
    async (file: File): Promise<string | null> => {
      setRunning(true);
      setProgress(0);
      setStatus("Initialisation…");
      setError(null);
      try {
        const worker = await getWorker();

        if (file.type === "application/pdf") {
          setStatus("Conversion du PDF…");
          const pageBlobs = await pdfToImageBlobs(file, (page, total) => {
            setStatus(`Conversion du PDF… page ${page}/${total}`);
          });
          const texts: string[] = [];
          for (let i = 0; i < pageBlobs.length; i++) {
            setStatus(`Analyse de la page ${i + 1}/${pageBlobs.length}…`);
            setProgress(0);
            const { data } = await worker.recognize(pageBlobs[i]);
            texts.push(data.text);
          }
          return texts.join(PAGE_SEPARATOR);
        }

        const { data } = await worker.recognize(file);
        return data.text;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de la reconnaissance de texte.");
        return null;
      } finally {
        setRunning(false);
      }
    },
    [getWorker]
  );

  return { recognize, progress, status, running, error };
}
