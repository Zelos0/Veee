# SECURITY — KI-IT-Mentor

## Berechtigungsstufen

`read` → `analyze` → `suggest` → `execute` (`src/core/permissions.ts`). **MVP-Obergrenze: `suggest`.** Der Mentor führt keine Shell-Kommandos aus, ändert keine Dateien, installiert nichts, pusht nichts. Lesender Dateizugriff nur über den OS-Dateidialog (Einzeldatei, ≤ 200 KB, Text). Inhalte aus Dateien, Logs, Hooks, Modellantworten sind **untrusted data** und können keine Rechte erteilen; der Systemprompt sagt dem Modell das ausdrücklich.

## Electron-Härtung (implementiert)

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`; Preload exponiert nur `window.mentor` (typisiert).
- CSP: `default-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'` — der Renderer kann nicht ins Netz.
- `will-navigate` blockiert; `setWindowOpenHandler` → nur `https://` im System-Browser, sonst verweigert.
- Modellantworten werden als React-Elemente gerendert, nie als HTML (Unit-Test: kein `<img>`/`<script>`).
- API-Schlüssel nur im Main-Prozess aus Umgebungsvariablen; nie im Renderer, in Logs oder Dateien.
- **Bestätigungs-Ledger im Main:** `preview()` hinterlegt das Manifest unter einer Einmal-ID (5 min); externer `run()` sendet nur genau diesen Payload. Ohne gültige ID: kein Versand (E2E-geprüft).
- `setPermissionRequestHandler`/`setPermissionCheckHandler` verweigern alles; `will-attach-webview` und `will-redirect` blockiert; laufende Anfragen werden bei `before-quit` abgebrochen.
- Datei-Dialog: nur reguläre Dateien, Lesen auf 200 KB begrenzt (kein Volllesen großer Dateien).

## Schwärzung

`src/core/redaction.ts`: Private Keys, Anthropic/OpenAI/Stripe/npm/GitLab/GitHub/AWS/Slack/Google-Keys, JWT, Bearer- und Basic-Auth, `curl -u`, Passwörter in URLs, `mysql -p…`/`docker login -p`, Zuweisungen an Namen, die auf `password`/`secret`/`token`/`api_key`/… **enden** (gequotet immer; ungequotet in Konfig-Zeilen und bei SCREAMING_CASE immer, im Code nur Buchstaben+Ziffern-Werte — damit bleiben `getPassword(user)`, `tokenizer = …`, `csrfToken: "{{…}}"` lesbar), E-Mail (außer `git@`), IBAN mit Prüfsumme. Alle Regeln laufen linear (verankert/begrenzt; Testschranke 100 000 Zeichen < 1 s); Eingaben werden vor der Schwärzung begrenzt. Läuft in `buildManifest` (jeder Provider-Aufruf) und im Claude-Code-Hook vor dem Schreiben. **Grenze:** Musterbasiert — unbekannte Formate (z. B. proprietäre Tokens ohne Präfix, Secrets in Base64) werden nicht erkannt. Deshalb zusätzlich: Manifest mit exaktem Payload vor jedem externen Versand.

## Threat Model (Kurzfassung)

| Bedrohung | Maßnahme | Rest-Risiko |
|---|---|---|
| Prompt Injection über Kontext | Kontext in `<kontext>`-Hüllen, Label escaped, Systemprompt erklärt „untrusted data“; Mentor hat keine Werkzeuge → Injection kann nichts ausführen | Modell kann trotzdem irreführend antworten |
| Datenleck an externen Anbieter | Manifest-Bestätigung, Schwärzung, Größenbudget 60 000 Zeichen, Kontext nicht persistiert | Nutzer:in bestätigt Inhalt mit nicht erkanntem Secret |
| Kompromittierter Renderer | Sandbox, CSP, kein Node, schmale IPC; externer Versand nur mit Main-seitigem Einmal-Manifest | Ein kompromittierter Renderer könnte `preview` und dann `run` ohne Nutzeraktion aufrufen; das Manifest zeigt aber nur, was ohnehin im Renderer lag. Abhilfe später: nativer Bestätigungsdialog im Main |
| Überprivilegierte Prozesse | Keine Ausführung, keine Schreibzugriffe außer eigener State-/Exportdatei (Ziel per Dialog) | — |
| Manipulierte Hook-Inhalte | Inbox ist Daten; Übernahme nur manuell; Parser verwirft defekte Zeilen; Verzeichnis 0700, Datei 0600 | Lokaler Angreifer mit Schreibrecht auf `~/.ki-it-mentor` |
| Hook stört Claude Code | Exit 0, keine Ausgabe, 3-s-Deadline, TTY-Abbruch | — |
| Unerwartete Kosten | Token-Schätzung im Manifest, Kostenhinweis, kein Auto-Retry über 1 SDK-Retry hinaus | Schätzung ±30 % |
| Update-Risiken | Abhängigkeiten gepinnt über `package-lock.json` | Kein Auto-Update implementiert |

## Offene Punkte

Siehe `PROJECT.md` → „Offen“. Insbesondere: nativer Bestätigungsdialog im Main, `senderFrame`-Prüfung in IPC, Electron-Fuses/ASAR-Integrity und signierte Builds (mit Packaging), Secret-Scanner mit Entropie-Heuristik.

## Melden

Sicherheitsprobleme bitte nicht öffentlich als Issue, sondern direkt an die Repository-Verantwortlichen.
