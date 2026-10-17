# DESIGN.md — Implementierungsvertrag

Quelle der Wahrheit für gerenderte Ausgabe. Tokens: `src/renderer/styles.css`. Recherche: `REFERENCE-RESEARCH.md`. Motion: `MOTION-SPEC.md`.

## Design DNA

- **Richtung:** A „Messinstrument“ — ein Werkzeug, das zeigt, was es misst und was es sendet.
- **Persönlichkeit:** ruhig, präzise, ehrlich; Wärme nur im Lernmodus als Akzent.
- **Dichte:** kompakt (Overlay 360–440 px breit).
- **Kontrast:** hohe Textkontraste, flache Flächen, 1px-Haarlinien statt Schatten.
- **Signature Moment:** Versand-Manifest (externer Versand). Sekundär: Tiefenwechsel derselben Antwort; Status-Aufstieg „↑ Selbst erklärt“.
- **Abgelehnt:** Glas/Blur, KI-Lila-Verläufe, Kartenraster, Partikel, Dauerbewegung, Slider für Tiefe.

## Tokens

| Rolle | Dunkel | Hell | Regel |
|---|---|---|---|
| bg / surface / surface-2 / surface-3 | #14151a / #1a1c22 / #21242b / #2a2e36 | #f4f2ed / #fbfaf7 / #efece6 / #e5e1d9 | opak, keine Transparenz |
| text / muted / faint | #ebe8e1 / #a3a29b / #908f89 | #1b1b1d / #55544f / #6b6a64 | alle ≥ 4,5:1 auf allen Flächen (gerechnet) |
| signal | #f0b44c | #8f5700 | **nur** externer Versand, Fälligkeit, Schwärzung |
| learn | #c9a6f2 | #6e3fb0 | **nur** Lernmodus-Markierung und Lernleiter |
| ok / danger / focus | #8cc79b / #ef7a63 / #7cc4ff | #29703f / #b3412b / #005fcc | Semantik |

Typografie: UI `system-ui` (13,5 px Basis, 1,5), Mono `ui-monospace` mit `tabular-nums` für alle Zahlen, Quellen-Marken, Modellnamen. Größen: 11 / 12 / 13,5 / 15 px. Abstände: 4/8/12/16/24. Radius 4/6 px.

## Komponenten

| Komponente | Anatomie | Zustände | Anti-Usage |
|---|---|---|---|
| Titelleiste | Status-Punkt + Name (unter 400 px nur Punkt) · Modus-Segment · Pin · Monitor · Ausblenden | Lernmodus: 2px-Linie `--learn` oben | Keine weiteren Aktionen hier |
| Kontext-Chip | Quellen-Marke (Mono, Versal) · Label (ellipsiert) · × | Eintritt 120 ms | Nie ohne Quellen-Marke |
| Segmented | Radiogroup, Pfeiltasten, gleitender Indikator | checked = Text + aria-checked | Nicht für > 4 Optionen |
| Antwort | Meta-Zeile Mono · Markdown · Beleg (details) · Folgeaktionen · Notiz | lädt / Fehler / leer / Cache | Kein HTML aus Modelltext |
| Versand-Manifest | Titel signal · Tabelle Quelle/Label/Zeichen · Frage · Ziel/Modell/Tokens · Schwärzungsnotiz · Payload-Ansicht · Senden/Nicht senden | Fokus auf „Senden“; Esc bricht ab; max. 70 vh | Nie für lokale Anbieter erzwingen; nie abschaltbar für externe |
| Lernleiter | 4 Segmente (eingeführt → selbstständig) | needs_review = signal | Kein Prozentwert als „Beherrschung“ |
| Übung | Prompt · Optionen/Textfeld · Hinweise · Prüfen | bestanden/nicht bestanden + Methode | Keine Bewertung ohne Methodenhinweis |

## Layout & Responsive

Einspaltig. Raster: Titelleiste 40 px · Tabs · Panel (Kontextleiste · Antwort scrollt · Eingabe). Breite 360–∞, Mindesthöhe 460. Unter 400 px: Markenname ausgeblendet. Kein horizontaler Scroll (E2E bei 360 px geprüft).

## Accessibility

Rollen: tablist/tab/tabpanel, radiogroup/radio, dialog (Manifest, nicht modal), alert (Fehler), status + Live-Region (Ansagen). Sichtbarer Fokus 2 px `--focus`. Alle Aktionen per Tastatur; Fenster per Strg+Alt+Pfeile verschiebbar. Reduced Motion: System oder Einstellung → alle Dauern 0, Scan-Leiste statisch.

## Review-Ziel

Gerendert geprüft: `qa/screenshots/01–12` (siehe `QA-REPORT.md`).
