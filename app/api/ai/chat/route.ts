import { NextResponse } from "next/server";
import type { AiChatRequestBody } from "@/lib/aiTypes";

// Proxy serveur vers le fournisseur IA configuré (compatible OpenAI). Les
// identifiants restent côté serveur (process.env), jamais envoyés au
// navigateur — évite aussi les problèmes de CORS d'un appel direct client.
//
// Deux fournisseurs supportés via AI_PROVIDER :
//  - "ollama" (défaut) : modèle local, gratuit et sans aucune limite de
//    requêtes, mais plus lent (CPU) et nécessite qu'Ollama tourne en local.
//  - "openrouter" : API cloud gratuite, plus rapide par appel, mais plafonnée
//    à 50 requêtes/jour sur les modèles gratuits (voir fetchWithRateLimitRetry).

const DEFAULT_MAX_TOKENS = 1536;
const OLLAMA_DEFAULT_URL = "http://localhost:11434/v1/chat/completions";
const OLLAMA_DEFAULT_MODEL = "parable/fable:3b";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_DEFAULT_MODEL = "openai/gpt-oss-20b:free";

// Les modèles gratuits d'OpenRouter renvoient occasionnement un 429
// "temporarily rate-limited upstream" sous forte charge (typique quand
// l'extraction IA découpe un long document en plusieurs appels successifs).
// C'est transitoire : on retente avec un backoff croissant plutôt que
// d'échouer immédiatement. Ollama (local) n'a pas ce problème.
const RATE_LIMIT_RETRY_DELAYS_MS = [5000, 15000, 30000, 60000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRateLimitRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, init);
    if (response.status !== 429 || attempt >= RATE_LIMIT_RETRY_DELAYS_MS.length) {
      return response;
    }
    await sleep(RATE_LIMIT_RETRY_DELAYS_MS[attempt]);
  }
}

function getProvider(): "ollama" | "openrouter" {
  return process.env.AI_PROVIDER === "openrouter" ? "openrouter" : "ollama";
}

export async function POST(request: Request) {
  const provider = getProvider();

  if (provider === "openrouter" && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Aucune clé OpenRouter configurée. Ajoute OPENROUTER_API_KEY dans .env.local puis redémarre le serveur.",
      },
      { status: 503 }
    );
  }

  let body: AiChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Aucun message fourni." }, { status: 400 });
  }

  const payload = {
    model:
      provider === "ollama"
        ? process.env.OLLAMA_MODEL || OLLAMA_DEFAULT_MODEL
        : process.env.OPENROUTER_MODEL || OPENROUTER_DEFAULT_MODEL,
    messages: body.messages,
    temperature: body.temperature ?? 0.4,
    max_tokens: body.maxTokens ?? DEFAULT_MAX_TOKENS,
    ...(body.jsonMode ? { response_format: { type: "json_object" } } : {}),
  };

  try {
    const response =
      provider === "ollama"
        ? await fetch(process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchWithRateLimitRetry(OPENROUTER_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              // Recommandé par OpenRouter (identifie l'app dans leurs stats), sans impact fonctionnel.
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "HOUSE",
            },
            body: JSON.stringify(payload),
          });

    if (!response.ok) {
      if (provider === "openrouter" && response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Le modèle IA gratuit est temporairement surchargé (limite de débit atteinte), même après plusieurs nouvelles tentatives. Réessaie dans quelques minutes.",
          },
          { status: 502 }
        );
      }
      const detail = await response.text();
      const label = provider === "ollama" ? "Ollama" : "OpenRouter";
      return NextResponse.json(
        { error: `Erreur ${label} (${response.status}) : ${detail.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      return NextResponse.json(
        { error: "L'IA n'a pas produit de réponse (le modèle a peut-être épuisé son budget de tokens sur son raisonnement interne — réessaie)." },
        { status: 502 }
      );
    }

    return NextResponse.json({ content });
  } catch (err) {
    const hint =
      provider === "ollama"
        ? " Vérifie qu'Ollama tourne en local (commande : ollama serve)."
        : "";
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Échec de l'appel à l'IA.") + hint },
      { status: 500 }
    );
  }
}
