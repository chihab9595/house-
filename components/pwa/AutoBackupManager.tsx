"use client";

// Composant sans rendu, monté globalement (app/layout.tsx) : écrit une
// sauvegarde à jour dans le dossier choisi par l'utilisateur (Paramètres) à
// chaque changement de données, avec un léger anti-rebond pour ne pas
// réécrire le fichier à chaque frappe.

import { useEffect, useRef } from "react";
import { subscribeDbChange } from "@/lib/dbEvents";
import { getBackupFolderInfo, writeBackupNow } from "@/lib/fsBackup";

const DEBOUNCE_MS = 4000;

export default function AutoBackupManager() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function maybeWrite() {
      const info = await getBackupFolderInfo();
      if (!active || !info || !info.permissionGranted) return;
      await writeBackupNow();
    }

    maybeWrite();

    const unsubscribe = subscribeDbChange(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(maybeWrite, DEBOUNCE_MS);
    });

    return () => {
      active = false;
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
