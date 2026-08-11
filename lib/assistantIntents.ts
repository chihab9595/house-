// Moteur de réponse de l'assistant House : reconnaissance d'intentions très
// simples par mots-clés (pas de LLM, pas d'appel réseau) répondant à partir
// des vraies données locales de l'utilisateur.

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
}

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

function findModule(q: string, modules: AssistantModuleStat[]): AssistantModuleStat | null {
  return modules.find((m) => q.includes(normalize(m.name))) ?? null;
}

export function answerQuery(query: string, ctx: AssistantContext): AssistantReply {
  const q = normalize(query);
  const moduleMatch = findModule(q, ctx.modulesWithCourseCounts);

  if (q.includes("combien de cours")) {
    if (moduleMatch) {
      return { text: `Le module ${moduleMatch.name} contient ${moduleMatch.courseCount} cours.` };
    }
    return { text: `Tu as importé ${ctx.totalCourses} cours au total.` };
  }

  if ((q.includes("lance") || q.includes("demarre") || q.includes("commence")) && q.includes("quiz")) {
    if (moduleMatch) {
      return {
        text: `Je lance une session de révision pour ${moduleMatch.name}.`,
        navigateTo: `/revision?module=${encodeURIComponent(moduleMatch.name)}`,
      };
    }
    return { text: "Je lance la page de révision.", navigateTo: "/revision" };
  }

  if (q.includes("precision") || q.includes("maitrise")) {
    if (ctx.totalAttempts === 0) {
      return { text: "Tu n'as pas encore complété de quiz, je ne peux pas encore calculer ta précision." };
    }
    return {
      text: `Ta précision moyenne est de ${ctx.accuracyPercent}% sur ${ctx.totalAttempts} quiz complété${ctx.totalAttempts > 1 ? "s" : ""}.`,
    };
  }

  if (q.includes("prochain controle") || q.includes("prochain examen")) {
    if (!ctx.nextExam) {
      return { text: "Aucun contrôle n'est planifié pour l'instant. Tu peux en ajouter un dans Planning." };
    }
    return {
      text: `Ton prochain contrôle est ${ctx.nextExam.name} en ${ctx.nextExam.moduleName}, dans ${ctx.nextExam.daysLeft} jour${ctx.nextExam.daysLeft > 1 ? "s" : ""}.`,
    };
  }

  if (q.includes("point faible") || q.includes("a revoir") || q.includes("revoir")) {
    if (ctx.modulesToReview === 0) {
      return { text: "Aucun module n'est signalé à revoir pour l'instant, continue comme ça." };
    }
    const weak = ctx.perModuleAccuracy
      .filter((m) => m.accuracy !== null && m.accuracy < 60)
      .map((m) => m.name)
      .join(", ");
    return {
      text: `Tu as ${ctx.modulesToReview} module${ctx.modulesToReview > 1 ? "s" : ""} à revoir : ${weak}.`,
    };
  }

  if (moduleMatch) {
    return { text: `Le module ${moduleMatch.name} contient ${moduleMatch.courseCount} cours.` };
  }

  return {
    text:
      "Je n'ai pas compris. Essaie par exemple : « combien de cours dans cardiologie », " +
      "« lance un quiz de pneumologie », « quelle est ma précision », ou « quand est mon prochain contrôle ».",
  };
}
