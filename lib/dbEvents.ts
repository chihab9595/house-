"use client";

// Petit bus d'événements pour garder synchronisés les différents hooks qui
// lisent IndexedDB. Sans ça, deux composants montés sur la même page (ex.
// CalendarPanel et le formulaire d'ajout de contrôle) gardent chacun leur
// propre copie des données et ne voient pas les écritures faites ailleurs
// tant que la page n'est pas rechargée/renavigée.

import { useEffect } from "react";

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeDbChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDbChange(): void {
  listeners.forEach((listener) => listener());
}

export function useDbSync(refresh: () => void): void {
  useEffect(() => subscribeDbChange(refresh), [refresh]);
}
