# MOTION-SPEC — KI-IT-Mentor

Prinzip (Refero MOTION-SYSTEM): Bewegung nur für Zustand, Kausalität, Orientierung. Wenn Entfernen die Klarheit verbessert, wird entfernt. Technik: ausschließlich CSS (Transform/Opacity/grid-rows) — keine Motion-Bibliothek nötig. Tokens: `--dur-fast 120ms`, `--dur-med 180ms`, `--dur-slow 240ms`, `--ease-out cubic-bezier(.2,.8,.2,1)`, `--stagger 20ms`. Reduced Motion (System **oder** Einstellung): alle Tokens 0 ms, `animation-duration: 0 !important`.

| ID | Animation | Zweck | Trigger | Start → Ende | Dauer/Easing | Unterbrechung | Reduced Motion | Tastatur/Touch | Perf | QA |
|---|---|---|---|---|---|---|---|---|---|---|
| M1 | **Versand-Manifest** aufklappen (Signature) | Zeigt kausal: „aus deiner Eingabe wird dieser Versand“ | Fragen/Erklären bei externem Anbieter | Eingabe weicht, `grid-template-rows 0fr → 1fr`; Zeilen `opacity 0, y+4px → 1, 0` mit 20 ms Versatz | 180 ms ease-out, Stagger 20 ms/Zeile | Esc/„Nicht senden“ schließt sofort; Fokus springt auf „Senden“ ohne Warten auf Animation | Sofort sichtbar, kein Versatz | Enter/Esc; große Buttons | nur Opacity/Transform + eine Layout-Änderung | E2E Test 2, Screenshot 04 |
| M2 | Tiefen-Indikator gleitet | Orientierung: welche Tiefe aktiv | Klick/Pfeiltaste | translateX/width zum aktiven Segment | 180 ms ease-out | Neuer Klick übernimmt laufende Transition | Springt | Pfeiltasten, Home/End | Transform | E2E Test 1 |
| M3 | Antwort-Einblendung | Signalisiert neuen Inhalt beim Tiefenwechsel | Neue/gecachte Antwort | opacity 0 → 1 | 120 ms linear | — | Sofort | — | Opacity | Screenshot 02/03 |
| M4 | Kontext-Chip Eintritt | Bestätigt Hinzufügen an der Stelle, wo es landet | Hinzufügen | scale .96/opacity 0 → 1 | 120 ms ease-out | — | Sofort | Ansage per Live-Region | Transform | Screenshot 02, 10 |
| M5 | Scan-Leiste | Zeigt „läuft“ ohne falschen Fortschritt | Anfrage läuft | Balken 30 % wandert linear | 1,2 s linear, endlos | Abbrechen beendet | Statischer Balken 50 % Deckkraft + Sekundenzähler | Esc bricht ab | Transform, 2 px Höhe | E2E Test 1 (Status sichtbar) |
| M6 | Lernleiter füllt / „↑ Status“ | Belohnt echte Leistung, macht Aufstieg sichtbar | Bestandene Übung mit Stufenaufstieg | Segmentfarbe; Text-Fade | 240 ms | — | Sofort; Text bleibt stehen | Ansage per Live-Region | background-color | E2E Test 3, Screenshot 08 |
| M7 | Tabs, Fokus, Hover | — | — | **Keine Animation** (bewusste Ruhe) | 0 | — | — | — | — | — |
| M8 | Fenster ein/aus | — | Strg/Cmd+Umschalt+M | OS-nativ | — | — | — | global | — | manuell (siehe QA-REPORT: nicht automatisiert) |

Nicht verwendet (bewusst): Seitenübergänge, Parallax, Cursor-Effekte, Glas-Blur, Dauer-Ambient-Bewegung.
