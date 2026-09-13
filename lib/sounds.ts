"use client";

// Effets sonores de l'application — décodés via Web Audio API plutôt que de
// simples <audio>, pour deux raisons : (1) ça permet de couper tout silence
// en début de fichier au moment de la lecture (voir detectLeadingSilence),
// donc le son réagit immédiatement au clic peu importe comment le fichier a
// été enregistré ; (2) ça permet de superposer des lectures rapprochées
// (plusieurs clics de suite) sans attendre la fin du son précédent.
//
// Purement décoratif : un échec de lecture (contexte audio bloqué, fichier
// manquant...) ne doit jamais faire planter une interaction de l'app.

const POOLS = {
  click: ["/sounds/click.mp3"],
  importCourse: ["/sounds/import-course.mp3"],
  selectAnswer: ["/sounds/select-answer-1.mp3", "/sounds/select-answer-2.mp3", "/sounds/select-answer-3.mp3"],
  correct: ["/sounds/correct-1.mp3", "/sounds/correct-2.mp3"],
  wrong: ["/sounds/wrong-1.mp3", "/sounds/wrong-2.mp3", "/sounds/wrong-3.mp3", "/sounds/wrong-4.mp3"],
  aboveAverage: [
    "/sounds/above-average-1.mp3",
    "/sounds/above-average-2.mp3",
    "/sounds/above-average-3.mp3",
    "/sounds/above-average-4.mp3",
    "/sounds/above-average-5.mp3",
  ],
  belowAverage: [
    "/sounds/below-average-1.mp3",
    "/sounds/below-average-2.mp3",
    "/sounds/below-average-3.mp3",
    "/sounds/below-average-4.mp3",
    "/sounds/below-average-5.mp3",
  ],
} as const;

export type SoundName = keyof typeof POOLS;

// Amplitude en dessous de laquelle un échantillon est considéré silencieux.
// Assez bas pour ne pas couper une attaque douce, assez haut pour ignorer
// le bruit de fond résiduel d'un enregistrement.
const SILENCE_AMPLITUDE = 0.02;

interface LoadedSound {
  buffer: AudioBuffer;
  startOffset: number;
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function detectLeadingSilence(buffer: AudioBuffer): number {
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i]) > SILENCE_AMPLITUDE) {
      // Petite marge avant le premier pic pour ne pas couper l'attaque du son.
      return Math.max(0, (i - 200) / buffer.sampleRate);
    }
  }
  return 0;
}

const cache = new Map<string, Promise<LoadedSound | null>>();

async function loadSound(ctx: AudioContext, src: string): Promise<LoadedSound | null> {
  try {
    const res = await fetch(src);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    return { buffer, startOffset: detectLeadingSilence(buffer) };
  } catch {
    return null;
  }
}

function getSound(ctx: AudioContext, src: string): Promise<LoadedSound | null> {
  let entry = cache.get(src);
  if (!entry) {
    entry = loadSound(ctx, src);
    cache.set(src, entry);
  }
  return entry;
}

// Précharge tout dès que ce module est importé côté client, pour que la
// toute première lecture n'attende pas le décodage.
if (typeof window !== "undefined") {
  const ctx = getAudioContext();
  if (ctx) {
    for (const pool of Object.values(POOLS)) {
      for (const src of pool) getSound(ctx, src);
    }
  }
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function playSound(name: SoundName, volume = 0.55): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const src = pickRandom(POOLS[name]);
  getSound(ctx, src)
    .then((sound) => {
      if (!sound) return;
      const start = () => {
        const source = ctx.createBufferSource();
        source.buffer = sound.buffer;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain).connect(ctx.destination);
        source.start(0, sound.startOffset);
      };
      if (ctx.state === "suspended") {
        ctx.resume().then(start).catch(() => {});
      } else {
        start();
      }
    })
    .catch(() => {});
}
