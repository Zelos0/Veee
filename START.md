# START.md — KI-IT-Mentor + REFERO ULTRA X 2.3

> **Einziger Startauftrag für Claude Code.** Lege/entpacke dieses Paket im Projektarbeitsbereich, öffne den Projektordner in Claude Code und sage:
>
> **„Lies `START.md` vollständig und führe den gesamten Auftrag aus. Integriere REFERO ULTRA X 2.3 aus `REFERO-ULTRA-X/`, lies und befolge dessen `START-HERE.md` als verpflichtenden Bootstrap für die projektrelevante Arbeit. Führe das Agentic-System projektbezogen aus – nicht nur für UI/UX, sondern für Architektur, Implementierung, Motion/Animation, Qualität, Sicherheit, Lernen, Dokumentation und Integration. Bewahre bestehende Arbeit, prüfe jede Fähigkeit tatsächlich und dokumentiere alle Blocker.“**

## 0. Ziel und Quellenhierarchie

Baue einen modularen, sicheren KI-IT-Mentor mit frei beweglichem Desktop-Overlay, Lernmentor- und Copilot-Modus, drei Erklärungstiefen und Integrationen in Claude Code/Claude Desktop, soweit nachweislich unterstützt.

Das Paket enthält:
- `START.md` — ausführbarer Gesamtauftrag.
- `CLAUDE_IMPLEMENTATION_GUIDE.md` — Produkt-, Architektur-, Lern-, Agenten- und Qualitätsanforderungen.
- `CLAUDE_ACCESS_SETUP.md` — Zugangs-/Freigabeanleitung.
- `REFERO-ULTRA-X/` — vollständiger extrahierter Skill Refero Ultra X 2.3 einschließlich `START-HERE.md`, Agents, Research-, Motion-, QA- und Memory-Protokollen.
- `inputs/REFERO-ULTRA-X-v2.3-original.zip` — unveränderte Original-ZIP als Referenz.

Bei Konflikten gilt:
1. aktuelle explizite Nutzeranforderungen;
2. Sicherheit, Datenschutz und tatsächliche technische Grenzen;
3. vorhandene Projektarchitektur und Nutzeränderungen;
4. diese `START.md` und `CLAUDE_IMPLEMENTATION_GUIDE.md`;
5. `REFERO-ULTRA-X/CORE.md` und `START-HERE.md`;
6. weitere Refero-Module und allgemeine Best Practices.

Refero ist **kein reines UI-Design-Skill**. Verwende seine Recherche-, Intent-, Agenten-, Motion-, QA-, Dokumentations-, Memory- und Entscheidungsprozesse für alle Bereiche, in denen sie sinnvoll sind. Passe sie an das konkrete Produkt an; führe nicht blind jede Agentenrolle bei jedem kleinen Task aus.

## 1. Verbindlicher Bootstrap: Refero ausführen

Vor relevanten Änderungen:

