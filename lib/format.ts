export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatImportedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayIsoDate(): string {
  // Date locale de l'utilisateur, pas la date UTC — sinon "aujourd'hui" est
  // faux pendant 1 à 2h après minuit heure française (UTC+1/+2).
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysUntil(dateIso: string): number {
  const today = new Date(`${todayIsoDate()}T00:00:00Z`);
  const target = new Date(`${dateIso}T00:00:00Z`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export { todayIsoDate };

export function formatExamDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return "Passé";
  if (daysLeft === 0) return "Aujourd'hui";
  if (daysLeft === 1) return "1 jour restant";
  return `${daysLeft} jours restants`;
}

// Centralisé pour que /planning et le dashboard restent cohérents : un seul
// endroit à modifier plutôt que deux logiques dupliquées qui divergent.
export function examBadgeTone(daysLeft: number): string {
  if (daysLeft < 0) return "";
  if (daysLeft <= 3) return "urgent-badge";
  if (daysLeft <= 7) return "warn-badge";
  return "";
}

const DAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"]; // Date#getUTCDay() : 0 = dimanche

export function lastNDaysIso(n: number): string[] {
  const today = new Date(`${todayIsoDate()}T00:00:00Z`);
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function frenchDayLetter(dateIso: string): string {
  return DAY_LETTERS[new Date(`${dateIso}T00:00:00Z`).getUTCDay()];
}

export function formatDuration(totalSeconds: number): string {
  // Arrondi à la minute la plus proche, mais toute activité réelle affiche au
  // moins 1 minute — sinon une session très courte s'afficherait "0h00" alors
  // qu'une barre non nulle est déjà visible dans le graphique.
  const totalMinutes = totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : 0;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return "à l'instant";
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return new Date(timestamp).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function fileIconFor(fileType: string | null): string {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("document")) return "📘";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📙";
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType.startsWith("text/")) return "📝";
  return "📄";
}
