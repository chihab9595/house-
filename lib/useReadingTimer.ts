"use client";

// Chronomètre de lecture d'un cours : ouvre le fichier dans un nouvel onglet
// et chronomètre le temps passé dessus, en excluant le temps où l'onglet de
// House est masqué (changement d'onglet/appli) pour ne pas surcompter.
//
// Portée volontairement limitée à la page "Mes cours" : quitter la page
// arrête et sauvegarde la session en cours plutôt que de la laisser courir
// en arrière-plan indéfiniment.

import { useCallback, useEffect, useRef, useState } from "react";
import * as db from "./db";
import { todayIsoDate } from "./format";
import type { Course } from "./courseTypes";

export function useReadingTimer() {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const accumulatedRef = useRef(0);
  const visibleSinceRef = useRef<number | null>(null);
  const moduleIdRef = useRef<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTotal = useCallback(() => {
    const extra =
      visibleSinceRef.current !== null ? Math.round((Date.now() - visibleSinceRef.current) / 1000) : 0;
    return accumulatedRef.current + extra;
  }, []);

  useEffect(() => {
    function handleVisibility() {
      if (activeCourseId === null) return;
      if (document.visibilityState === "hidden") {
        if (visibleSinceRef.current !== null) {
          accumulatedRef.current += Math.round((Date.now() - visibleSinceRef.current) / 1000);
          visibleSinceRef.current = null;
        }
      } else {
        visibleSinceRef.current = Date.now();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeCourseId]);

  const start = useCallback((course: Course) => {
    accumulatedRef.current = 0;
    visibleSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;
    moduleIdRef.current = course.moduleId;
    setElapsedSeconds(0);
    setActiveCourseId(course.id);

    if (course.file) {
      const url = URL.createObjectURL(course.file);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    }

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsedSeconds(currentTotal());
    }, 1000);
  }, [currentTotal]);

  const stop = useCallback(async () => {
    if (activeCourseId === null || moduleIdRef.current === null) return;
    if (tickRef.current) clearInterval(tickRef.current);

    const totalSeconds = currentTotal();
    const moduleId = moduleIdRef.current;

    setActiveCourseId(null);
    setElapsedSeconds(0);
    accumulatedRef.current = 0;
    visibleSinceRef.current = null;
    moduleIdRef.current = null;

    if (totalSeconds > 0) {
      await db.addStudySession(moduleId, totalSeconds, todayIsoDate(), "reading");
    }
  }, [activeCourseId, currentTotal]);

  // Si l'utilisateur quitte la page "Mes cours" pendant une lecture active,
  // sauvegarder ce qui a été chronométré plutôt que de le perdre.
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (moduleIdRef.current) {
        const totalSeconds = currentTotal();
        if (totalSeconds > 0) {
          db.addStudySession(moduleIdRef.current, totalSeconds, todayIsoDate(), "reading");
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeCourseId, elapsedSeconds, start, stop };
}
