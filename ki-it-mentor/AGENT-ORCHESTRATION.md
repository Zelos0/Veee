# AGENT-ORCHESTRATION — Refero-Agentengruppen in diesem Projekt

Grundlage: `../START.md` §2 und `../REFERO-ULTRA-X/` (AGENTS, WORKFLOW, agents/*, quality/*). Echte Subagenten standen zur Verfügung (Claude Code `Agent`-Werkzeug) und wurden für klar trennbare Prüfaufträge parallel eingesetzt. Implementierung lief sequenziell in der Hauptsitzung. Keine Parallelität wurde simuliert.

## Gruppen → tatsächlicher Einsatz

| Gruppe | Rollen/Module | Wie ausgeführt | Ergebnis |
|---|---|---|---|
| A Intent & Kontext | INTENT-COMPILER, DESIGN-CONTEXT-COMPILER, MEMORY-RETRIEVER, CONTEXT-RECOVERY | Hauptsitzung: START.md, Leitfaden, Zugangsanleitung, START-HERE + Pflichtdateien gelesen; Repo inventarisiert (README + fremdes Flutter-Bundle `appfactorytag4v2.bundle`, unverändert gelassen); Memory der Skill-Quelle geprüft (nur leere Vorlagen → nichts übernommen) | Kompilierter Auftrag → `PROJECT.md` |
| B Recherche | MCP-RESEARCH-AGENT, MCP-RESEARCH-PROTOCOL | Live-Registry geprüft (kein Refero-MCP; Mobbin nicht verbunden); **1 Subagent** mit 9 Websuchen (Fallback) | `REFERENCE-RESEARCH.md` |
| C Produkt/UX/Kreativ | CREATIVE-/UX-DIRECTOR, REFERENCE-CURATOR, ORIGINALITY-REVIEWER, ANTI-AI-SLOP | Richtungen A/B, These, Reference Lock (Hauptsitzung); Review per Subagent (Runde 1, Runde 2) | `DESIGN.md`, Fixes |
| D Architektur/Technik | TECHNICAL-DIRECTOR, SYSTEM/ARCHITECTURE, MODEL-PORTABILITY | ADRs, Modulgrenzen, Provider-Schicht (Hauptsitzung); Sicherheitsreview per Subagent | `ARCHITECTURE.md`, `DECISIONS.md` |
| E Motion | MOTION-RECONSTRUCTION, MOTION-SYSTEM, RESPONSIVE, ACCESSIBILITY, PERFORMANCE | Spezifikation + CSS-Implementierung; Review in Gruppe C+E+F | `MOTION-SPEC.md` |
| F Qualität | VISUAL-QA, STATE-MATRIX, EDGE-CASE-ENGINE, DESIGN-LINTER, USER-SIMULATOR | Unit/E2E/Screenshots/Kontrastrechnung (Hauptsitzung) + Subagenten-Reviews | `QA-REPORT.md` |
| G Doku/Memory | SELF-DOCUMENTATION-AGENT, POSTMORTEM-AGENT, PATTERN-MINER | Hauptsitzung | alle `*.md`, `memory/`, `POSTMORTEM.md` |

## Dynamische Auswahl

| Phase | Ausgelöst durch | Aktive Gruppen |
|---|---|---|
| 0 Bootstrap | Start | A |
| 1 Architektur/Spezifikation | leeres Projekt, Stack-Wahl | A, B, C, D |
| 2–4 Vertikales MVP, Lernsystem, Claude-Code-Adapter | neue Module | D, E, F, G |
| E2E-QA | erste lauffähige App | F (fand 3 Defekte) → C+E (Overflow, Fokus) |
| Visuelle QA | Screenshots | C, E, F (fand Manifest-Höhe, Kontrast, Dunkelmodus) |
| Reprompt Runde 1 | Diff 17a0fb0..9d45ce4 | **D+F** (Sicherheit/Edge Cases) ‖ **C+E+F** (UX/Motion/A11y) — parallel |
| Reprompt Runde 2 | Diff 9d45ce4..55eb380 | **D+F+C** gebündelt (Verifikation der Fixes, Regressionen) |
| Abschluss | — | G |

## Reprompting — wie die Aufträge gebaut wurden

Jeder Gruppenauftrag wurde aus dem aktuellen Stand neu zusammengesetzt, nicht aus einer Vorlage: Commit-Hash und Diff-Bereich, die konkret betroffenen Dateien, bisher getroffene Entscheidungen (ADR-Nummern, Richtung A, Berechtigungsobergrenze), gruppenspezifische Prüffragen, Ausgabeformat (Befund · Schwere · Ort · Fehlerpfad · Fix), Kennzeichnung verifiziert/angenommen und die ausdrückliche Aufforderung, veraltete Annahmen im Auftrag zu korrigieren. Runde 2 enthielt die vollständige Befundliste aus Runde 1 als Checkliste plus gezielte Fragen zu Nebenwirkungen der Fixes.

### Runde 1 — Ergebnis

- **D+F:** 12 Befunde (1×P1, 9×P2, 2×P3). Korrigierte zwei Annahmen des Auftrags (Manifest-Neubau schützt nicht den Abgleich mit der Bestätigung; „lokal“ ist bei Ollama nicht garantiert).
- **C+E+F:** 12 Befunde (4×P1, 6×P2, 2×P3). Stärkste Entscheidung: Versand-Manifest. Schwächste: Wand aus 7 gleichgewichteten Folgeaktionen.
- **Umgesetzt:** alle P1/P2 bis auf die unten genannten; je Befund ein Fix, Tests ergänzt (Unit 54 → 61, E2E 5 → 7), Mutationsprobe für den Schließen-Flush.
- **Bewusst nicht umgesetzt (Trade-off dokumentiert):** Schließ-Animation des Manifests (U9 — harte Rückkehr ist schneller und bei Esc erwartbar); Electron-Fuses/ASAR-Integrity und `senderFrame`-Prüfung (S12 — erst mit Packaging sinnvoll, siehe PROJECT.md offen).

### Runde 2 — Ergebnis

Auftrag: Runde-1-Liste als Checkliste + gezielte Fragen zu Nebenwirkungen der Fixes (Diff 9d45ce4..55eb380). Die Agentin hat eigene Probe-Skripte gemessen, u. a. Laufzeit der Regexe.

- **Verifiziert behoben:** S1, S2 (Einmal-ID, Anbieter-Bindung, Retry/Fallback korrekt), S3 (3,05 s), S6–S12, U1–U12 (bis auf Reste unten).
- **Neue Befunde:** N1 **P1** ReDoS in der Namensregel (25 000 Zeichen → 232 s; Altlast, durch `token` verbreitert) · N2 **P1** Lücke: ziffernlose Passwörter, `-p`-Flags, gequotetes `curl -u` · N3 P2 Fehlalarme (`tokenizer`, `csrfToken: "{{…}}"`, Prosa „Basic authentication“ …) · N4 P2 „Gespeichert ✓“ nach Löschen veraltet · N5 P3 Fokusverlust bei „Mehr …“/Speichern · N6 P3 Hook-Install (Nicht-Array, Symlink, chmod fremder Ordner) · N7 P3 doppelte IDs · N8 P3 Flush ohne `catch`, Wipe-Race mit spät eintreffender Antwort. Zusätzlich: Esc auf anderem Tab brach unsichtbar einen Lauf ab; S8-Rest (gelesene Bytes).
- **Umgesetzt (alle):** Zuweisungs-Redaction neu als lineare Ein-Pass-Funktion (Name ≤ 64 Zeichen ohne verschachtelte Quantoren, Namensprüfung „endet auf password/token/…“ im Replacer, Konfig-Zeilen und SCREAMING_CASE ohne Ziffernpflicht, Template-/URL-/Pfad-Werte ausgenommen); E-Mail- und URL-Regel per Lookbehind verankert (die eigentliche quadratische Ursache — von meiner Profilmessung gefunden, nicht vom Review); Eingabe vor Redaction begrenzt; `-p`/`--password`/gequotetes `-u`; Basic nur im `Authorization`-Header; Notizstatus aus dem Store abgeleitet; Fokusführung; Abschnitts-IDs; `catch` + `wiping`-Sperre; Hook: Nicht-Array → Abbruch ohne Änderung, Symlink-treu, Dateimodus erhalten, chmod nur auf selbst angelegtes Verzeichnis; Esc nur bei sichtbarem Tab; `bytesRead`.
- **Belege:** Unit 61 → 66 (u. a. Laufzeit < 1 s für 5 adversariale 100-k-Eingaben, Fehlalarm-Katalog bleibt unverändert), E2E 7/7, zweiter Realtest mit Claude Code 2.1.302 (Secret im echten Ereignis geschwärzt, Rechte 700/600).
- **Schleife beendet** (2/2 Runden). Verbleibende Annahmen: Windows-`%VAR%`-Expansion im Hook-Befehl (S11, nicht getestet); Manifest nennt angefragtes Modell, ein Server-Fallback wird erst im Beleg sichtbar (bewusst, ADR-005).

## Schleifenbegrenzung

Max. zwei Überarbeitungsrunden je Qualitätsproblem (START.md §2.5). Nach Runde 2 verbleibende Punkte werden dokumentiert, nicht weiter iteriert.

## Konflikte zwischen Gruppen

| Konflikt | Vorschlag Technical Director | Entscheidung |
|---|---|---|
| UX wollte die Eingabe sichtbar ins Manifest „verwandeln“ (Animation), Sicherheit wollte das Manifest als harte Bestätigungsgrenze | Frage im Manifest als Zitat zeigen, Eingabefeld während der Bestätigung ausblenden; keine Schließanimation | umgesetzt (kein Nutzerentscheid nötig, reversibel) |
| Redaction: mehr Treffer (Sicherheit) vs. weniger zerstörter Code (UX/Erklärqualität) | Ungequotete Werte nur mit Buchstaben+Ziffern; gequotete immer; IBAN nur mit Prüfsumme | umgesetzt, beide Richtungen durch Tests abgesichert |
