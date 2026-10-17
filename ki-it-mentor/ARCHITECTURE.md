# ARCHITECTURE — KI-IT-Mentor

## Stack

Electron 33 (Main + sandboxed Renderer) · React 18 · TypeScript (strict) · Vite (Renderer) · esbuild (Main/Preload/Hook-CLI) · Vitest · Playwright (`_electron`). Begründung: `DECISIONS.md` ADR-001.

## Prozess- und Vertrauensgrenzen

```text
┌──────────────────────── Renderer (sandbox, contextIsolation, CSP) ───────────────┐
│ UI: App · MentorPanel · LearnPanel · NotesPanel · SetupPanel                     │
│ nutzt core/* nur für reine Logik (Lernstatus, Labels, Kontext-Items)             │
│ kein Node, kein Netzwerk (CSP connect-src 'none'), keine Schlüssel               │
└───────────────▲──────────────────────────────────────────────────────────────────┘
                │ window.mentor (preload, typisiert: src/shared/ipc.ts)
┌───────────────┴──────────────── Main-Prozess ────────────────────────────────────┐
│ IPC-Handler · Fenster (Overlay, always-on-top, Multi-Monitor, Shortcut)          │
│ Provider-Registry (demo · anthropic · ollama) — API-Key nur hier, aus Env        │
│ buildManifest() wird beim Senden NEU gebaut → exakt geschwärzter Payload         │
│ Dateien nur über OS-Dialog (≤200 KB, Text) · FileBackend (atomares JSON)         │
│ Inbox-Watcher (~/.ki-it-mentor/inbox/claude-code.jsonl)                          │
└───────────────▲──────────────────────────────────────────────────────────▲───────┘
                │ HTTPS (nur nach Bestätigung)                              │ Datei
         Anthropic API / lokales Ollama                  Claude Code ── PostToolUse-Hook
                                                         (dist/claude-code-hook.cjs)
```

## Module (logisch → Datei)

| Modul | Datei(en) | Verantwortung |
|---|---|---|
| Desktop Shell / Overlay | `src/main/main.ts` | Rahmenloses Fenster, Position/Größe pro Monitor, `Strg/Cmd+Umschalt+M`, Tastatur-Verschieben, nächster Monitor |
| UI | `src/renderer/**` | Darstellung, Zustände, Tastatur, Live-Region |
| Mentor Core | `src/renderer/App.tsx` (Orchestrierung), `src/core/types.ts` | Modus, Tiefe, Aktionen |
| Context Engine | `src/core/explanation.ts` (`makeContextItem`, `buildManifest`), `MentorPanel` | Quellen-markierte Kontext-Items, Budget, Kürzung |
| Explanation Engine | `src/core/explanation.ts` | Systemprompt je Modus × Tiefe × Aktion, Manifest |
| Learning Engine | `src/core/learning.ts`, `src/core/curriculum.ts` | Statusmodell, Evidenz, Wiederholung, Übungsbewertung |
| Knowledge Store | `src/core/knowledge.ts`, `src/main/file-backend.ts` | Notizen, Fortschritt, Einstellungen; Export/Löschen |
| Provider Interface | `src/core/providers/provider.ts` | `Provider`, `ProviderError`, Timeout/Cancel |
| Provider Adapters | `demo.ts`, `anthropic.ts`, `ollama.ts` | Lokal regelbasiert · Claude (SDK) · lokales Modell |
| Integration Adapters | `src/core/claude-code.ts`, `src/integrations/*` | Hook-Ereignis → geschwärzte Inbox; install/uninstall |
| Security/Privacy | `src/core/redaction.ts`, `src/core/permissions.ts`, CSP, Electron-Härtung | Schwärzung, Berechtigungsstufen, Sandbox |
| Telemetrie | — | Bewusst keine. Logs nur Fehlerklasse + Anbieter, ohne Inhalte |

## Datenflüsse

**Erklären (lokal):** UI → `preview` (für Beleg) → `run` → Main baut Manifest → DemoProvider/Ollama → Antwort → UI (Cache je Tiefe in der Sitzung).
**Erklären (extern):** UI → `preview` → **Versand-Manifest** (Bestätigung Enter / Abbruch Esc) → `run` → Main baut Manifest erneut aus demselben Request → Anthropic SDK (`fallbacks: 'default'`, Effort `medium`, Timeout 120 s, 1 SDK-Retry) → Antwort/typisierter Fehler.
**Lernen:** Übung → `evaluateAnswer` (exakt / Rubrik-Heuristik) → `evidenceFor` → `applyEvidence` → Persistenz (Debounce 250 ms).
**Claude Code:** Claude Code führt Hook mit Event-JSON auf stdin aus → `summarizeHookInput` (Schwärzung, Kürzung 6 000 Z., relative Pfade) → JSONL-Append (Rotation > 512 KB) → Main `watchFile` → UI listet → Nutzer:in übernimmt einzeln als Kontext.

## Fehlerzustände

`ProviderErrorCode`: `not_configured · auth · rate_limit (retry-after) · overloaded · network · timeout · cancelled · refusal · bad_request · unknown` → deutschsprachige Meldung ohne Anfrageinhalt (`describeError`). Korrupte State-Datei wird umbenannt (`.corrupt-<ts>`) statt überschrieben.

## Erweiterungspunkte

- Neuer Anbieter: `Provider` implementieren, in `registerProviders()` eintragen.
- Neue Themen/Übungen: Daten in `src/core/curriculum.ts`.
- Neue Integration: Ereignis → `InboxEvent` normalisieren; UI übernimmt unverändert.
