# Graph Report - graphify-4b1f67  (2026-09-02)

## Corpus Check
- Corpus is ~29,072 words - fits in a single context window. You may not need a graph.

## Summary
- 487 nodes · 1015 edges · 29 communities (16 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 406,007 input · 0 output

## Community Hubs (Navigation)
- AI Question Extraction
- Course Library & Sync
- Progress Dashboard
- Project Dependencies
- Auto Backup System
- Database Layer
- Home Dashboard
- TypeScript Config
- Voice Assistant
- Exam Planning
- Quiz & Revision
- App Routing & Navigation
- App Layout & Shell
- Annales & Backup Types
- Project Documentation
- AI Chat API
- ESLint Config
- Next.js Config
- PostCSS Config
- Service Worker
- App Icon Asset (touch)
- App Icon Asset (192)
- App Icon Asset (512)
- App Icon Asset (svg)
- App Icon Asset (maskable 512)
- App Icon Asset (maskable svg)

## God Nodes (most connected - your core abstractions)
1. `useDbSync()` - 24 edges
2. `compilerOptions` - 16 edges
3. `CourseModule` - 13 edges
4. `CoursesPanel()` - 12 edges
5. `put()` - 12 edges
6. `exportAllData()` - 12 edges
7. `useCourseStats()` - 12 edges
8. `AssistantHub()` - 10 edges
9. `BackupData` - 10 edges
10. `Course` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AnnaleListProps` --references--> `Annale`  [EXTRACTED]
  components/annales/AnnaleList.tsx → lib/annaleTypes.ts
- `AnnaleList()` --calls--> `formatImportedDate()`  [EXTRACTED]
  components/annales/AnnaleList.tsx → lib/format.ts
- `AssistantHub()` --calls--> `useAiStatus()`  [EXTRACTED]
  components/assistant/AssistantHub.tsx → lib/useAiStatus.ts
- `AssistantHub()` --calls--> `useCourseStats()`  [EXTRACTED]
  components/assistant/AssistantHub.tsx → lib/useCourseStats.ts
- `AssistantHub()` --calls--> `useExamCalendar()`  [EXTRACTED]
  components/assistant/AssistantHub.tsx → lib/useExamCalendar.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **HOUSE Project Directory Structure** — readme_app_dir, readme_components_dir, readme_data_dir, readme_lib_dir, readme_design_dir, readme_public_icons_dir [EXTRACTED 1.00]

## Communities (29 total, 10 thin omitted)

### Community 0 - "AI Question Extraction"
Cohesion: 0.07
Nodes (31): ScanForm(), handleSave(), resetForm(), ScanFormProps, AiStatusPanel(), GeneratedQuestionsPanel(), handleGenerate(), GeneratedQuestionsPanelProps (+23 more)

### Community 1 - "Course Library & Sync"
Cohesion: 0.11
Nodes (25): AnnalesHub(), CoursesLibrary(), CoursesPanel(), CoursesPanelProps, supportsAiGeneration(), ModulesPanel(), ModulesPanelProps, YearTabs() (+17 more)

### Community 2 - "Progress Dashboard"
Cohesion: 0.10
Nodes (21): metadata, AccuracyReal(), ActiveModulesReal(), LeftSidebar(), MasteryRing(), ModuleProgressReal(), RealMasteryPanel(), StudyHoursReal() (+13 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.05
Nodes (36): eslint, eslint-config-next, next, dependencies, next, pdfjs-dist, react, react-dom (+28 more)

### Community 4 - "Auto Backup System"
Cohesion: 0.12
Nodes (26): metadata, AutoBackupPanel(), handleBackupNow(), handleChoose(), handleDisable(), handleReauthorize(), refresh(), AutoBackupManager() (+18 more)

### Community 5 - "Database Layer"
Cohesion: 0.17
Nodes (33): addAnnale(), addCourse(), addExam(), addModule(), addQuestion(), addStudySession(), BACKUP_ARRAY_FIELDS, blobToDataUrl() (+25 more)

### Community 6 - "Home Dashboard"
Cohesion: 0.10
Nodes (20): BottomCards(), CenterPanel(), Dashboard(), EkgTrace(), NotificationsReal(), PulseCore(), RecentActivityReal(), RightSidebar() (+12 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "Voice Assistant"
Cohesion: 0.12
Nodes (23): AssistantHub(), handleMic(), handleQuery(), handleSubmit(), Message, WELCOME, answerQuery(), AssistantContext (+15 more)

### Community 9 - "Exam Planning"
Cohesion: 0.18
Nodes (17): ExamCountdownReal(), unitLabel(), CalendarPanel(), ExamForm(), ExamFormProps, ExamList(), ExamListProps, PlanningHub() (+9 more)

### Community 10 - "Quiz & Revision"
Cohesion: 0.14
Nodes (16): EMPTY_CHOICES, QuestionForm(), QuestionFormProps, QuestionList(), QuestionListProps, QuizRunner(), QuizRunnerProps, Mode (+8 more)

### Community 11 - "App Routing & Navigation"
Cohesion: 0.11
Nodes (9): metadata, metadata, metadata, metadata, metadata, ModuleNavPanel(), SecondaryPageProps, SectionLayout() (+1 more)

### Community 12 - "App Layout & Shell"
Cohesion: 0.11
Nodes (16): inter, jetbrainsMono, metadata, rajdhani, viewport, Clock(), DAYS, formatDate() (+8 more)

### Community 13 - "Annales & Backup Types"
Cohesion: 0.18
Nodes (12): AnnaleList(), AnnaleListProps, BackupPanel(), handleExport(), handleImportFile(), summarize(), Annale, BackupCourse (+4 more)

### Community 14 - "Project Documentation"
Cohesion: 0.15
Nodes (14): AGENTS.md — Next.js Agent Rules Notice, generate-agent-files.js (next dev block generator), node_modules/next/dist/docs/ (Next.js Breaking-Change Guides), CLAUDE.md (Project Instructions Entry Point), app/ (Next.js App Router routes & layout), app/manifest.ts (PWA Manifest), components/ (Reusable React Components), data/ (Mock Data) (+6 more)

### Community 15 - "AI Chat API"
Cohesion: 0.21
Nodes (11): fetchWithRateLimitRetry(), getProvider(), POST(), RATE_LIMIT_RETRY_DELAYS_MS, sleep(), AiChatError, AiChatRequestBody, AiChatResponse (+3 more)

## Knowledge Gaps
- **120 isolated node(s):** `metadata`, `RATE_LIMIT_RETRY_DELAYS_MS`, `metadata`, `metadata`, `inter` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 159 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useDbSync()` connect `Course Library & Sync` to `Progress Dashboard`, `Auto Backup System`, `Home Dashboard`, `Exam Planning`, `Quiz & Revision`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `useCourseStats()` connect `Progress Dashboard` to `Voice Assistant`, `Course Library & Sync`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `GeneratedQuestionsPanel()` connect `AI Question Extraction` to `Course Library & Sync`, `Annales & Backup Types`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `metadata`, `RATE_LIMIT_RETRY_DELAYS_MS`, `metadata` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Question Extraction` be split into smaller, more focused modules?**
  _Cohesion score 0.07400555041628122 - nodes in this community are weakly interconnected._
- **Should `Course Library & Sync` be split into smaller, more focused modules?**
  _Cohesion score 0.10741971207087486 - nodes in this community are weakly interconnected._
- **Should `Progress Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._