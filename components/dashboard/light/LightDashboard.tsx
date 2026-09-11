"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useActivityFeed } from "@/lib/useActivityFeed";
import { useQuizStats } from "@/lib/useQuizStats";
import { useCourseProgress } from "@/lib/useCourseProgress";
import { useExamCalendar } from "@/lib/useExamCalendar";
import { useHomeExtras } from "@/lib/useHomeExtras";
import { iconForModuleName } from "@/lib/moduleIcon";
import {
  daysLeftLabel,
  examBadgeTone,
  formatExamDate,
  formatFileSize,
  formatImportedDate,
  formatRelativeTime,
} from "@/lib/format";
import {
  IconBell,
  IconBook,
  IconCalendar,
  IconFile,
  IconGraduationCap,
  IconPlay,
  IconPlus,
  IconTarget,
  IconUpload,
  IconWave,
  IconZap,
  type IconProps,
} from "@/components/icons/Icons";
import WeeklyTrendChart from "./WeeklyTrendChart";

const NO_COURSE_PARAM = "__sans_cours__";
const MAX_MODULES_SHOWN = 5;
const MAX_COURSES_SHOWN = 3;

function LightCard({
  Icon,
  title,
  href,
  children,
}: {
  Icon: ComponentType<IconProps>;
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <div className="light-card">
      <div className="light-card-head">
        <div className="light-card-title">
          <span className="light-card-icon">
            <Icon size={17} />
          </span>
          {title}
        </div>
        {href && (
          <Link href={href} className="light-card-more">
            ›
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function LightDashboard() {
  const quiz = useQuizStats();
  const courseProgress = useCourseProgress();
  const examCalendar = useExamCalendar();
  const extras = useHomeExtras();
  const { events: notifications } = useActivityFeed(5);

  const loading = quiz.loading || courseProgress.loading || examCalendar.loading || extras.loading;

  const weakestCourses = courseProgress.courses.slice(0, MAX_COURSES_SHOWN);
  const topModules = [...quiz.perModule]
    .sort((a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1))
    .slice(0, MAX_MODULES_SHOWN);

  return (
    <div className="light-dashboard">
      <div className="light-topbar">
        <div>
          <div className="light-greeting">
            Bonjour, étudiant <IconWave size={22} className="light-wave" />
          </div>
          <div className="light-greeting-sub">
            Continue tes efforts, chaque révision te rapproche de tes objectifs !
          </div>
        </div>
        <div className="light-topbar-right">
          <span className="light-offline-pill">
            <span className="dot" /> Mode hors-ligne
          </span>
          <span className="light-bell" title={`${notifications.length} notification(s)`}>
            <IconBell size={17} />
            {notifications.length > 0 && <span className="light-bell-badge">{notifications.length}</span>}
          </span>
        </div>
      </div>

      <div className="light-grid-3">
        <LightCard Icon={IconTarget} title="Ma révision" href="/revision">
          <div className="light-stat-tiles">
            <div className="light-stat-tile tile-pink">
              <div className="v">{loading ? "…" : extras.reviewCount}</div>
              <div className="k">Questions à revoir</div>
            </div>
            <div className="light-stat-tile tile-green">
              <div className="v">{loading ? "…" : extras.todayAccuracy !== null ? `${extras.todayAccuracy}%` : "—"}</div>
              <div className="k">Précision du jour</div>
            </div>
            <div className="light-stat-tile tile-violet">
              <div className="v">{loading ? "…" : quiz.totalAnswered > 0 ? `${quiz.accuracyPercent}%` : "—"}</div>
              <div className="k">Précision moyenne</div>
            </div>
          </div>
          {!loading && <WeeklyTrendChart days={extras.trend} />}
        </LightCard>

        <LightCard Icon={IconBook} title="Mes modules" href="/cours">
          {loading ? (
            <div className="light-empty">Chargement…</div>
          ) : topModules.length === 0 ? (
            <div className="light-empty">Crée un module dans « Mes cours » pour commencer.</div>
          ) : (
            <div className="light-module-list">
              {topModules.map((m) => {
                const { Icon, bg, fg } = iconForModuleName(m.name);
                return (
                  <div className="light-module-row" key={m.id}>
                    <span className="light-module-icon" style={{ background: bg, color: fg }}>
                      <Icon size={16} />
                    </span>
                    <div className="light-module-body">
                      <div className="light-module-top">
                        <span className="name">{m.name}</span>
                        <span className="pct">{m.accuracy !== null ? `${m.accuracy}%` : "—"}</span>
                      </div>
                      <div className="light-module-track">
                        <div className="light-module-fill" style={{ width: `${m.accuracy ?? 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </LightCard>

        <LightCard Icon={IconGraduationCap} title="Progression des cours" href="/progression">
          {loading ? (
            <div className="light-empty">Chargement…</div>
          ) : weakestCourses.length === 0 ? (
            <div className="light-empty">
              Ajoute des cours dans un module pour voir leur progression individuelle.
            </div>
          ) : (
            <div className="light-course-progress-list">
              {weakestCourses.map((c) => (
                <div className="light-course-progress-row" key={`${c.moduleId}::${c.courseName ?? ""}`}>
                  <div
                    className="light-mini-ring"
                    style={{ "--pct": c.accuracy ?? 0 } as CSSProperties}
                  >
                    <span>{c.accuracy !== null ? `${c.accuracy}%` : "—"}</span>
                  </div>
                  <div className="light-course-progress-body">
                    <div className="name">{c.courseName ?? "Sans cours"}</div>
                    <div className="meta">{c.moduleName}</div>
                  </div>
                  <Link
                    href={`/revision?moduleId=${encodeURIComponent(c.moduleId)}&course=${encodeURIComponent(
                      c.courseName ?? NO_COURSE_PARAM
                    )}`}
                    className="light-btn-sm"
                  >
                    Réviser
                  </Link>
                </div>
              ))}
            </div>
          )}
        </LightCard>
      </div>

      <div className="light-grid-3">
        <LightCard Icon={IconZap} title="Quiz récents" href="/revision">
          {loading ? (
            <div className="light-empty">Chargement…</div>
          ) : extras.recentAttempts.length === 0 ? (
            <div className="light-empty">Lance un quiz pour voir tes résultats ici.</div>
          ) : (
            <div className="light-list">
              {extras.recentAttempts.map((a) => {
                const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                return (
                  <div className="light-list-row" key={a.id}>
                    <div>
                      <div className="name">{a.moduleName}</div>
                      <div className="meta">
                        {a.total} question{a.total > 1 ? "s" : ""} · {formatRelativeTime(a.completedAt)}
                      </div>
                    </div>
                    <span className={`light-badge ${pct < 60 ? "warn" : "good"}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </LightCard>

        <LightCard Icon={IconBook} title="Bibliothèque" href="/cours">
          {loading ? (
            <div className="light-empty">Chargement…</div>
          ) : extras.recentCourses.length === 0 ? (
            <div className="light-empty">Importe un cours pour le voir apparaître ici.</div>
          ) : (
            <div className="light-list">
              {extras.recentCourses.map((c) => (
                <div className="light-list-row" key={c.id}>
                  <IconFile size={22} tint={fileTint(c.fileType)} />
                  <div style={{ flex: 1 }}>
                    <div className="name">{c.name}</div>
                    <div className="meta">
                      {c.moduleName} · {formatImportedDate(c.importedAt)}
                      {c.fileSize !== null ? ` · ${formatFileSize(c.fileSize)}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LightCard>

        <LightCard Icon={IconCalendar} title="Annales" href="/annales">
          <div className="light-empty" style={{ paddingBottom: 10 }}>
            {examCalendar.next ? "Prochain contrôle estimé" : "Aucun contrôle planifié"}
          </div>
          {examCalendar.next && (
            <div className="light-list-row" style={{ marginBottom: 10 }}>
              <span className="light-file-icon">
                <IconCalendar size={19} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="name">{examCalendar.next.name}</div>
                <div className="meta">{formatExamDate(examCalendar.next.date)}</div>
              </div>
              <span className={`light-badge ${examBadgeTone(examCalendar.next.daysLeft) ? "warn" : "good"}`}>
                {daysLeftLabel(examCalendar.next.daysLeft)}
              </span>
            </div>
          )}
          <div className="light-stat-row">
            <span className="k">Annales importées</span>
            <span className="v">{loading ? "…" : extras.annalesTotal}</span>
          </div>
        </LightCard>
      </div>

      <div className="light-quick-actions">
        <div className="light-quick-head">
          <span className="light-card-icon">
            <IconZap size={17} />
          </span>
          <div>
            <div className="title">Actions rapides</div>
            <div className="sub">Accède directement à tes outils essentiels</div>
          </div>
        </div>
        <div className="light-quick-buttons">
          <Link href="/revision" className="light-quick-btn tint-violet">
            <span className="light-quick-btn-label">
              <IconPlay size={17} /> Lancer un quiz
            </span>
            <span className="sub">Teste tes connaissances</span>
          </Link>
          <Link href="/cours" className="light-quick-btn tint-green">
            <span className="light-quick-btn-label">
              <IconUpload size={17} /> Importer un cours
            </span>
            <span className="sub">Ajouter un PDF ou un document</span>
          </Link>
          <Link href="/revision" className="light-quick-btn tint-blue">
            <span className="light-quick-btn-label">
              <IconPlus size={17} /> Ajouter des QCM
            </span>
            <span className="sub">Créer ou coller des questions</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function fileTint(fileType: string | null): string {
  if (!fileType) return "#8b8fa8";
  if (fileType.includes("pdf")) return "#e0405f";
  if (fileType.includes("word") || fileType.includes("document")) return "#2f6fed";
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "#d97706";
  if (fileType.startsWith("image/")) return "#16a34a";
  return "#8b8fa8";
}
