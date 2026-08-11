"use client";

import { useEffect } from "react";

// N'enregistre le service worker qu'en production : en dev, le cache du SW
// entre en conflit avec le hot-reload de Next.js.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Échec de l'enregistrement du service worker HOUSE :", err);
    });
  }, []);

  return null;
}
