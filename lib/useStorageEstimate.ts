"use client";

// Espace disque réellement utilisé par l'app (IndexedDB + cache), via l'API
// navigateur StorageManager — pas une valeur inventée. Absente sur certains
// navigateurs/contexte (ex: Safari privé) : on affiche alors "—".

import { useEffect, useState } from "react";
import { useDbSync } from "./dbEvents";

export interface StorageEstimate {
  usageBytes: number | null;
  quotaBytes: number | null;
}

function bytesToGo(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export function formatStorageEstimate(estimate: StorageEstimate): string {
  if (estimate.usageBytes === null || estimate.quotaBytes === null) return "—";
  return `${bytesToGo(estimate.usageBytes)} Go / ${bytesToGo(estimate.quotaBytes)} Go`;
}

export function storageUsedPercent(estimate: StorageEstimate): number {
  if (!estimate.usageBytes || !estimate.quotaBytes) return 0;
  return Math.min(100, Math.round((estimate.usageBytes / estimate.quotaBytes) * 100));
}

export function useStorageEstimate(): StorageEstimate {
  const [estimate, setEstimate] = useState<StorageEstimate>({ usageBytes: null, quotaBytes: null });

  const refresh = async () => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) return;
    const { usage, quota } = await navigator.storage.estimate();
    setEstimate({ usageBytes: usage ?? null, quotaBytes: quota ?? null });
  };

  useEffect(() => {
    refresh();
  }, []);

  useDbSync(refresh);

  return estimate;
}
