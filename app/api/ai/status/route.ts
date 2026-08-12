import { NextResponse } from "next/server";

// Permet au client de savoir si l'assistant IA est configuré, sans jamais
// exposer d'identifiants. Ollama (fournisseur par défaut) ne nécessite pas
// de clé — considéré configuré tant qu'on ne l'a pas explicitement basculé
// vers OpenRouter, qui lui a besoin d'une clé API.
export async function GET() {
  const provider = process.env.AI_PROVIDER === "openrouter" ? "openrouter" : "ollama";
  const configured = provider === "ollama" ? true : Boolean(process.env.OPENROUTER_API_KEY);
  return NextResponse.json({ configured, provider });
}
