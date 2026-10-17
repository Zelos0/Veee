# LESSONS

### L-001 — E2E gegen die echte App findet, was Unit-Tests nicht sehen
- Kontext: Electron-MVP, 53 grüne Unit-Tests vor dem ersten E2E-Lauf.
- Beobachtung: Erster Playwright-Lauf fand 3 echte Defekte (Overflow bei 360 px, Tastenkürzel ohne Fokus, verzögerter Ratenlimit-Fehler durch SDK-Retry); Screenshots fanden 3 weitere (Manifest-Höhe, Kontrast, Dunkelmodus).
- Evidenz: Commits 9d45ce4, 55eb380; `qa/screenshots/`.
- Prinzip: Für Desktop-UIs früh einen E2E-Pfad mit Screenshots bauen; Kompilieren ≠ visuelle QA.
- Konfidenz: MEDIUM (ein Projekt). Gilt für: UI mit Fensterverhalten. Nicht für: reine Bibliotheken.

### L-002 — Lokale Mock-API macht externe Provider-Pfade beweisbar
- Beobachtung: Ein Node-HTTP-Mock unter `ANTHROPIC_BASE_URL` ließ den echten SDK-Adapter end-to-end laufen und bewies „Esc sendet nichts“, „Geheimnis nicht im Body“, „kein Versand ohne Manifest-ID“.
- Konfidenz: HIGH (direkt gemessen). Gilt für: jedes SDK mit konfigurierbarer Basis-URL.

### L-003 — Mutationsprobe für Regressionstests
- Beobachtung: Flush-Test wurde mit deaktiviertem Fix rot → Test beweist den Fix.
- Konfidenz: HIGH. Aufwand: 1 Minute. Für Persistenz-/Timing-Fixes immer machen.

### L-004 — Getrennte Review-Gruppen mit diff-basierten Aufträgen
- Beobachtung: Sicherheits- und UX-Gruppe fanden nahezu disjunkte Befunde (24 insgesamt, 5×P1) und korrigierten Annahmen im Auftrag selbst.
- Konfidenz: MEDIUM.

### L-005 — Electron/Linux: `nativeTheme.themeSource` erreicht `prefers-color-scheme` nicht zuverlässig
- Evidenz: matchMedia blieb nach `themeSource='dark'` unter Xvfb `false`.
- Prinzip: Theme als App-Einstellung (`data-theme`) statt nur Media Query.
- Konfidenz: MEDIUM (Electron 33, Xvfb).
