# TROUBLESHOOTING

| Symptom | Ursache | Lösung |
|---|---|---|
| `npm start` öffnet kein Fenster (Linux, ohne Desktop) | Kein X-Server | `npm run build && xvfb-run -a npx electron . --no-sandbox` |
| Viele „Failed to connect to the bus“-Zeilen | Kein D-Bus im Container | harmlos |
| Anbieter „Anthropic Claude“ ausgegraut | `ANTHROPIC_API_KEY` fehlt beim Start | Variable setzen, App neu starten |
| „Anmeldung beim Anbieter fehlgeschlagen“ | Schlüssel ungültig/gesperrt | Schlüssel in der Anthropic Console prüfen |
| „Ratenlimit erreicht … in N s“ | 429 vom Anbieter | Countdown abwarten; der Button wird automatisch frei |
| „Versand nicht bestätigt oder Bestätigung abgelaufen“ | Manifest älter als 5 min oder schon benutzt | Erneut „Fragen“ und Manifest bestätigen |
| „Ollama nicht erreichbar“ | Server läuft nicht / falsche URL | `ollama serve`; `KI_MENTOR_OLLAMA_URL` prüfen |
| Ollama erscheint als „entfernt“ mit Manifest | URL ist nicht `127.0.0.1`/`localhost` | gewollt: Daten verlassen den Rechner |
| `Strg/Cmd+Umschalt+M` reagiert nicht | Kürzel von anderer App belegt (Warnung auf stderr) | Fenster über Taskleiste öffnen; Kürzel in der anderen App ändern |
| Claude-Code-Ereignisse erscheinen nicht | Hook nicht installiert, falsche Settings-Datei, Anzeige aus | `node dist/claude-code-hook.cjs print-config`; Setup → „Ereignisse … anzeigen“; Inbox-Pfad in Setup prüfen |
| Hook nach Verschieben des Repos wirkungslos | Absoluter Pfad im Hook-Befehl | `install` erneut ausführen (ersetzt den alten Eintrag) |
| Datei lässt sich nicht hinzufügen | Binärdatei oder keine reguläre Datei | Nur Textdateien; > 200 KB wird gekürzt |
| Daten nach Absturz weg / `mentor-state.json.corrupt-…` | Datei war nicht lesbar | Datei bleibt zur manuellen Rettung liegen; App startet leer |
| Dunkel-/Hellmodus folgt dem System nicht (Linux) | Electron reicht die Präferenz nicht immer weiter | Setup → Farbschema fest einstellen |
