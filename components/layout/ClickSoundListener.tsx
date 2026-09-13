"use client";

// Joue un son de clic générique sur tout bouton/lien de l'app, sans avoir à
// instrumenter chaque composant : un seul écouteur délégué sur `document`.
// Les interactions qui ont déjà leur propre son dédié (choix de quiz,
// import de cours...) portent `data-click-sound="none"` pour ne pas jouer
// les deux sons en même temps — voir QuizRunner.tsx et CoursesPanel.tsx.

import { useEffect } from "react";
import { playSound } from "@/lib/sounds";

export default function ClickSoundListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const control = target.closest<HTMLElement>("button, a[href]");
      if (!control) return;
      if (control.closest('[data-click-sound="none"]')) return;
      if ((control as HTMLButtonElement).disabled) return;
      playSound("click");
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
