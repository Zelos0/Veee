# CLAUDE_ACCESS_SETUP.md — Projektzugriff und Refero-Ausführung

## 1. So startest du das Gesamtprojekt

1. Entpacke das integrierte Paket in einen Arbeitsordner oder kopiere die Dateien in dein bestehendes Repository.
2. Öffne **den tatsächlichen Projektordner** in Claude Code.
3. Vergewissere dich, dass `START.md` und der Ordner `REFERO-ULTRA-X/` im Arbeitsbereich sichtbar sind.
4. Sage Claude Code:

   > Lies `START.md` vollständig und führe den gesamten Auftrag aus. Integriere REFERO ULTRA X 2.3 aus `REFERO-ULTRA-X/`, lies und befolge dessen `START-HERE.md` als verpflichtenden Bootstrap. Führe die Agentengruppen dynamisch und projektbezogen für Architektur, Code, UI/UX, Motion/Animation, Qualität, Sicherheit, Lernen, Integration und Dokumentation aus. Reprompte jede betroffene Gruppe anhand aktueller Diffs, Entscheidungen und Akzeptanzkriterien. Bewahre vorhandene Änderungen, führe echte Tests aus und berichte ehrlich über Blocker.

5. Claude Code muss die Refero-Dateien lesen und die dort beschriebenen Schritte ausführen; das bloße Vorhandensein der ZIP-Datei reicht nicht.
6. Prüfe den Plan und erteile nur die jeweils nötigen Berechtigungen.

## 2. Was bedeutet „Zugang gewähren“?

### A. Zugriff auf Repository-Dateien
Öffne das richtige Projektverzeichnis in Claude Code. Datei- und Terminalrechte richten sich nach der laufenden Claude-Code-Konfiguration und den angezeigten Freigabeanfragen. `START.md` erteilt selbst keine Berechtigungen.

### B. Zugriff auf Claude Code-Ereignisse
Der Mentor muss einen tatsächlich unterstützten Integrationsweg der installierten Claude-Code-Version nutzen. Claude Code kann je nach Version und Konfiguration Hooks, MCP oder andere unterstützte Wege bereitstellen. Der Agent soll vorhandene offizielle Dokumentation und installierte Version prüfen, bevor er eine Integration behauptet.

### C. Zugriff auf Claude Desktop
Claude Desktop und Claude Code teilen nicht automatisch beliebige Sitzungen oder Chat-Inhalte. Prüfe die in deiner konkreten Desktop-Version angebotenen Integrationen. MCP kann Werkzeuge bereitstellen, bedeutet aber nicht automatisch, dass ein Drittprogramm private Claude-Desktop-Konversationen lesen darf.

### D. Refero MCP
Die ZIP enthält den Refero-Workflow und das Protokoll, aber nicht zwangsläufig gültige Zugangsdaten oder eine aktive MCP-Verbindung. Claude Code soll die tatsächlich verfügbaren Tools/Schemas prüfen. Wenn Refero MCP nicht verbunden ist, soll Claude das offen melden und keine ausgeführte Recherche vortäuschen. Konfiguriere nur einen Server, dessen Herkunft, Zweck und Berechtigungen du nachvollziehen kannst.

## 3. Wenn ein Claude-Link nichts bewirkt

Die konkrete URL muss separat geprüft werden. Prüfe:
1. Ist der Link vollständig und beginnt er mit `https://`?
2. Bist du im Browser im richtigen Claude-Konto angemeldet?
3. Werden Pop-ups oder Weiterleitungen blockiert?
4. Zeigt die Seite eine Fehlermeldung, Berechtigungsabfrage oder Aufforderung zum Öffnen einer App?
5. Ist die Integration für deinen Account und deine installierte App verfügbar?
6. Falls es ein OAuth-/Connector-Link ist: bestätige nur nachvollziehbare Berechtigungen.

Sende für die Diagnose die vollständige, **bereinigte** URL oder einen Screenshot sowie die angezeigte Fehlermeldung. Entferne Access Tokens, OAuth-Codes, Session-IDs, private Query-Parameter und andere Geheimnisse. Eine URL allein gibt nicht automatisch Zugriff auf Computer, Repository oder private Chats.

## 4. Sicherheitsregeln
- Keine API-Schlüssel oder Tokens in den Chat posten.
- Keine unbekannten MCP-Server oder Skripte blind installieren.
- Keine pauschalen Vollzugriffsrechte nur zur Bequemlichkeit erteilen.
- Vor externem Senden von Projektdateien prüfen, welche Inhalte übertragen werden.
- Änderungen, Shell-Befehle, Installationen, Löschungen, Pushes und Veröffentlichungen nach den lokalen Berechtigungsregeln bestätigen.
- Bei fehlender Schnittstelle einen transparenten manuellen Fallback nutzen.
