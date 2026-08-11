"use client";

import type { AiMessage } from "./aiTypes";

export async function askAi(
  messages: AiMessage[],
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      jsonMode: options?.jsonMode,
    }),
  });

  const data = await response.json();
  if (!response.ok || "error" in data) {
    throw new Error(data.error ?? "Échec de l'appel à l'IA.");
  }
  return data.content as string;
}

export async function getAiStatus(): Promise<boolean> {
  try {
    const response = await fetch("/api/ai/status");
    const data = await response.json();
    return Boolean(data.configured);
  } catch {
    return false;
  }
}
