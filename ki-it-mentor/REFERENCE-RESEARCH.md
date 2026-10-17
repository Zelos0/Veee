# REFERENCE-RESEARCH — KI-IT-Mentor

Stand: 2026-10-17 · Sitzung: Claude Code (Cloud-Container) · Refero-Gruppe B (MCP-RESEARCH-AGENT, Fallback-Modus)

## 1. Projektintent und Forschungsfragen

Desktop-Overlay (klein, verschiebbar, optional im Vordergrund) für Entwickler:innen und IT-Lernende. Zwei Modi (Lernmentor/Copilot), drei Erklärtiefen, transparente Kontextquellen, Vorschau vor externem Versand.

1. Wie zeigt ein Entwicklerwerkzeug angehängten Kontext und dessen Herkunft transparent?
2. Wie belegt eine Antwort, welche Quellen in sie eingeflossen sind?
3. Welches Lernstatus-/Wiederholungsmodell ist ehrlich und für Laien verständlich?
4. Wie wird Erklärtiefe am besten bedient (Slider vs. benannte Stufen)?
5. Welche Bewegungsregeln gelten für kompakte Panels und Reduced Motion?
6. Gegenrichtung: dichtes Monochrom-Werkzeug vs. verspielte Lern-App.

## 2. MCP-Verfügbarkeit — tatsächlich geprüft

| Prüfung | Ergebnis |
|---|---|
| Live-Tool-Registry dieser Sitzung (ToolSearch „refero design screens styles flows“) | **Kein Refero-MCP-Tool vorhanden.** |
| MCP-Connector-Verzeichnis (SearchMcpRegistry „refero“, „design references“, „ui screens“) | Refero nicht gelistet. **Mobbin** (search_flows/screens/sections) existiert, ist aber **nicht installiert/verbunden**. |
| Figma-MCP (Plugin) | Verbindung fehlgeschlagen (Proxy 403) — nicht nutzbar. |

**Refero MCP unavailable in this session.** Es wurde kein Refero-Aufruf ausgeführt; dieser Teil der Recherche ist als unvollständig markiert.

## 3. Fallback — tatsächlich ausgeführt

Ein Subagent führte 9 Websuchen aus (WebSearch). Alle 7 WebFetch-Seitenabrufe scheiterten mit `getaddrinfo ENOTFOUND` (cursor.com, exercism.org, aiuxplayground.com, docs.ankiweb.net, developer.apple.com, MDN-Spiegel, learn.microsoft.com). **Evidenz = Suchergebnis-Snippets (mittlere Konfidenz)**, keine Live-Inspektion, keine Screenshots der Referenzen.

Queries:
1. `Raycast AI floating chat window UI design`
2. `Cursor chat context chips @ mentions files attached context UI`
3. `Anki FSRS card states new learning review UI retrievability`
4. `"explain like I'm 5" toggle reading level slider AI UI pattern`
5. `Apple Human Interface Guidelines motion reduce motion guidance`
6. `Exercism track progress concepts mastery syllabus tree UI`
7. `Warp terminal blocks AI agent UI design monochrome dense`
8. `Brilliant.org interactive lesson design step-by-step visual learning UI`
9. `GitHub Copilot chat "references" used context list expandable responses UI`

## 4. Kandidaten und Bewertung

Gewichte: Relevanz ×3, Merkmalsstärke ×2, Evidenz ×2, Machbarkeit ×1, Originalität ×2, A11y/Perf ×2 (max. 60).

| # | Referenz | Quelle | Ebene | Score | Konf. |
|---|---|---|---|---|---|
| 1 | Cursor @-Kontext/Pills | https://cursor.com/docs/context/@-symbols | Interaktion, Inhalt | 48 | mittel |
| 2 | GitHub Copilot „Used n references“ | https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/chat/asking-github-copilot-questions-in-github · https://learn.microsoft.com/visualstudio/ide/copilot-chat-context | Inhalt, Interaktion | 48 | mittel |
| 3 | Anki FSRS (Zustände, Abrufwahrscheinlichkeit) | https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm.md | Lernmodell | 48 | mittel |
| 4 | Exercism Syllabus (Konzept-Freischaltung, linearer Pfad) | https://exercism.org/docs/building/tracks/syllabus | Lernmodell, Komposition | 46 | mittel |
| 5 | Presets statt Slider / WAI-ARIA Slider | https://www.w3.org/WAI/ARIA/apg/patterns/slider/ · https://preview.setproduct.com/blog/slider-ui-design | Interaktion | 43 | mittel |
| 6 | Apple HIG Motion / Reduce Motion | https://developer.apple.com/design/human-interface-guidelines/motion | Motion | 41 | mittel |
| 7 | Raycast AI Chat (Floating Window) | https://www.raycast.com/changelog/macos | Komposition | 39 | mittel/niedrig |
| 8 | Warp (Gegenreferenz) | https://getdesign.md/design-md/warp/preview (inoffiziell) | Typografie, Material | 37 | mittel/niedrig |
| 9 | Brilliant (Gegenpol) | https://apps.apple.com/app/brilliant-learn-by-doing/id913335252 | Inhalt, Lernen | 37 | mittel/niedrig |

