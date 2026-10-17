# POSTMORTEM — KI-IT-Mentor MVP (2026-10-17)

Nach `REFERO-ULTRA-X/agents/POSTMORTEM-AGENT.md`.

## Was wir glaubten — und warum
- Transparenz („was verlässt den Rechner?“) ist das, was einen IT-Mentor vertrauenswürdig macht. Grundlage: START.md §4 und Referenzen Cursor/Copilot (mittlere Evidenz).
- Ein lokaler, regelbasierter Anbieter macht das Produkt ohne Schlüssel testbar, ohne Ehrlichkeit zu opfern.
- Electron ist in dieser Umgebung der einzige verifizierbare Desktop-Stack.

## Was gebaut wurde
Overlay mit zwei Modi, drei Tiefen, Kontext-Chips, Versand-Manifest mit Main-seitigem Einmal-Ledger, drei Provider-Adaptern, Lernpfad mit leistungsbasiertem Statusmodell, Notizen, Claude-Code-Hook. 66 Unit-Tests, 7 E2E-Szenarien, 12 Screenshots, 2 reale Claude-Code-Läufe.

## Was funktioniert hat
- **Versand-Manifest** als Signature Moment: vom UX-Review als stärkste Entscheidung benannt; per E2E beweisbar (0 Requests nach Esc, kein Versand ohne ID).
- **Mock der Messages API** statt echtem Schlüssel: echter SDK-Pfad end-to-end getestet, ohne Kosten.
- **Diff-basiertes Reprompting zweier getrennter Review-Gruppen:** 32 Befunde, fast disjunkt; Runde 2 fand Regressionen der eigenen Fixes (ReDoS, Lücken), die sonst geblieben wären.
- **Mutationsprobe** beim Flush-Test.

## Was nicht funktioniert hat
- Refero MCP nicht verfügbar; Web-Abrufe scheiterten (DNS) → Recherche nur aus Suchsnippets.
- Erste Redaction-Version: zu breit (zerstörte Code), dann zu eng (ziffernlose Passwörter) und quadratisch langsam. Erst die dritte Fassung (linear, namensbasiert) ist tragfähig.
- Bestätigung zunächst nur im Renderer — fachlich naheliegend, sicherheitlich zu schwach.
- `nativeTheme` unter Linux/Xvfb wirkungslos → Theme-Einstellung nötig.

## Wichtigste Entscheidungen (Wirkung)
1. ADR-002 Versand-Manifest + Main-Ledger — prägt Produktidentität und Sicherheitsmodell.
2. ADR-004 Demo-Anbieter — ermöglichte deterministische E2E-Tests der drei Tiefen.
3. ADR-009 lineare Redaction — beseitigte einen App-Blocker (232 s).

## Unnötige Komplexität
- Keine Motion-Bibliothek, kein State-Framework nötig — CSS + React-State reichten.
- `permissions.ts` ist im MVP nur eine Obergrenze; echte Stufenvergabe kommt erst mit Ausführungsfunktionen.

## Wiederverwenden
Mock-API-Muster für Provider-E2E, Einmal-Manifest im privilegierten Prozess, lineare Redaction mit Positiv-/Negativkatalog + Laufzeitschranke, getrennte Review-Gruppen mit Befund-Checkliste in Runde 2.

## Vermeiden
Regex-Muster mit `[\w-]*…[\w-]*` um Schlüsselwörter; Bestätigungen nur im UI-Prozess; Wand gleichgewichteter Folgeaktionen.

## Evidenz
Commits auf `claude/funny-ride-2o0z8i`; `qa/screenshots/`; `QA-REPORT.md`; `AGENT-ORCHESTRATION.md`; `memory/`.
