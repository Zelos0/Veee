# DECISIONS — KI-IT-Mentor

Format: Kontext · Entscheidung · Alternativen · Begründung · Konsequenzen · Umkehrbarkeit. Kette nach `REFERO-ULTRA-X/DECISION-LEDGER.md`: Quelle → Prinzip → Entscheidung → Umsetzung → Ergebnis.

## ADR-001 — Electron + TypeScript/React statt Tauri (2026-10-17)

- **Kontext:** Leeres Zielprojekt (Repo enthielt nur README und ein fremdes Git-Bundle). START.md verlangt Abwägung Tauri vs. Electron und genau einen Stack.
- **Geprüft (tatsächlich):** `pkg-config webkit2gtk-4.1` und `gtk+-3.0` fehlen im Container → Tauri hier nicht bau-/testbar. `npm i electron@33.2.1` lädt das Binary; Start unter `xvfb-run` erfolgreich (`ELECTRON_OK 33.2.1`).
- **Entscheidung:** Electron 33 + React 18 + TypeScript.
- **Alternativen:** Tauri 2 (kleinere Binaries, Rust-Backend, Systemwebview — Vorteil Speicher/Größe; Nachteil: hier nicht verifizierbar, zwei Sprachen für ein MVP).
- **Begründung:** Nur ein Stack, der in dieser Umgebung gebaut, gestartet und per Playwright E2E getestet werden kann, erlaubt ehrliche Qualitätsaussagen. Kernlogik liegt framework-frei in `src/core/` und wäre bei einem Wechsel wiederverwendbar.
- **Konsequenzen:** Größerer Speicherbedarf; Sicherheitshärtung von Electron ist Pflicht (Sandbox, contextIsolation, CSP, Navigationssperre).
- **Umkehrbarkeit:** mittel — `core/` portabel, Main/Preload müssten ersetzt werden.

## ADR-002 — Externer Versand nur über Versand-Manifest (2026-10-17)

- **Quelle:** START.md §4 („Vor externem Modellaufruf anzeigen, welche Kontextdaten übertragen werden“); Referenz Cursor/Copilot (Transparenz) — siehe REFERENCE-RESEARCH.md.
- **Entscheidung:** Für Anbieter `kind: 'external'` zeigt die UI vor jedem Versand ein Manifest (Quellen, Größen, Schwärzungen, Ziel, Modell, Token-Schätzung, exakter Payload). Main baut das Manifest beim Senden aus demselben Request neu, statt den Renderer-Payload zu übernehmen. Die Bestätigung ist nicht abschaltbar (`confirmExternalSend: true` wird beim Laden erzwungen).
- **Ergebnis:** E2E: nach Esc 0 Anfragen am Mock; nach Enter 1 Anfrage, geheimer Schlüssel nicht enthalten.

## ADR-003 — Schwärzung zentral in `buildManifest` (2026-10-17)

- **Entscheidung:** Redaction passiert an genau einer Stelle, die jeder Provider-Aufruf durchlaufen muss, plus im Hook vor dem Schreiben auf Platte.
- **Grenze:** Mustersuche, keine Garantie (SECURITY.md).

## ADR-004 — Lokaler Demo-Anbieter als Default (2026-10-17)

- **Kontext:** Kein API-Schlüssel in der Umgebung; MVP muss offline benutzbar und deterministisch testbar sein.
- **Entscheidung:** Regelbasierter Anbieter, der nur Strukturfakten aus dem Kontext ableitet und in jeder Antwort offenlegt, dass er keine KI ist.
- **Alternative:** Ohne Schlüssel gar nichts anzeigen → schlechter Erstkontakt, keine Tests der drei Tiefen.

## ADR-005 — Anthropic über offizielles SDK, Modell `claude-opus-5-5`, Effort `medium`, `fallbacks: 'default'` (2026-10-17)

