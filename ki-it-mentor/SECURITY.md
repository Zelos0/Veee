# SECURITY — KI-IT-Mentor

## Berechtigungsstufen

`read` → `analyze` → `suggest` → `execute` (`src/core/permissions.ts`). **MVP-Obergrenze: `suggest`.** Der Mentor führt keine Shell-Kommandos aus, ändert keine Dateien, installiert nichts, pusht nichts. Lesender Dateizugriff nur über den OS-Dateidialog (Einzeldatei, ≤ 200 KB, Text). Inhalte aus Dateien, Logs, Hooks, Modellantworten sind **untrusted data** und können keine Rechte erteilen; der Systemprompt sagt dem Modell das ausdrücklich.

## Electron-Härtung (implementiert)

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`; Preload exponiert nur `window.mentor` (typisiert).
- CSP: `default-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'` — der Renderer kann nicht ins Netz.
- `will-navigate` blockiert; `setWindowOpenHandler` → nur `https://` im System-Browser, sonst verweigert.
- Modellantworten werden als React-Elemente gerendert, nie als HTML (Unit-Test: kein `<img>`/`<script>`).
- API-Schlüssel nur im Main-Prozess aus Umgebungsvariablen; nie im Renderer, in Logs oder Dateien.

## Schwärzung

`src/core/redaction.ts`: Private Keys, Anthropic/OpenAI/GitHub/AWS/Slack/Google-Keys, JWT, Bearer-Tokens, Passwörter in URLs, `password=`/`api_key:`-Zuweisungen, E-Mail, IBAN. Läuft in `buildManifest` (jeder Provider-Aufruf) und im Claude-Code-Hook vor dem Schreiben. **Grenze:** Musterbasiert — unbekannte Formate (z. B. proprietäre Tokens ohne Präfix, Secrets in Base64) werden nicht erkannt. Deshalb zusätzlich: Manifest mit exaktem Payload vor jedem externen Versand.

## Threat Model (Kurzfassung)

| Bedrohung | Maßnahme | Rest-Risiko |
|---|---|---|
| Prompt Injection über Kontext | Kontext in `<kontext>`-Hüllen, Label escaped, Systemprompt erklärt „untrusted data“; Mentor hat keine Werkzeuge → Injection kann nichts ausführen | Modell kann trotzdem irreführend antworten |
| Datenleck an externen Anbieter | Manifest-Bestätigung, Schwärzung, Größenbudget 60 000 Zeichen, Kontext nicht persistiert | Nutzer:in bestätigt Inhalt mit nicht erkanntem Secret |
| Kompromittierter Renderer | Sandbox, CSP, kein Node, schmale IPC; Main baut Payload selbst | Renderer könnte via IPC ohne UI-Bestätigung `run` aufrufen (Bestätigung ist UI-seitig) — siehe offene Punkte |
| Überprivilegierte Prozesse | Keine Ausführung, keine Schreibzugriffe außer eigener State-/Exportdatei (Ziel per Dialog) | — |
| Manipulierte Hook-Inhalte | Inbox ist Daten; Übernahme nur manuell; Parser verwirft defekte Zeilen | Lokaler Angreifer mit Schreibrecht auf `~/.ki-it-mentor` |
| Unerwartete Kosten | Token-Schätzung im Manifest, Kostenhinweis, kein Auto-Retry über 1 SDK-Retry hinaus | Schätzung ±30 % |
| Update-Risiken | Abhängigkeiten gepinnt über `package-lock.json` | Kein Auto-Update implementiert |

## Offene Punkte

Siehe `PROJECT.md` → „Offen“. Insbesondere: Bestätigungs-Token zwischen preview und run im Main-Prozess (Härtung gegen kompromittierten Renderer), Secret-Scanner mit Entropie-Heuristik, signierte Builds.

## Melden

Sicherheitsprobleme bitte nicht öffentlich als Issue, sondern direkt an die Repository-Verantwortlichen.
