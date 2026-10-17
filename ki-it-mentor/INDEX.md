# INDEX — ki-it-mentor/

## Purpose
KI-IT-Mentor: Electron-Desktop-Overlay (Lernmentor + Copilot). Lesereihenfolge: `PROJECT.md` → `DESIGN.md` → `DECISIONS.md` → hier.

## Contents

| Pfad | Rolle | Source of truth? |
|---|---|---|
| `src/core/` | Framework-freie Logik: Typen, Redaction, Berechtigungen, Explanation Engine, Learning Engine, Curriculum, Knowledge Store, Claude-Code-Normalisierung | ja |
| `src/core/providers/` | Provider-Interface + Adapter (demo, anthropic, ollama) | ja |
| `src/main/` | Electron-Main: Fenster, IPC, Bestätigungs-Ledger, Persistenz | ja |
| `src/preload/` | Schmale `window.mentor`-Brücke | ja |
| `src/shared/ipc.ts` | IPC-Vertrag (Typen) | ja |
| `src/renderer/` | React-UI; `styles.css` = Design-Tokens | ja (Tokens) |
| `src/integrations/` | Claude-Code-Hook-CLI + Inbox-Pfad/Quoting | ja |
| `tests/unit/` | Vitest (Kernlogik, Provider, Hook, Markdown-UI) | — |
| `tests/e2e/` | Playwright gegen echte Electron-App, Mock der Messages API | — |
| `qa/screenshots/` | Von E2E erzeugte Screenshots (Belege der visuellen QA) | generiert |
| `scripts/build-main.mjs` | esbuild für Main/Preload/Hook | — |
| `memory/` | Projekt-lokale, wiederverwendbare Erkenntnisse | ja |
| `dist/`, `node_modules/` | Build/Abhängigkeiten (ignoriert) | generiert |

Dokumente: `README.md`, `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `DESIGN.md`, `MOTION-SPEC.md`, `REFERENCE-RESEARCH.md`, `SECURITY.md`, `PRIVACY.md`, `TROUBLESHOOTING.md`, `QA-REPORT.md`, `AGENT-ORCHESTRATION.md`, `POSTMORTEM.md`, `CHANGELOG.md`, `AGENTS.md`.

## Dependencies
Electron 33, React 18, `@anthropic-ai/sdk` 0.135 (nur Main). Dev: Vite 5, esbuild, TypeScript 5.6, Vitest 2, Playwright 1.56, ESLint 9.

## Important decisions
ADR-001 Electron · ADR-002 Versand-Manifest · ADR-005 Claude-Adapter · ADR-006 Hook-Integration · ADR-007 Lernstatus (siehe `DECISIONS.md`).

## Read first
`src/core/explanation.ts` (Datenfluss), `src/main/main.ts` (Vertrauensgrenze), `src/renderer/components/MentorPanel.tsx` (Hauptablauf).
