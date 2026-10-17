# PROJECT — KI-IT-Mentor

## Identity
- Name: KI-IT-Mentor · Typ: Desktop-App (Overlay) · Status: **MVP 0.1.0, lauffähig, getestet (Linux/Xvfb)**
- Repository: `zelos0/veee`, Ordner `ki-it-mentor/`, Branch `claude/funny-ride-2o0z8i`
- Stack: Electron 33 · React 18 · TypeScript · Vite/esbuild · Vitest · Playwright (ADR-001)

## Product
- Zweck: IT-Inhalte (Code, Diffs, Fehler, Architektur) nachvollziehbar erklären — zum Lernen und zum Lösen.
- Zielgruppe: Entwickler:innen und IT-Lernende.
- Primäre Jobs: Kontext geben → in passender Tiefe verstehen → Folgefragen → Wissen sichern (Notiz, Übung, Wiederholung).

## Compiled Intent (Gruppe A, aus START.md + Leitfaden)
- **P0:** drei Erklärtiefen · Lern- vs. Copilot-Modus · sichtbare Kontextquellen · Vorschau vor externem Versand · keine Ausführung/Dateiänderung · Lernnotizen löschbar · keine erfundenen Integrationen/Tests.
- **P1:** Overlay-Fensterverhalten · Lernstatusmodell + Übungen + Wiederholung · Claude-Code-Adapter über unterstützten Weg · Redaction · Provider-neutral.
- **P2:** Motion-Spezifikation, Reduced Motion, Accessibility, Export.
- **P3/später:** Claude Desktop (nur mit belegter Schnittstelle), weitere IDE/Browser/Terminal-Adapter, Bildschirmkontext.
- **Annahmen:** Sprache der Oberfläche Deutsch; Einzelplatznutzung; kein Konto/Login.
- **Konflikt gelöst:** „Integration in Claude Desktop“ vs. „nur nachweislich unterstützt“ → nicht implementiert, manueller Fallback (ADR-006).

## Experience
- Experience/Visual DNA: Richtung A „Messinstrument“ (`DESIGN.md`). Signature Moment: Versand-Manifest.
- Motion DNA: zweckgebunden, CSS-only, 120–240 ms, vollständig reduzierbar (`MOTION-SPEC.md`).

## Architecture
Siehe `ARCHITECTURE.md`. Einstiegspunkte: `src/main/main.ts`, `src/renderer/main.tsx`, `src/integrations/claude-code-hook.ts`.

## Current state

### Implementiert und getestet
Overlay-Grundgerüst · drei Tiefen · zwei Modi · Kontextquellen Text/Diff/Claude Code · Versand-Manifest + Main-Ledger · Redaction · Demo-/Claude-/Ollama-Adapter (Claude via Mock, Ollama via simuliertem fetch) · Fehler/Abbruch/Countdown · Lernpfad, Übungen, Statusmodell, Wiederholung, Persistenz · Notizen + Löschen · Hell/Dunkel · Reduced Motion · 360-px-Layout · Claude-Code-Hook (real mit CLI 2.1.302).

### Implementiert, nicht automatisiert getestet
Datei-Dialog · Export-Dialog · always-on-top · Tastatur-Verschieben · nächster Monitor · globales Kürzel · Ollama gegen echten Server · Claude gegen echte API.

### Offen / geplant
- Packaging & Signierung (electron-builder), dabei Electron-Fuses, ASAR-Integrity, `asarUnpack` für den Hook.
- Nativer Bestätigungsdialog im Main (Härtung gegen kompromittierten Renderer), `senderFrame`-Prüfung.
- KI-gestützte Bewertung von Freitext-Antworten (heute Rubrik-Heuristik, transparent markiert).
- Übungsgenerierung durch das Modell; mehr Themen in den 19 Bereichen.
- Streaming der Antworten; Kosten-/Tokenzähler aus `usage`.
- Claude Desktop: nur falls eine unterstützte Schnittstelle existiert; Alternative: MCP-Server des Mentors als **Werkzeug** für Claude (Desktop/Code), der Inhalte aktiv an den Mentor übergibt — braucht Freigabe.
- Bildschirmkontext (explizit, sichtbar, mit Vorschau) — nicht begonnen.
- Screenreader-Test mit NVDA/VoiceOver, Test auf macOS/Windows/Mehrmonitor.

### Blockiert / benötigt Freigaben
- Refero MCP nicht verfügbar → Recherche nur per Websuche (mittlere Konfidenz). Freigabe/Verbindung: Refero- oder Mobbin-Connector in claude.ai.
- Echter Claude-Test: `ANTHROPIC_API_KEY` (kostenpflichtig) — bewusst nicht angefordert.
- Kein Push/PR ohne Auftrag; Commits liegen auf dem Arbeitsbranch.

## Next
1. Packaging + Fuses für macOS/Windows/Linux, Smoke-Test je Plattform.
2. Echter Claude-Lauf mit Schlüssel (Kosten freigeben) und Eval einiger Erklärungen pro Tiefe.
3. KI-Bewertung für Freitext-Übungen hinter derselben Manifest-Grenze.

## Important files
`INDEX.md` · Entscheidungen: `DECISIONS.md` · Referenzen: `REFERENCE-RESEARCH.md` · QA: `QA-REPORT.md` · Memory: `memory/INDEX.md`
