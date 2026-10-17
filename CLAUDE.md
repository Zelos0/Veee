# CLAUDE.md

- Projektarbeit am KI-IT-Mentor findet in `ki-it-mentor/` statt. Kontext zuerst aus `ki-it-mentor/PROJECT.md`, `ki-it-mentor/AGENTS.md` und `ki-it-mentor/DECISIONS.md` rekonstruieren.
- Verbindlicher Bootstrap für neue Aufträge: `START.md` → `REFERO-ULTRA-X/START-HERE.md`. Projektartefakte gehören nach `ki-it-mentor/`, nicht in `REFERO-ULTRA-X/`.
- `appfactorytag4v2.bundle` ist ein fremdes Projekt — nicht verändern.
- Prüfen vor jedem Commit: `cd ki-it-mentor && npm run check`; bei UI-Änderungen zusätzlich `npm run build && xvfb-run -a npx playwright test` und Screenshots in `qa/screenshots/` ansehen.