1. Prüfe Repository-Root, Git-Status, vorhandene Änderungen, Stack, Start-/Build-/Testbefehle und bestehende Agentenregeln. Bewahre Nutzerarbeit.
2. Öffne `REFERO-ULTRA-X/START-HERE.md` und lies die dort angegebene verpflichtende Datei-Lesereihenfolge vollständig. Mindestens `AGENTS.md`, `CORE.md`, `PROJECT.md`, `MODES.md`, `WORKFLOW.md`, `REFERO-RESEARCH.md`, `MCP-RESEARCH-PROTOCOL.md`, `INDEX.md` und alle für die Aufgabe relevanten Spezialmodule lesen.
3. Folge dem Workflow aus `REFERO-ULTRA-X/WORKFLOW.md`: Intent kompilieren, bestehendes/neues Produkt klassifizieren, relevantes Memory abrufen, Recherche versuchen, kreative/technische Richtungen abwägen, System spezifizieren, implementieren, prüfen, dokumentieren und Postmortem erstellen.
4. Prüfe verfügbare Tool- und MCP-Integrationen zur Laufzeit anhand tatsächlich verfügbarer Beschreibungen/Schemas. Erfinde keine MCP-Namen. Wenn Refero MCP verfügbar ist und Recherche für die Aufgabe verlangt wird, führe echte, relevante Suchanfragen und Detailinspektionen durch. Wenn es nicht verfügbar ist, dokumentiere dies und nutze eine klar benannte Alternative. Behaupte nie, MCP-Recherche sei erfolgt, wenn sie nicht erfolgte.
5. Erstelle projektbezogene Artefakte im Zielprojekt, nicht in der Skill-Quelldatei, z. B. `REFERENCE-RESEARCH.md`, `PROJECT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `CHANGELOG.md`, QA-Berichte und Lern-/Integrationsdokumentation nach Bedarf.
6. Die Beispielreferenzen in Refero sind Benchmark-Fixtures, keine Standardvorlagen. Nicht automatisch Exat, Lando Norris oder Messenger wählen. Recherche muss zum aktuellen Projekt passen.

**Refero-Start-Hierarchie:** Lies `REFERO-ULTRA-X/START-HERE.md` und führe dessen Bootstrap-Protokoll aus. „Ausführen“ bedeutet, die beschriebenen Analyse-, Recherche-, Agenten-, Implementierungs- und QA-Schritte tatsächlich abzuarbeiten; nicht, Markdown-Dateien wie ausführbaren Programmcode zu behandeln.

## 2. Agentisches System: dynamisch und projektbezogen

Verwende Referos spezialisierte Agenten und Qualitätsmodule als Arbeitsrollen. Wenn Claude Code echte Subagenten/Tasks parallel bereitstellt, nutze sie für klar trennbare Arbeitsgruppen. Wenn nicht, simuliere keine parallelen Agenten: arbeite sequenziell mit klaren Rollen und dokumentierten Übergaben.

### Agentengruppen und Aufgaben

**Gruppe A — Intent, Projektverständnis und Kontext**
- `agents/INTENT-COMPILER.md`
- `agents/DESIGN-CONTEXT-COMPILER.md`
- `agents/MEMORY-RETRIEVER.md`
- `CONTEXT-RECOVERY.md`, `PERSISTENT-CONTEXT-SYSTEM.md`, `MEMORY-PROTOCOL.md`
- Ergebnis: Anforderungen, Constraints, offene Fragen, Annahmen, aktuelle Architektur, projektbezogener Arbeitsauftrag.

**Gruppe B — Recherche und Referenzintelligenz**
- `agents/MCP-RESEARCH-AGENT.md`
- `MCP-RESEARCH-PROTOCOL.md`, `REFERO-RESEARCH.md`, `REFERENCE-INTELLIGENCE.md`, `SOURCES.md`
- Ergebnis: echte Recherche, mindestens fünf geeignete Kandidaten wenn die Tools ausreichend Ergebnisse liefern, Bewertungsraster, Auswahl, verworfene Optionen und Unsicherheiten.
- Für nicht-visuelle Aufgaben nur so viel Recherche wie sachlich erforderlich; keine künstliche UI-Recherche erzwingen.

**Gruppe C — Produkt, UX und kreative Richtung**
- `agents/CREATIVE-DIRECTOR.md`, `agents/UX-DIRECTOR.md`, `agents/REFERENCE-CURATOR.md`, `agents/ORIGINALITY-REVIEWER.md`
- `CREATIVE-EXCELLENCE.md`, `CREATIVE-WEB.md`, `EXISTING-PRODUCT.md` oder `NEW-PRODUCT.md`, `DESIGN-SYSTEM.md`, `CONTENT-SYSTEM.md`, `ANTI-AI-SLOP.md`
- Ergebnis: projektspezifische UX, zwei substanziell unterschiedliche Richtungen bei hochwirksamer visueller Arbeit, Entscheidungsthese, UI- und Inhaltsregeln.

**Gruppe D — Architektur, Implementierung und technische Integration**
- `agents/TECHNICAL-DIRECTOR.md`
- `SYSTEM/ARCHITECTURE.md`, `adapters/MODEL-PORTABILITY.md`
- Ergebnis: technische Architektur, Modulgrenzen, Integrationsadapter, Datenflüsse, Fehlerzustände, ADRs, implementierbarer Plan.

**Gruppe E — Motion und Interaktionen**
- `MOTION-RECONSTRUCTION.md`, `MOTION-SYSTEM.md`, `RESPONSIVE.md`, `ACCESSIBILITY.md`, `PERFORMANCE.md`
- Ergebnis: Motion-Spezifikation für Animationen und Übergänge im gesamten Produkt, nicht nur für eine Landingpage.
- Für jede Animation definieren: Zweck, Trigger, Start-/Endzustand, Dauer, Easing, Unterbrechbarkeit, Reduced-Motion-Verhalten, Tastatur-/Touch-Verhalten, Performance-Budget und QA-Fall.
- Motion muss aus Produktkontext und Zustandsübergängen entstehen; keine generischen Effekte ohne Nutzen.

**Gruppe F — Qualität, Edge Cases und Validierung**
- `VISUAL-QA.md`, `BENCHMARK-SUITE.md`, `quality/DESIGN-LINTER.md`, `quality/STATE-MATRIX.md`, `quality/EDGE-CASE-ENGINE.md`, `quality/VISUAL-REGRESSION.md`, `quality/PERFORMANCE-ADAPTATION.md`, `agents/USER-SIMULATOR.md`
- Ergebnis: Testmatrix, Zustandsabdeckung, Accessibility-/Performance-Prüfung, visuelle Vergleiche wenn möglich, Fehlerliste mit Schweregrad und Fixes.

**Gruppe G — Dokumentation, Memory und Lernschleife**
- `SELF-DOCUMENTATION-AGENT.md`, `agents/POSTMORTEM-AGENT.md`, `agents/PATTERN-MINER.md`, `CHANGELOG-SYSTEM.md`, `SYSTEM/DOCUMENTATION-SCHEMA.md`, `SYSTEM/MEMORY-GOVERNANCE.md`
- Ergebnis: Projektzustand, Entscheidungen, Changelog, dauerhafte Erkenntnisse, Postmortem und nächste Schritte aktualisieren.

### Dynamische Auswahl und Reprompting

1. Wähle Gruppen anhand des konkreten Tasks, der betroffenen Dateien und des Risikos. Für die initiale Gesamtimplementierung sind A, D, F und G immer aktiv; B, C und E werden aktiviert, wenn Referenzrecherche, UI, Animationen oder Interaktionen betroffen sind.
2. Ermittle nach jeder Phase die betroffenen Gruppen neu. Bei Änderungen an einer API wird D + F + G neu ausgeführt; bei UI/Motion C + E + F + G; bei Datenhaltung/Sicherheit A + D + F + G; bei jeder architektonischen Richtungsänderung A + D + G.
3. **Reprompting pro Gruppe:** Nach jedem relevanten Implementierungsschritt erhält jede betroffene Gruppe einen frischen, auf den tatsächlichen Projektstand bezogenen Auftrag mit:
   - aktuellem Ziel und nicht verhandelbaren Anforderungen;
   - betroffenen Dateien/Modulen und aktuellem Diff;
   - bisher getroffenen Entscheidungen und Gründen;
   - konkreten Fragen/Prüfkriterien dieser Gruppe;
   - Ausgabeformat, Blockern und Unsicherheiten;
   - expliziter Aufforderung, veraltete Annahmen zu korrigieren.
4. Verwende keinen starren identischen Prompt für alle Gruppen. Jeder Reprompt muss aus aktuellem Projektzustand, geänderten Dateien, offenen Risiken und relevanten Akzeptanzkriterien neu zusammengestellt werden.
5. Verhindere Endlosschleifen: maximal zwei gezielte Überarbeitungsrunden pro Qualitätsproblem, danach Befund und Trade-off dokumentieren oder Rückfrage stellen. Sicherheits- und Datenverlustprobleme dürfen nicht stillschweigend übergangen werden.
6. Konflikte zwischen Gruppen werden in `DECISIONS.md` bzw. einer projektspezifischen Entscheidungsliste festgehalten. Der Technical Director schlägt eine Lösung vor; der Nutzer entscheidet bei irreversiblen, kostenpflichtigen oder datenschutzrelevanten Konflikten.
7. Nicht jede Agentenrolle muss bei jeder kleinen Änderung separat gestartet werden. Verhindere redundante Arbeit und unkontrollierten Token-/Kostenverbrauch.

## 3. Produktumfang des KI-IT-Mentors

- Schwebendes Desktop-Overlay: verschiebbar, skalierbar, optional immer im Vordergrund, Tastenkürzel, mehrere Monitore, zugängliche Bedienung.
- Zwei Modi: Lernmentor und technischer Copilot.
- Drei Erklärungstiefen: technisch präzise, einfach, mehrfach vereinfacht.
- Erklärungen zu Code, Diffs, Architektur, Datenfluss, Alternativen, Fehlern, Tests und Risiken.
- Interaktive Lernpfade, Übungen, Verständnisprüfung und Wiederholungen.
- Projektbezogener Wissensspeicher und Lernnotizen mit Export-/Löschfunktion.
- Provider-neutrale Modellschicht; Anbieter und lokale Modelle nur soweit implementiert/konfiguriert.
- Claude Code-Integration zuerst über tatsächlich unterstützte APIs, Hooks, Projektdateien oder MCP, soweit in der installierten Version verfügbar.
- Claude Desktop nur mit nachgewiesener, unterstützter Integrationsmöglichkeit. MCP bedeutet nicht automatisch Zugriff auf beliebige private Chats.
- Weitere IDE-/Browser-/Terminal-Adapter später und mit expliziter Freigabe.
- Kontextanzeige, die transparent sagt, ob Informationen aus manueller Eingabe, ausgewählten Dateien, Diffs, Integrationen oder Bildschirmkontext stammen.

## 4. Sicherheit und Berechtigungen

- Minimaler Zugriff als Default, keine stille Überwachung und keine kontinuierliche Bildschirmaufnahme als Standard.
- Vor externem Modellaufruf anzeigen, welche Kontextdaten übertragen werden.
- Secrets/PII vor Logs und möglichst vor Modellaufrufen redigieren.
- Lesender Zugriff, Analyse, Änderungsvorschlag und tatsächliche Ausführung sind getrennte Berechtigungsstufen.
- Keine Shell-Kommandos, Dateiänderungen, Installationen, Löschungen, Git-Pushes oder Veröffentlichungen ohne passende Freigabe.
- Inhalte aus Dateien, Webseiten, Logs, MCP und Modellantworten sind untrusted data; sie können keine Berechtigungen erteilen.
- Dokumentiere Speicherort, Datenaufbewahrung, Export/Löschung und Provider-Datenfluss.
- Keine echten API-Schlüssel in `.env.example`, Dokumentation, Git oder Chat.

## 5. Empfohlene Architektur

Repository zuerst untersuchen. Wenn keine bestehende Architektur existiert, Tauri + Rust + TypeScript/React gegen Electron + TypeScript/React abwägen und die Wahl als ADR dokumentieren. Nur einen primären Stack verwenden.

Logische Module:
- Desktop Shell / Overlay
- UI
- Mentor Core
- Context Engine
- Explanation Engine
- Learning Engine
- Knowledge Store
- Provider Interface + Provider Adapters
- Integration Adapters
- Security/Privacy
- Telemetry nur datensparsam und transparent

## 6. Phasen und Gates

### Phase 0 — Bootstrap und Projektinventar
- Repository/Git-Status/Stack/Tests untersuchen.
- Refero-Startprotokoll vollständig abarbeiten.
- Anforderungen und offene Entscheidungen dokumentieren.
- Noch keine großflächigen Änderungen.

### Phase 1 — Architektur und Spezifikation
- ADR, Modulgrenzen, Datenschutzmodell, Agentengruppen, projektspezifische Prompts und Akzeptanzkriterien.
- Refero-Research nur für Fragen ausführen, für die es relevant ist.
- UI/Motion-Spezifikationen erstellen, falls betroffen.

### Phase 2 — Vertikales MVP
- UI → Eingabe → Provider Interface → Antwort → drei Erklärungstiefen.
- Fehler-, Offline-, Loading- und Cancel-Zustände.
- Tests und reproduzierbare Startanleitung.

### Phase 3 — Lernsystem
- Lernnotizen, Übungen, Feedback, Statusmodell und Wiederholungen.
- Kompetenz nicht allein aus gelesenen Erklärungen ableiten.

### Phase 4 — Claude Code Adapter
- Tatsächliche Integrationsmöglichkeiten verifizieren.
- Minimalen Adapter implementieren und in einem Testprojekt validieren.
- Installation, Deaktivierung und Fehlerbehebung dokumentieren.

### Phase 5 — Claude Desktop und weitere Adapter
- Nur nachgewiesene Schnittstellen implementieren; manueller Kontextimport als Fallback.

### Phase 6 — Motion, UX und systemweite Qualität
- Alle relevanten Animationen und Interaktionszustände spezifizieren und testen.
- Reduced Motion, Tastaturbedienung, Accessibility, Performance und visuelle Regression prüfen.
- Qualität gilt nicht als erfüllt, nur weil der Build erfolgreich ist.

### Phase 7 — Dokumentation und Abschluss
- README, START, ARCHITECTURE, SECURITY, PRIVACY, TROUBLESHOOTING, CHANGELOG, DECISIONS und projektspezifische Referenz-/QA-Berichte aktualisieren.
- Postmortem und nächste Schritte dokumentieren.

## 7. Akzeptanzkriterien

1. `START.md` führt zu einem nachvollziehbaren, dokumentierten Ablauf.
2. `REFERO-ULTRA-X/START-HERE.md` wurde gelesen und sein Bootstrap tatsächlich abgearbeitet.
3. Refero-Agenten werden passend zu Projektgruppen dynamisch eingesetzt oder, wenn echte Subagenten nicht verfügbar sind, transparent sequenziell ausgeführt.
4. Projektbezogenes Reprompting berücksichtigt aktuelle Diffs, Entscheidungen, offene Fragen und gruppenspezifische Prüfkriterien.
5. Das MVP kann Code in allen drei Tiefen erklären.
6. Lernmodus und Copilot-Modus sind unterscheidbar.
7. Lernnotizen/Übungen funktionieren und lassen sich löschen.
8. Keine erfundenen MCP-Aufrufe, Integrationen, Screenshots oder Testergebnisse.
9. Animationen sind zweckgebunden, zugänglich, performant und auf Reduced Motion vorbereitet.
10. Sicherheits- und Datenschutzgrenzen sind implementiert oder klar als offene Arbeit ausgewiesen.
11. Build, Lint, Typecheck, Tests und visuelle Prüfungen werden nur dann als bestanden gemeldet, wenn sie tatsächlich gelaufen sind.
12. Unvollständige oder nicht verfügbare Integrationen werden klar gekennzeichnet.

## 8. Abschlussbericht nach jeder Phase

Berichte:
- geänderte Dateien und Funktionalität;
- Refero-Module und Agentengruppen, die tatsächlich genutzt wurden;
- tatsächlich verwendete MCP-Tools/Quellen und deren Ergebnisse oder explizit dokumentierte Nichtverfügbarkeit;
- Reprompting-Runden und behobene Befunde;
- ausgeführte Befehle und echte Testresultate;
- geprüfte Animationen/Zustände/Plattformen;
- verbleibende Risiken und Blocker;
- benötigte Nutzerfreigaben;
- nächster sinnvoller Schritt.

## 9. Jetzt ausführen

Beginne mit Phase 0. Lies `REFERO-ULTRA-X/START-HERE.md` und die dort vorgeschriebenen Dateien vollständig. Prüfe dann das tatsächliche Projekt. Erstelle einen kompakten Plan und setze reversible, lokale Schritte eigenständig um. Frage vor destruktiven, externen, kostenpflichtigen oder datenschutzrelevanten Aktionen nach. Arbeite bis zu einem real lauffähigen und getesteten MVP weiter, soweit Umgebung und Berechtigungen es zulassen.
