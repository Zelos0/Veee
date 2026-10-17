# NEGATIVE-LEARNINGS

- **Bestätigung nur im Renderer** (erste Version): wirkte sicher, schützte aber nicht gegen einen Renderer, der `run` direkt aufruft. Fix: Einmal-Manifest im Main. Sicher.
- **Breite Redaction-Regel `password=…`** zerstörte Code (`getPassword(user)`, `secretKey: string`) und verschlechterte damit Erklärungen. Fix: Werte-Heuristik (gequotet oder Buchstaben+Ziffern). Sicher.
- **Sieben gleichgewichtete Folgeaktionen** wirkten wie generische Chatbot-Chips und verdrängten die Hauptaktion. Fix: 1 primär + 3 + „Mehr …“. Tentativ (kein Nutzertest).
- **Hook wartete unbegrenzt auf stdin-Ende**. Fix: 3-s-Deadline, TTY-Abbruch. Sicher.
