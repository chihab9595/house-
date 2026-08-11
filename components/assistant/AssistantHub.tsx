"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCourseStats } from "@/lib/useCourseStats";
import { useQuizStats } from "@/lib/useQuizStats";
import { useExamCalendar } from "@/lib/useExamCalendar";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { speak } from "@/lib/speechSynthesis";
import { answerQuery, type AssistantContext } from "@/lib/assistantIntents";

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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function handleQuery(text: string) {
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

    const reply = answerQuery(trimmed, ctx);

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
      { id: crypto.randomUUID(), role: "house", text: reply.text },
    ]);
    speak(reply.text);

    if (reply.navigateTo) {
      const target = reply.navigateTo;
      setTimeout(() => router.push(target), 900);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleQuery(input);
    setInput("");
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
      handleQuery(text);
    });
  }

  return (
    <div className="panel">
      <div className="panel-title">Assistant House</div>

      <div className="chat-log">
        {messages.map((m) => (
          <div className={`chat-message ${m.role}`} key={m.id}>
            {m.text}
          </div>
        ))}
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
