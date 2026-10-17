# MOTION SYSTEM

## Principle

Motion communicates hierarchy, state, causality, orientation, and brand character.

## Motion hierarchy

### Level 1 — Micro
Hover, focus, toggles, feedback.

### Level 2 — Component
Expansion, transitions, reveal.

### Level 3 — Section
Scroll storytelling, pinned sections, staged composition.

### Level 4 — Signature
Distinctive brand interaction.

## Motion token contract

For each motion:
- purpose;
- trigger;
- target;
- duration;
- easing;
- delay;
- intensity;
- responsive behavior;
- reduced-motion behavior;
- performance risk.

## Implementation

GSAP:
- scope timelines;
- clean up contexts;
- avoid unnecessary global listeners.

R3F/WebGL:
- minimize per-frame work;
- dispose resources;
- reduce resolution on constrained devices;
- provide fallback.

## Rule

If removing an animation improves clarity without losing meaning, remove it.