## 5. Reference Lock (Status: Locked mit Vorbehalt — mittlere Evidenz)

| Rolle | Referenz | Übernommenes Prinzip | Ziel-Ebene | Explizit verworfen |
|---|---|---|---|---|
| Anker | Cursor-Kontext | Kontext als sichtbare, einzeln entfernbare Chips + Füllstandsanzeige | Kontextleiste | Picker, der Herkunft versteckt; jedes Chip trägt eine Quellen-Marke |
| Spezialist | Copilot-Referenzen | Aufklappbarer „Beleg“ unter jeder Antwort | Antwort | Beleg nur *nach* dem Senden — wir zeigen vorher das Manifest |
| Spezialist | FSRS/Anki | Wenige klare Zustände, fällige Wiederholung | Lernpfad | Zahlendichte, Einstellungs-UI |
| Spezialist | Presets/WAI | Drei benannte Stufen als Segmented Control | Erklärtiefe | Kontinuierlicher Slider |
| Constraint | Apple HIG | Bewegung optional; Zustand nie nur per Animation | Motion | — |
| Gegenreferenz | Warp ↔ Brilliant | Dichte Präzision für Copilot; Wärme nur als Akzent im Lernmodus | Gesamtton | Verspielte Karten-Optik, Glas-Oberflächen (Raycast-„Liquid Glass“) |

## 6. Kreative These und zwei Richtungen

**A „Messinstrument“ (gewählt).** „Diese Erfahrung soll sich wie ein kalibriertes Messgerät auf der Werkbank anfühlen, weil Entwickler:innen Werkzeugen vertrauen, die genau zeigen, was sie tun; ihr Signature Moment ist das **Versand-Manifest**; sie darf nie die Garantie verletzen, dass nichts ungesehen den Rechner verlässt.“ Einspaltig, Kontextleiste oben, Eingabe unten, opake Fläche, Haarlinien, Mono für Messwerte, 120–240 ms.

**B „Lernschreibtisch“ (verworfen).** Gestapelte Karteikarten, Tiefen als auffächerbare Karten, Papierton, humanistische Serifen für Analogien. Verworfen, weil Transparenz das Alleinstellungsmerkmal ist und ein kleines Fenster Dichte belohnt; übernommen nur: ein warmer Akzent für Lernfortschritt.

## 7. Evidenzlücken und Konfidenz

- Keine Live-Inspektion der Referenzen; Interaktions-/Motion-Details sind **nicht beobachtet**, nur aus Beschreibungen abgeleitet.
- Für höhere Konfidenz: Refero oder Mobbin MCP verbinden; Screenshots von Cursor/Copilot/Raycast aufnehmen; Apple HIG/Exercism erneut abrufen.

## 8. Konsequenzen und Akzeptanzkriterien

- Jede Kontextquelle als Chip mit Quellen-Marke (Manuell/Datei/Diff/Claude Code) — **umgesetzt, E2E-geprüft**.
- Externer Versand nur nach Manifest mit Größen, Schwärzungen, Ziel, Modell, Token-Schätzung; Esc sendet nichts — **umgesetzt, E2E-geprüft (Mock-Server zählt 0 Anfragen nach Esc)**.
- Antwort-Beleg mit Quellen/Modell/lokal-vs-extern — **umgesetzt, E2E-geprüft**.
- Drei benannte Tiefen, Tastatur per Pfeiltasten — **umgesetzt, E2E-geprüft (Klick), Pfeiltasten im Code**.
- Lernstatus nur durch Leistung — **umgesetzt, Unit- und E2E-geprüft**.
