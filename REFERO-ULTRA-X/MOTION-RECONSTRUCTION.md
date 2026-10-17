# MOTION RECONSTRUCTION — From Observed Behavior to Motion System

## Objective

Reconstruct the *behavioral logic* and perceived quality of motion, not just its visual endpoints. Motion is a first-class design layer, but it must support hierarchy, meaning, feedback, spatial understanding, or delight.

## Motion capture record

For each meaningful sequence, document:
- sequence ID and element(s);
- trigger: load, scroll position/progress, hover, focus, click, drag, route change, pointer movement, timer, or media state;
- initial, intermediate, and final visual states;
- direction, distance, scale, rotation, opacity, blur, clipping, color, layout change, camera movement, or other observed properties;
- duration/range and delay (measured if possible, otherwise estimate);
- easing character: linear, ease-out, spring/overshoot, stepped, scrubbed, or unknown;
- whether time-based, scroll-scrubbed, or hybrid;
- sequencing and staggering;
- continuity: what persists between states and what resets;
- user control and interruption behavior;
- loading prerequisites and fallback;
- reduced-motion alternative;
- confidence and evidence artifact.

Do not fabricate exact values when they have not been measured. Use approximate ranges and label them as estimates.

## Motion quality principles

1. **Purpose:** each prominent motion has a reason.
2. **Hierarchy:** movement directs attention rather than competing everywhere.
3. **Timing:** duration matches distance, mass, and importance.
4. **Continuity:** related elements share a coherent motion grammar.
5. **Input responsiveness:** interactions feel immediate; avoid unnecessary blocking sequences.
6. **Restraint:** create quiet intervals so important moments retain impact.
7. **Robustness:** animations tolerate resize, route changes, late assets, and interrupted interaction.
8. **Accessibility:** respect `prefers-reduced-motion`; provide non-motion cues where needed.
9. **Performance:** prefer transform/opacity when appropriate; profile expensive blur, filters, canvas, WebGL, and layout-triggering animations.
10. **Graceful degradation:** preserve hierarchy and content when advanced rendering is unavailable.

## Implementation selection

Choose the least complex technique that meets the intended experience:
- CSS transitions/keyframes for straightforward UI motion;
- SVG for vector-based shape and path animation;
- a motion library when sequencing, gestures, layout transitions, or scroll control justify it;
- canvas/WebGL/Three.js when real-time spatial rendering or many dynamic objects are core to the experience;
- video/pre-rendered sequences when art direction is complex but real-time interaction is not necessary;
- static or reduced-motion composition as a deliberate fallback.

Do not choose a framework by brand preference. Inspect the existing stack, bundle cost, team constraints, browser support, and maintainability first.

## Motion storyboard

Before implementation, write a short storyboard for each signature sequence:
1. What the user sees before the trigger.
2. What action or threshold starts the sequence.
3. How attention moves through the scene.
4. What the transition communicates.
5. What the user sees afterward.
6. What happens when the user reverses, skips, resizes, reloads, or uses reduced motion.

## Validation

Validate in a real browser where possible. Compare start/intermediate/end states at matching viewports. Check scroll scrubbing, jitter, clipping, overlap, focus behavior, scroll hijacking, accidental repeated triggers, layout shifts, CPU/GPU cost, and mobile behavior. A screenshot of one state is not proof that motion fidelity is correct.
