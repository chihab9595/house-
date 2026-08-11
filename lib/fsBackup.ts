"use client";

// Sauvegarde automatique locale via la File System Access API (Chrome/Edge
// uniquement). L'utilisateur choisit un dossier une fois ; on y réécrit un
// fichier "house-auto-backup.json" à jour à chaque changement de données.
// Le handle du dossier est stocké dans sa propre petite base IndexedDB,
// séparée de "house-db" — ce n'est pas une donnée métier exportable, juste
// un identifiant technique de dossier propre à ce navigateur.

import { exportAllData } from "./db";

// La File System Access API (showDirectoryPicker, permissions sur les
// handles) n'est pas encore dans le lib.dom.d.ts standard de TypeScript
// (seul Chromium l'implémente) — déclarations minimales couvrant ce que
// House utilise.
type FsPermissionState = "granted" | "denied" | "prompt";
interface FsPermissionDescriptor {
  mode: "read" | "readwrite";
}
interface FileSystemDirectoryHandleWithPermissions extends FileSystemDirectoryHandle {
  queryPermission(descriptor: FsPermissionDescriptor): Promise<FsPermissionState>;
  requestPermission(descriptor: FsPermissionDescriptor): Promise<FsPermissionState>;
}
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: "read" | "readwrite" }): Promise<FileSystemDirectoryHandle>;
  }
}

const FS_DB_NAME = "house-fs-backup";
const FS_DB_VERSION = 1;
const STORE_NAME = "handle";
const RECORD_KEY = "backup-folder";
const BACKUP_FILE_NAME = "house-auto-backup.json";

export function isFsAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

interface FsBackupRecord {
  key: string;
  handle: FileSystemDirectoryHandleWithPermissions;
  updatedAt: number | null;
}

function openFsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FS_DB_NAME, FS_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getRecord(): Promise<FsBackupRecord | null> {
  const db = await openFsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve((request.result as FsBackupRecord) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function putRecord(record: FsBackupRecord): Promise<void> {
  const db = await openFsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearBackupFolder(): Promise<void> {
  const db = await openFsDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(RECORD_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export interface BackupFolderInfo {
  name: string;
  updatedAt: number | null;
  permissionGranted: boolean;
}

export async function getBackupFolderInfo(): Promise<BackupFolderInfo | null> {
  const record = await getRecord();
  if (!record) return null;
  const permission = await record.handle.queryPermission({ mode: "readwrite" });
  return {
    name: record.handle.name,
    updatedAt: record.updatedAt,
    permissionGranted: permission === "granted",
  };
}

// Doit être appelé depuis un gestionnaire de clic (geste utilisateur requis
// par le navigateur pour la permission d'écriture).
export async function chooseBackupFolder(): Promise<void> {
  const handle = (await window.showDirectoryPicker({
    mode: "readwrite",
  })) as FileSystemDirectoryHandleWithPermissions;
  await putRecord({ key: RECORD_KEY, handle, updatedAt: null });
  await writeBackupNow();
}

// Doit aussi être appelé depuis un clic : renouvelle la permission si le
// navigateur ne l'a pas retenue entre deux sessions.
export async function reauthorizeBackupFolder(): Promise<boolean> {
  const record = await getRecord();
  if (!record) return false;
  const permission = await record.handle.requestPermission({ mode: "readwrite" });
  return permission === "granted";
}

export async function writeBackupNow(): Promise<boolean> {
  const record = await getRecord();
  if (!record) return false;

  const permission = await record.handle.queryPermission({ mode: "readwrite" });
  if (permission !== "granted") return false;

  const backup = await exportAllData();
  const fileHandle = await record.handle.getFileHandle(BACKUP_FILE_NAME, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(backup));
  await writable.close();

  await putRecord({ ...record, updatedAt: Date.now() });
  return true;
}
