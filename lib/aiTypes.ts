// Types partagés pour l'intégration IA (Groq, niveau gratuit).
// Le fetch vers Groq se fait uniquement côté serveur (app/api/ai/*), jamais
// depuis le navigateur — la clé API ne doit jamais atteindre le bundle client.

export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiChatRequestBody {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiChatSuccess {
  content: string;
}

export interface AiChatError {
  error: string;
}

export type AiChatResponse = AiChatSuccess | AiChatError;
