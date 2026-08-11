"use client";

// House répond à voix haute via la synthèse vocale du navigateur.
export function speak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
