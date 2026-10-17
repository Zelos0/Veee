# PRIVACY — KI-IT-Mentor

## Was wird gespeichert — wo — wie lange

| Daten | Ort | Aufbewahrung | Löschen |
|---|---|---|---|
| Lernnotizen, Lernfortschritt, Einstellungen | `<userData>/mentor-state.json` (Linux: `~/.config/ki-it-mentor/`, macOS: `~/Library/Application Support/ki-it-mentor/`, Windows: `%APPDATA%\ki-it-mentor\`; überschreibbar mit `KI_MENTOR_DATA_DIR`) — Pfad steht in Setup → Daten | bis zur Löschung | Notizen einzeln/alle (Notizen-Tab), alles (Setup → „Alle lokalen Daten löschen“) |
| Fensterposition | `<userData>/window-state.json` | bis zur Löschung | mit „Alle lokalen Daten löschen“ |
| Claude-Code-Ereignisse (geschwärzt, gekürzt) | `~/.ki-it-mentor/inbox/claude-code.jsonl` (+ `.1` nach Rotation bei 512 KB; `KI_MENTOR_INBOX`) | bis zur Rotation/Löschung | Mentor → Claude Code → „Leeren“; Hook deinstallieren |
| Angehängter Kontext, Fragen, Antworten | nur im Arbeitsspeicher der Sitzung | bis App-Ende | App schließen |
| Exporte | Ort per Speichern-Dialog | Nutzer:in | Nutzer:in |

Keine Telemetrie, keine Analytics, keine Crash-Reports. Logs (stderr) enthalten nur Fehlerklasse und Anbieter-ID.

## Provider-Datenfluss

- **Lokaler Demo-Anbieter:** keine Übertragung.
- **Ollama:** HTTP an die konfigurierte lokale Adresse (Standard `127.0.0.1:11434`). Wenn du eine entfernte Adresse einträgst, verlassen Daten den Rechner — die UI kennzeichnet Ollama derzeit pauschal als LOKAL (offener Punkt).
- **Anthropic Claude:** HTTPS an die Anthropic API — nur nach Bestätigung des Versand-Manifests. Es wird exakt der angezeigte, geschwärzte Payload gesendet. Aufbewahrung beim Anbieter richtet sich nach dessen Bedingungen/Organisationseinstellungen.

## Bildschirmkontext

Nicht implementiert. Es gibt keine Bildschirmaufnahme und keine Hintergrundüberwachung.