- **Quelle:** Mitgelieferte claude-api-Referenz dieser Claude-Code-Version (Modell-Default, Effort-Default `medium` auf Opus 5.5 explizit setzen, Refusal-Fallbacks standardmäßig aktiv, typisierte Fehlerklassen).
- **Entscheidung:** SDK `@anthropic-ai/sdk@0.135` im Main-Prozess, `maxRetries: 1`, eigener Timeout 120 s; Modell per `KI_MENTOR_ANTHROPIC_MODEL`, Effort per `KI_MENTOR_ANTHROPIC_EFFORT` überschreibbar.
- **Hinweis Kosten:** Fallback-Modell kann bei Ablehnung antworten (Beleg zeigt „beantwortet von …“).

## ADR-006 — Claude-Code-Integration über PostToolUse-Hook + lokale Inbox (2026-10-17)

- **Geprüft:** Installierte CLI 2.1.302 unterstützt Hooks (`--bare` „skip hooks“ in `claude --help`) und MCP (`claude mcp`). Real validiert: Hook in Testprojekt installiert, `claude -p` (Haiku) hat `Write` ausgeführt, Ereignis landete geschwärzt in der Inbox; `uninstall` hinterließ `{}`.
- **Entscheidung:** Einseitiger, nicht-blockierender Hook (Exit 0, keine stdout-Ausgabe). Mentor liest nur die Datei; Übernahme als Kontext je Ereignis durch Nutzer:in.
- **Verworfen (vorerst):** MCP-Server des Mentors für Claude Code/Desktop — sinnvoll als Phase 5, aber mehr Angriffsfläche; Claude Desktop bietet keinen unterstützten Weg, Chats auszulesen.

## ADR-007 — Lernstatus nur durch Leistung, einfache Intervalle statt FSRS (2026-10-17)

- **Quelle:** Implementierungsleitfaden („Gelesener Inhalt allein beweist keine Beherrschung“), Referenz FSRS (nur Zustandsklarheit übernommen).
- **Entscheidung:** `explanation_viewed` hebt max. auf `introduced`; Aufstieg nur über bestandene Übungen; Fehler nach Beherrschung → `needs_review`; bestandene Wiederholung stellt besten Stand wieder her; Intervalle 1/3/7/16/35 Tage.
- **Grenze:** Freitext-Bewertung ist Schlüsselbegriff-Heuristik und wird als solche angezeigt; KI-Bewertung offen.

## ADR-008 — Theme als Einstellung statt nur `prefers-color-scheme` (2026-10-17)

- **Befund (E2E):** Unter Linux/Xvfb reicht `nativeTheme.themeSource` die Präferenz nicht an `prefers-color-scheme` durch.
- **Entscheidung:** `settings.theme` = System/Hell/Dunkel, in `App.tsx` zu `data-theme` aufgelöst (mit Listener auf Systemwechsel).

## ADR-009 — Redaction linear und namensbasiert (2026-10-17)

- **Quelle:** Reprompt-Runde 2 (N1 ReDoS 232 s, N2 Lücken, N3 Fehlalarme); eigene Profilmessung fand zusätzlich quadratische E-Mail-/URL-Regeln.
- **Entscheidung:** Zuweisungen in einem einzigen, begrenzten Regex-Pass erkennen und die Bedeutung (Name endet auf Secret-Wort, Werteart, Konfig-Zeile) im Replacer entscheiden; alle übrigen Regeln am Lauf-Anfang verankern bzw. längenbegrenzen; Eingabe vor Redaction kürzen.
- **Alternative:** Entropie-Scanner (gitleaks-ähnlich) — mehr Treffer, aber neue Abhängigkeit und mehr Fehlalarme; offen für später.
- **Ergebnis:** Laufzeit < 1 s bei 100 000 adversarialen Zeichen; Positiv- und Negativkatalog in `tests/unit/redaction.test.ts`.

## Konfliktprotokoll Agentengruppen

Siehe `AGENT-ORCHESTRATION.md` → Reprompt-Runden.
