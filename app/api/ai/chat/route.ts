import { NextResponse } from "next/server";
import type { AiChatRequestBody } from "@/lib/aiTypes";

// Proxy serveur vers l'API Groq (compatible OpenAI). La clé API reste
// côté serveur (process.env), jamais envoyée au navigateur — évite aussi
// les problèmes de CORS d'un appel direct depuis le client.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Aucune clé Groq configurée. Ajoute GROQ_API_KEY dans .env.local puis redémarre le serveur." },
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
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: body.messages,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.maxTokens ?? 1024,
        ...(body.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!groqResponse.ok) {
      const detail = await groqResponse.text();
      return NextResponse.json(
        { error: `Erreur Groq (${groqResponse.status}) : ${detail.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Réponse Groq inattendue." }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'appel à l'IA." },
      { status: 500 }
    );
  }
}
