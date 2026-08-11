"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Course, CourseModule } from "@/lib/courseTypes";
import { fileIconFor, formatFileSize, formatImportedDate, formatMmSs } from "@/lib/format";
import { useReadingTimer } from "@/lib/useReadingTimer";
import { extractCourseText } from "@/lib/questionGenerator";
import GeneratedQuestionsPanel from "@/components/quiz/GeneratedQuestionsPanel";

interface CoursesPanelProps {
  selectedModule: CourseModule | null;
  courses: Course[];
  onImport: (name: string, file: File | null) => void;
  onRemove: (courseId: string) => void;
}

function supportsAiGeneration(course: Course): boolean {
  const type = course.fileType ?? "";
  const name = course.fileName ?? "";
  return type === "application/pdf" || type.startsWith("text/") || /\.(pdf|txt|md)$/i.test(name);
}

export default function CoursesPanel({ selectedModule, courses, onImport, onRemove }: CoursesPanelProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readingTimer = useReadingTimer();
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !name.trim()) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onImport(name, file);
    setName("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!selectedModule) {
    return (
      <div className="panel placeholder-panel" style={{ minHeight: 300 }}>
        <div className="icon">📚</div>
        <div className="title">Sélectionne un module</div>
        <div className="desc">Choisis ou crée un module à gauche pour commencer à importer des cours.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Cours · {selectedModule.name}</div>

      {courses.length === 0 ? (
        <div className="empty-hint">Aucun cours importé dans ce module pour l&apos;instant.</div>
      ) : (
        <div className="course-list">
          {courses.map((c) => {
            const isReadingThis = readingTimer.activeCourseId === c.id;
            const anotherActive = readingTimer.activeCourseId !== null && !isReadingThis;
            return (
              <div key={c.id}>
                <div className="course-card">
                  <span className="file-icon">{fileIconFor(c.fileType)}</span>
                  <div className="info">
                    <div className="name">{c.name}</div>
                    <div className="meta">
                      {formatImportedDate(c.importedAt)}
                      {c.fileSize !== null ? ` · ${formatFileSize(c.fileSize)}` : ""}
                      {!c.fileName ? " · sans fichier" : ""}
                    </div>
                  </div>
                  {c.fileName && (
                    <button
                      type="button"
                      className="inline-btn"
                      disabled={anotherActive}
                      onClick={() => (isReadingThis ? readingTimer.stop() : readingTimer.start(c))}
                    >
                      {isReadingThis ? `⏸️ Terminer (${formatMmSs(readingTimer.elapsedSeconds)})` : "📖 Lire"}
                    </button>
                  )}
                  {supportsAiGeneration(c) && (
                    <button
                      type="button"
                      className="inline-btn"
                      onClick={() => setGeneratingForId(generatingForId === c.id ? null : c.id)}
                    >
                      🤖 Générer questions
                    </button>
                  )}
                  <button
                    type="button"
                    className="remove"
                    aria-label={`Supprimer ${c.name}`}
                    onClick={() => {
                      if (window.confirm(`Supprimer le cours « ${c.name} » ?`)) {
                        onRemove(c.id);
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
                {generatingForId === c.id && (
                  <GeneratedQuestionsPanel
                    moduleId={c.moduleId}
                    mode="generate"
                    getSourceText={() => extractCourseText(c)}
                    onClose={() => setGeneratingForId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <form className="inline-form" onSubmit={handleSubmit} style={{ flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Nom du cours…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flexBasis: 180 }}
        />
        <label className={`file-input-label ${file ? "has-file" : ""}`}>
          {file ? file.name : "📎 Choisir un fichier"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
        <button type="submit" className="inline-btn" disabled={!name.trim()}>
          Importer
        </button>
      </form>
    </div>
  );
}
