import { NextResponse } from "next/server";
import type { AiChatRequestBody } from "@/lib/aiTypes";

// Proxy serveur vers l'API OpenRouter (compatible OpenAI). La clé API reste
// côté serveur (process.env), jamais envoyée au navigateur — évite aussi
// les problèmes de CORS d'un appel direct depuis le client.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";
// Le modèle par défaut est un modèle "reasoning" : une bonne partie du budget
// de tokens part dans son raisonnement interne avant la réponse finale, d'où
// une limite par défaut plus généreuse que pour un modèle non-reasoning.
const DEFAULT_MAX_TOKENS = 1536;

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
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

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Recommandé par OpenRouter (identifie l'app dans leurs stats), sans impact fonctionnel.
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "HOUSE",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages: body.messages,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(body.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `Erreur OpenRouter (${response.status}) : ${detail.slice(0, 300)}` },
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'appel à l'IA." },
      { status: 500 }
    );
  }
}
