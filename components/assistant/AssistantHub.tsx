"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCourseStats } from "@/lib/useCourseStats";
import { useQuizStats } from "@/lib/useQuizStats";
import { useExamCalendar } from "@/lib/useExamCalendar";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useAiStatus } from "@/lib/useAiStatus";
import { speak } from "@/lib/speechSynthesis";
import { askAi } from "@/lib/aiClient";
import { answerQuery, buildSystemPrompt, type AssistantContext } from "@/lib/assistantIntents";

interface Message {
  id: string;
  role: "user" | "house";
  text: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "house",
  text: "Bonjour, je suis House. Pose-moi une question sur tes cours, tes quiz ou ton planning.",
};

export default function AssistantHub() {
  const router = useRouter();
  const courseStats = useCourseStats();
  const quizStats = useQuizStats();
  const examCalendar = useExamCalendar();
  const speech = useSpeechRecognition();
  const aiStatus = useAiStatus();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [thinking, setThinking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function handleQuery(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const ctx: AssistantContext = {
      modulesWithCourseCounts: courseStats.modulesWithCounts,
      totalCourses: courseStats.totalCourses,
      accuracyPercent: quizStats.accuracyPercent,
      totalAttempts: quizStats.totalAttempts,
      modulesToReview: quizStats.modulesToReview,
      nextExam: examCalendar.next
        ? {
            name: examCalendar.next.name,
            moduleName: examCalendar.next.moduleName,
            daysLeft: examCalendar.next.daysLeft,
          }
        : null,
      perModuleAccuracy: quizStats.perModule,
    };

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: trimmed }]);

    const reply = answerQuery(trimmed, ctx);

    // Question reconnue par mots-clés : réponse instantanée, pas d'appel réseau.
    if (reply.matched || !aiStatus.configured) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "house", text: reply.text }]);
      speak(reply.text);
      if (reply.navigateTo) {
        const target = reply.navigateTo;
        setTimeout(() => {
          if (mountedRef.current) router.push(target);
        }, 900);
      }
      return;
    }

    // Question libre + IA configurée : relais vers Groq avec le contexte réel.
    setThinking(true);
    try {
      const aiText = await askAi([
        { role: "system", content: buildSystemPrompt(ctx) },
        { role: "user", content: trimmed },
      ]);
      if (!mountedRef.current) return;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "house", text: aiText }]);
      speak(aiText);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : "Échec de l'appel à l'IA.";
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "house", text: `⚠️ ${message}` }]);
    } finally {
      if (mountedRef.current) setThinking(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = input;
    setInput("");
    void handleQuery(value);
  }

  function handleMic() {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.start((text) => {
      // Un résultat vocal peut arriver après que l'utilisateur a quitté la
      // page ; ignorer plutôt que de déclencher une navigation surprise.
      if (!mountedRef.current) return;
      void handleQuery(text);
    });
  }

  return (
    <div className="panel">
      <div className="panel-title">
        Assistant House{" "}
        {!aiStatus.loading && (
          <span className={`ai-status-dot ${aiStatus.configured ? "on" : "off"}`}>
            {aiStatus.configured ? "IA active" : "mode basique"}
          </span>
        )}
      </div>

      <div className="chat-log">
        {messages.map((m) => (
          <div className={`chat-message ${m.role}`} key={m.id}>
            {m.text}
          </div>
        ))}
        {thinking && <div className="chat-message house thinking">House réfléchit…</div>}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`mic-btn ${speech.listening ? "listening" : ""}`}
          onClick={handleMic}
          disabled={!speech.supported}
          aria-label="Parler à House"
          title={speech.supported ? "Parler à House" : "Reconnaissance vocale non supportée par ce navigateur"}
        >
          🎙️
        </button>
        <input
          type="text"
          placeholder="Pose ta question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="inline-btn" disabled={!input.trim()}>
          Envoyer
        </button>
      </form>

      {!speech.supported && (
        <div className="mic-unsupported-hint">
          La reconnaissance vocale n&apos;est pas supportée par ce navigateur — utilise le champ texte.
        </div>
      )}
    </div>
  );
}
