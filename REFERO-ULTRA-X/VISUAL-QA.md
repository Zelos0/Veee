# VISUAL QA

## Compare against

1. User intent
2. Reference Lock
3. Design System
4. Motion System
5. Responsive rules
6. Accessibility
7. Performance

## Audit

- hierarchy;
- typography;
- spacing;
- alignment;
- color;
- composition;
- components;
- content;
- motion;
- states;
- responsive behavior.

## Severity

- P0 — blocks use
- P1 — major quality defect
- P2 — noticeable issue
- P3 — polish

## Brutal creative review

Ask:
- What feels generic?
- What feels copied?
- What feels unnecessary?
- What is the strongest moment?
- What is the weakest moment?
- Does the product have a recognizable visual grammar?

## Loop

Render → inspect → list issues → fix highest impact → render again.

## Screenshot fidelity gate

For reference-driven work, follow `IMAGE-TO-CODE.md`. Render the implementation at the reference viewport and compare by region. Record remaining deviations and their severity. Code compilation is not visual acceptance. Do not claim screenshot inspection, browser tests, or pixel-level fidelity unless they were actually performed.
