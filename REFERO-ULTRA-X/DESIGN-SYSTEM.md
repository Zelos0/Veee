# DESIGN SYSTEM

## Goal

Translate creative direction into repeatable implementation rules.

## Sections

1. Color
2. Typography
3. Spacing
4. Grid
5. Containers
6. Radius
7. Borders
8. Elevation
9. Icons
10. Components
11. States
12. Content hierarchy
13. Responsive behavior
14. Motion hooks
15. Accessibility

## Component contract

Every major component defines:
- purpose;
- anatomy;
- variants;
- states;
- responsive behavior;
- accessibility;
- content constraints;
- anti-usage.

## Density

Explicitly define:
- compact;
- default;
- spacious contexts.

## Design lint

Flag:
- inconsistent spacing;
- arbitrary colors;
- typography drift;
- excessive variants;
- duplicate components;
- unexplained exceptions.

## Screenshot fidelity contract

For reference-led screens, link each major component to a region in `VISUAL-SPEC.md`. Validate major geometry, typography, assets, surfaces, and responsive behavior using rendered screenshots. Do not tune small decorative details before the page silhouette and major proportions are correct.
