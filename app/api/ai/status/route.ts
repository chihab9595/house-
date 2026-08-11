import { NextResponse } from "next/server";

// Permet au client de savoir si l'assistant IA est configuré, sans jamais
// exposer la clé elle-même.
export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.GROQ_API_KEY) });
}
