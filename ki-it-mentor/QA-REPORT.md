# QA-REPORT — KI-IT-Mentor 0.1.0

Umgebung: Linux-Container (Claude Code, Cloud), Node 22.22, Electron 33.2.1 unter `xvfb-run`, Chromium aus Playwright 1.56.1. **Nicht getestet:** macOS, Windows, echte Mehrmonitor-Hardware, echter Anthropic-API-Aufruf (kein Schlüssel vorhanden — stattdessen lokaler Mock der Messages API), Ollama (nicht installiert — Unit-Tests mit simuliertem `fetch`), Screenreader (NVDA/VoiceOver).

Status-Legende: **✅ implementiert und getestet** · **🟡 implementiert, nicht (automatisiert) getestet** · **🟠 teilweise** · **⬜ geplant/nicht verfügbar**

## Tatsächlich ausgeführte Prüfungen (letzter Lauf)

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Typecheck | `npx tsc -p .` | ✅ 0 Fehler |
| Lint | `npx eslint .` | ✅ 0 Befunde |
| Unit | `npx vitest run` | ✅ 66/66 |
| Build | `npm run build` | ✅ |
| E2E | `xvfb-run -a npx playwright test` | ✅ 7/7 |
| Mutationsprobe Schließen-Flush | Flush deaktiviert → Test rot; wiederhergestellt → grün | ✅ |
| Reale Claude-Code-Integration (2 Läufe) | `claude -p … --model claude-haiku-5-5` in Wegwerf-Projekten mit installiertem Hook | ✅ Lauf 1: Write-Ereignis in Inbox, `uninstall` → `{}`. Lauf 2 (nach Härtung): Bash + Write erfasst, `token: abc123…` als `[REDACTED:secret]` gespeichert, Rechte 700/600 |
| Redaction-Laufzeit | 5 adversariale Eingaben à 100 000 Zeichen | ✅ je < 1 s (vorher bis 232 s laut Review-Messung) |
| Kontrast | WCAG-Formel über alle Text-Tokens × Flächen beider Themes | ✅ alle ≥ 4,5:1 (nach Korrektur von 3 Tokens) |
| Visuelle Inspektion | 12 Screenshots angesehen | siehe unten |

## Funktionsmatrix

| Funktion | Status | Beleg |
|---|---|---|
| Drei Erklärtiefen (präzise/einfach/vereinfacht + Analogie) | ✅ | E2E 1, Unit demo/explanation |
| Lernmentor vs. Copilot unterscheidbar (Prompt, Selbsttest-Frage, Markierung) | ✅ | Unit explanation/demo, E2E 4/7, Screenshot 12 |
| Kontextquellen sichtbar (Text, Datei, Diff, Claude Code) | ✅ (Datei-Dialog 🟡) | E2E 1/6; Datei-Dialog nicht automatisierbar |
| Versand-Manifest + Schwärzung + exakter Payload | ✅ | E2E 2, Screenshot 04 |
| Kein Versand ohne Bestätigung (UI + Main-Ledger) | ✅ | E2E 2 (Esc → 0 Requests; Bypass → `bad_request`) |
| Fehlerzustände (Ratenlimit mit Countdown, nicht eingerichtet, Abbruch) | ✅ | E2E 2/3, Unit provider/anthropic |
| Offline/Netzfehler/Timeout | 🟡 | Unit (Mapping, Timeout); kein E2E mit echtem Netzverlust |
| Lernstatus nur durch Leistung, Wiederholung, Persistenz | ✅ | Unit learning, E2E 4 |
| Notizen anlegen/löschen/alle löschen, Daten löschen | ✅ | E2E 1/4/5 |
| Notizen exportieren (MD/JSON) | 🟡 | Unit (Export-Inhalt); Speichern-Dialog nicht automatisiert |
| Overlay: always-on-top, Tastatur-Verschieben, nächster Monitor, globales Kürzel | 🟡 | Code; unter Xvfb ohne Fenstermanager/Mehrmonitor nicht aussagekräftig |
| Reduced Motion (System + Einstellung) | ✅ | E2E 7 (Token = 0 ms) |
| Schmale Breite 360 px ohne Overflow | ✅ | E2E 7, Screenshot 11 |
| Hell/Dunkel | ✅ | E2E 7, Screenshots 11/12 |
| Claude-Code-Hook | ✅ | Unit, E2E 6, reale CLI |
| Claude Desktop | ⬜ | keine unterstützte Schnittstelle zum Auslesen von Chats |
| Bildschirmkontext | ⬜ | bewusst nicht implementiert |
| Anthropic real | 🟡 | Adapter mit Mock + Fake-Client getestet; kein echter Schlüssel |
| Ollama real | 🟡 | Unit mit simuliertem `fetch` |

## State-Matrix (Mentor-Ansicht)

| Zustand | Abgedeckt | Beleg |
|---|---|---|
| leer (kein Kontext/keine Frage) → Senden gesperrt + Hinweis | ✅ | E2E 1, Screenshot 01 |
| lädt (verzögert 300 ms, Abbrechen fokussiert, Esc) | ✅ | E2E 3 |
| Erfolg / Cache je Tiefe | ✅ | E2E 1 |
| veraltete Antwort bei Tiefenwechsel mit Fehler („zeigt noch: …“) | ✅ | E2E 2 |
| Fehler mit Countdown | ✅ | E2E 2, Screenshot 06 |
| nicht eingerichtet → „Setup öffnen“ | 🟡 | Code |
| langer Inhalt / lange Labels | ✅ | Screenshot 11 (Ellipse) |

## Visuelle QA — Befunde und Status

| # | Befund | Schwere | Status |
|---|---|---|---|
| V1 | Horizontaler Overflow bei 360 px (Titelleiste) | P1 | behoben (Marke kollabiert < 400 px) |
| V2 | Manifest mit Payload drückte Antwortbereich auf ~0 px | P1 | behoben (Eingabe weicht, max. 70 vh) |
| V3 | „Payload ausblenden“ über volle Breite | P3 | behoben |
| V4 | 3 Tokens < 4,5:1 | P2 | behoben |
| V5 | Dunkelmodus griff unter Linux nicht | P1 | behoben (Theme-Einstellung) |
| V6 | „1 Zeilen“ | P3 | behoben |
| V7 | Absoluter Pfad in Claude-Code-Labels | P3 | behoben (relativ zu `cwd`) |

## Agenten-Reviews

Runde 1: 24 Befunde (5×P1). Runde 2: 8 neue Befunde (2×P1) + 2 Reste — alle umgesetzt. Details: `AGENT-ORCHESTRATION.md`.

## Bekannte Grenzen

Siehe `PROJECT.md` → „Offen“.
