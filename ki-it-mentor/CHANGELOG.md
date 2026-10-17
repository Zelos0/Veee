# CHANGELOG

## 0.1.0 — 2026-10-17 (MVP)

### Hinzugefügt
- Electron-Overlay: rahmenlos, verschiebbar (Maus + `Strg+Alt+Pfeile`), skalierbar, „immer im Vordergrund“, nächster Monitor, Positions-Wiederherstellung nur auf vorhandenem Monitor, globales `Strg/Cmd+Umschalt+M`.
- Modi Lernmentor/Copilot; drei Erklärtiefen; Folgeaktionen (Beispiel, Risiken, Verständnistest, Zeile für Zeile, Warum, Alternativen); Antwort-Cache je Tiefe in der Sitzung.
- Kontextquellen Text, Datei (Dialog, ≤ 200 KB), Diff, Claude Code — als Chips mit Quellen-Marke; Antwort-Beleg.
- Versand-Manifest für externe Anbieter mit exaktem Payload, Schwärzungen, Token-Schätzung; Main-seitige Einmal-Bestätigung (5 min).
- Anbieter: lokaler Demo-Anbieter (regelbasiert, offline), Anthropic Claude (SDK, `claude-opus-5-5`, Fallbacks), Ollama (lokal/entfernt erkannt).
- Lernpfad: 19 Bereiche, 20 Themen, 12 Übungen; Statusmodell (6 Zustände), Wiederholungsintervalle, Hinweise, Rubrik-Bewertung mit Methodenangabe.
- Notizen mit Export (Markdown/JSON) und Löschen (einzeln/alle); „Alle lokalen Daten löschen“.
- Claude-Code-Hook-CLI (`install`/`uninstall`/`print-config`), geschwärzte Inbox, Übernahme als Kontext.
- Setup: Anbieter, Vordergrund, Farbschema, Reduced Motion, Claude Code, Datenort.

### Sicherheit
Sandbox, contextIsolation, CSP ohne Netz, Navigations-/Webview-/Permission-Sperren, Redaction (Keys, Tokens, Passwörter, E-Mail, IBAN mit Prüfsumme), synchroner Flush beim Schließen.

### Tests
61 Unit-Tests (Vitest), 7 E2E-Szenarien (Playwright gegen Electron, Mock der Messages API), 12 Screenshots, Kontrastrechnung aller Text-Tokens, reale Hook-Validierung mit Claude Code 2.1.302.
