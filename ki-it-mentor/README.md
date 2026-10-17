# KI-IT-Mentor

Schwebendes Desktop-Overlay, das Code, Diffs und Fehler in drei Tiefen erklärt — als **Lernmentor** (Verständnis, Übungen, Wiederholung) oder als **technischer Copilot** (Ursache, Lösung, Risiken, Tests). Transparent: Jede Kontextquelle ist sichtbar, und vor jedem externen Modellaufruf zeigt das **Versand-Manifest** genau, was den Rechner verlässt.

Status: **MVP, lauffähig und getestet** (Linux unter Xvfb; macOS/Windows nicht getestet). Details: `PROJECT.md`, `QA-REPORT.md`.

## Schnellstart

```bash
cd ki-it-mentor
npm ci
npm start                 # baut und startet das Overlay (lokaler Demo-Anbieter, offline)
```

Linux ohne Bildschirm (CI/Container): `xvfb-run -a npx electron . --no-sandbox` nach `npm run build`.

### Echte Erklärungen mit Claude

```bash
export ANTHROPIC_API_KEY=…        # nie in Dateien/Git ablegen
npm start                         # Setup → Anbieter „Anthropic Claude“
```

Optional: `KI_MENTOR_ANTHROPIC_MODEL` (Standard `claude-opus-5-5`), `KI_MENTOR_ANTHROPIC_EFFORT` (`low|medium|high|xhigh|max`, Standard `medium`). Kosten fallen bei Anthropic an; das Manifest zeigt eine Token-Schätzung.

### Lokales Modell (Ollama)

```bash
ollama pull qwen2.5-coder
export KI_MENTOR_OLLAMA_MODEL=qwen2.5-coder   # KI_MENTOR_OLLAMA_URL optional
```

Nur `127.0.0.1`/`localhost` gilt als lokal; jede andere Adresse wird als extern behandelt (mit Manifest).

## Bedienung

| Aktion | Weg |
|---|---|
| Overlay ein/aus | `Strg/Cmd+Umschalt+M` (global) |
| Fenster verschieben | Titelleiste ziehen · `Strg+Alt+Pfeile` (mit `Umschalt` in großen Schritten) |
| Immer im Vordergrund / nächster Monitor | Pin- bzw. Monitor-Symbol in der Titelleiste |
| Modus | „Lernen“ / „Copilot“ in der Titelleiste |
| Kontext | „+ Text/Code“, „+ Datei“ (Dialog, nur lesen), „+ Diff“, „Claude Code“ |
| Fragen | `Strg+Enter`; Tiefe: Präzise · Einfach · Schritt für Schritt |
| Folgeaktionen | Beispiel · Risiken · Verständnistest · Mehr … (Zeile für Zeile, Warum, Alternativen) |
| Bereiche | `Alt+1…4` (Fragen, Lernpfad, Notizen, Setup) |
| Abbrechen | `Esc` (Manifest oder laufende Anfrage) |

## Claude Code

```bash
npm run build
node dist/claude-code-hook.cjs install --settings /pfad/zum/projekt/.claude/settings.local.json
# entfernen:
node dist/claude-code-hook.cjs uninstall --settings /pfad/zum/projekt/.claude/settings.local.json
# nur anzeigen:
node dist/claude-code-hook.cjs print-config
```

Der `PostToolUse`-Hook (Edit/MultiEdit/Write/Bash) schreibt geschwärzte Kurzfassungen nach `~/.ki-it-mentor/inbox/claude-code.jsonl`. Im Mentor: Setup → „Ereignisse aus Claude Code anzeigen“, dann Fragen → „Claude Code“ → „Übernehmen“. Der Hook blockiert Claude Code nie (Exit 0, keine Ausgabe, max. 3 s). Validiert mit Claude Code 2.1.302 (siehe `QA-REPORT.md`).

**Claude Desktop:** Es gibt keinen unterstützten Weg, Desktop-Chats auszulesen. Fallback: Inhalte manuell als Kontext einfügen.

## Entwicklung

```bash
npm run typecheck && npm run lint && npm test     # = npm run check
npm run build && xvfb-run -a npx playwright test   # E2E gegen die echte Electron-App
```

## Dokumentation

`PROJECT.md` (Stand) · `ARCHITECTURE.md` · `DECISIONS.md` · `DESIGN.md` · `MOTION-SPEC.md` · `REFERENCE-RESEARCH.md` · `SECURITY.md` · `PRIVACY.md` · `TROUBLESHOOTING.md` · `QA-REPORT.md` · `AGENT-ORCHESTRATION.md` · `POSTMORTEM.md` · `CHANGELOG.md` · `INDEX.md`
