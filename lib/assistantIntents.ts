// Moteur de réponse de l'assistant House.
//
// Deux niveaux : une reconnaissance d'intentions par mots-clés (rapide, hors-
// ligne, toujours disponible) pour les questions fréquentes sur les propres
// données de l'utilisateur ; et, si aucune intention connue n'est reconnue et
// qu'une clé Groq est configurée, un relais vers l'IA (voir lib/aiClient.ts)
// pour les questions plus libres. `answerQuery` ne gère que le premier niveau
// — c'est AssistantHub.tsx qui décide d'appeler l'IA quand `matched` est faux.

export interface AssistantModuleStat {
  name: string;
  courseCount: number;
}

export interface AssistantModuleAccuracy {
  name: string;
  accuracy: number | null;
}

export interface AssistantNextExam {
  name: string;
  moduleName: string;
  daysLeft: number;
}

export interface AssistantContext {
  modulesWithCourseCounts: AssistantModuleStat[];
  totalCourses: number;
  accuracyPercent: number;
  totalAttempts: number;
  modulesToReview: number;
  nextExam: AssistantNextExam | null;
  perModuleAccuracy: AssistantModuleAccuracy[];
}

export interface AssistantReply {
  text: string;
  navigateTo?: string;
  matched: boolean;
}

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

function findModule(q: string, modules: AssistantModuleStat[]): AssistantModuleStat | null {
  // Préférer le nom le plus long qui matche : sinon "Cardiologie" court-circuite
  // "Cardiologie pédiatrique" alors que la question visait ce dernier.
  const matches = modules.filter((m) => q.includes(normalize(m.name)));
  if (matches.length === 0) return null;
  return matches.reduce((longest, m) => (m.name.length > longest.name.length ? m : longest));
}

export function answerQuery(query: string, ctx: AssistantContext): AssistantReply {
  const q = normalize(query);
  const moduleMatch = findModule(q, ctx.modulesWithCourseCounts);

  if (q.includes("combien de cours")) {
    if (moduleMatch) {
      return { text: `Le module ${moduleMatch.name} contient ${moduleMatch.courseCount} cours.`, matched: true };
    }
    return { text: `Tu as importé ${ctx.totalCourses} cours au total.`, matched: true };
  }

  if ((q.includes("lance") || q.includes("demarre") || q.includes("commence")) && q.includes("quiz")) {
    if (moduleMatch) {
      return {
        text: `Je lance une session de révision pour ${moduleMatch.name}.`,
        navigateTo: `/revision?module=${encodeURIComponent(moduleMatch.name)}`,
        matched: true,
      };
    }
    return { text: "Je lance la page de révision.", navigateTo: "/revision", matched: true };
  }

  if (q.includes("precision") || q.includes("maitrise")) {
    if (ctx.totalAttempts === 0) {
      return {
        text: "Tu n'as pas encore complété de quiz, je ne peux pas encore calculer ta précision.",
        matched: true,
      };
    }
    return {
      text: `Ta précision moyenne est de ${ctx.accuracyPercent}% sur ${ctx.totalAttempts} quiz complété${ctx.totalAttempts > 1 ? "s" : ""}.`,
      matched: true,
    };
  }

  if (q.includes("prochain controle") || q.includes("prochain examen")) {
    if (!ctx.nextExam) {
      return {
        text: "Aucun contrôle n'est planifié pour l'instant. Tu peux en ajouter un dans Planning.",
        matched: true,
      };
    }
    return {
      text: `Ton prochain contrôle est ${ctx.nextExam.name} en ${ctx.nextExam.moduleName}, dans ${ctx.nextExam.daysLeft} jour${ctx.nextExam.daysLeft > 1 ? "s" : ""}.`,
      matched: true,
    };
  }

  if (q.includes("point faible") || q.includes("a revoir") || q.includes("revoir")) {
    if (ctx.modulesToReview === 0) {
      return { text: "Aucun module n'est signalé à revoir pour l'instant, continue comme ça.", matched: true };
    }
    const weak = ctx.perModuleAccuracy
      .filter((m) => m.accuracy !== null && m.accuracy < 60)
      .map((m) => m.name)
      .join(", ");
    return {
      text: `Tu as ${ctx.modulesToReview} module${ctx.modulesToReview > 1 ? "s" : ""} à revoir : ${weak}.`,
      matched: true,
    };
  }

  if (moduleMatch) {
    return { text: `Le module ${moduleMatch.name} contient ${moduleMatch.courseCount} cours.`, matched: true };
  }

  return {
    text:
      "Je n'ai pas compris. Essaie par exemple : « combien de cours dans cardiologie », " +
      "« lance un quiz de pneumologie », « quelle est ma précision », ou « quand est mon prochain contrôle ».",
    matched: false,
  };
}

export function buildSystemPrompt(ctx: AssistantContext): string {
  const modulesLine =
    ctx.modulesWithCourseCounts.length > 0
      ? ctx.modulesWithCourseCounts.map((m) => `${m.name} (${m.courseCount} cours)`).join(", ")
      : "aucun module créé pour l'instant";

  const weakLine =
    ctx.perModuleAccuracy.filter((m) => m.accuracy !== null && m.accuracy < 60).length > 0
      ? ctx.perModuleAccuracy
          .filter((m) => m.accuracy !== null && m.accuracy < 60)
          .map((m) => `${m.name} (${m.accuracy}%)`)
          .join(", ")
      : "aucun";

  return [
    "Tu es House, l'assistant d'étude intégré à une application de révision pour étudiants en médecine.",
    "Réponds toujours en français, de façon concise (2-4 phrases maximum, c'est une bulle de chat).",
    "Tu peux expliquer des notions médicales à but pédagogique (l'utilisateur est étudiant en médecine),",
    "mais tu ne donnes jamais de conseil médical destiné à un patient réel ni de diagnostic — précise-le",
    "si la question s'y prête. Reste encourageant, comme un tuteur.",
    "",
    "Contexte réel de l'utilisateur dans l'application (à utiliser si pertinent, ne pas l'inventer si absent) :",
    `- Modules et cours importés : ${modulesLine}`,
    `- Cours importés au total : ${ctx.totalCourses}`,
    `- Précision moyenne aux quiz : ${ctx.totalAttempts > 0 ? `${ctx.accuracyPercent}% sur ${ctx.totalAttempts} quiz` : "aucun quiz complété"}`,
    `- Modules à revoir (précision < 60%) : ${weakLine}`,
    `- Prochain contrôle : ${ctx.nextExam ? `${ctx.nextExam.name} (${ctx.nextExam.moduleName}) dans ${ctx.nextExam.daysLeft} jour(s)` : "aucun planifié"}`,
  ].join("\n");
}
