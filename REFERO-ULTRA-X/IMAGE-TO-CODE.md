# IMAGE-TO-CODE — Visual Reconstruction Protocol

## Mission

Translate visual references into a faithful, responsive, maintainable implementation. Image understanding is only the first step. Do not jump directly from a screenshot to JSX/CSS. Compile the image into an explicit implementation model, build against that model, render the result, and correct measured differences.

## Non-negotiable principle

A screenshot is evidence, not a complete specification. It reveals visible appearance at one viewport and state, but usually does not reveal DOM structure, responsive rules, hidden states, exact assets, font files, animation logic, or interaction behavior. Infer these carefully; mark uncertain inferences and inspect the live reference when possible.

## Phase A — Reference capture and inspection

For every important reference:
1. Record URL/source, viewport dimensions, device scale if known, page/route, scroll position, and interaction state.
2. Capture the whole relevant composition and separate crops for important regions.
3. When the live page is available, inspect multiple scroll positions, hover/focus states, transitions, responsive layouts, and reduced-motion behavior where practical.
4. Identify likely original assets, fonts, icons, videos, 3D canvases, and CSS effects. Prefer supplied/project assets and legally usable source assets over approximations.
5. Never claim pixel accuracy when only a compressed screenshot or one viewport is available.

## Phase B — Compile a Visual Specification before coding

Create `VISUAL-SPEC.md` for the target screen. Include:

### 1. Composition map
- Overall page regions and their order.
- Main container boundaries and approximate max-width.
- Columns, alignment axes, grid proportions, and major whitespace.
- Fixed, sticky, pinned, and scrolling elements.
- Layer order and overlap relationships.
- Approximate geometry may be measured from screenshot dimensions; label estimates as estimates.

### 2. Visual hierarchy
- First, second, and third focal points.
- Typography roles, relative scale, weight, line-height, tracking, line lengths, and wrapping.
- Contrast relationships, surface separation, color roles, and visual density.
- Repeated spacing/radius/border/shadow patterns.
- What makes the reference distinctive versus conventional.

### 3. Asset and material map
- Exact asset if available, or a clearly stated fallback.
- Image crop, focal point, aspect ratio, blend, mask, and overlay.
- Font files/weights and fallback strategy.
- Surface/material treatment: glass, blur, reflections, gradients, texture, light, depth.
- Do not approximate a distinctive hero image, logo, illustration, or 3D object with generic placeholders if the actual asset is available.

### 4. Interaction and motion map
For each notable behavior: trigger, start state, end state, affected elements, duration/easing if observable, scroll relationship, interruption behavior, mobile alternative, reduced-motion alternative, and performance risks.
Distinguish observed behavior from inferred behavior.

### 5. Responsive hypotheses
Describe how composition is expected to change at relevant viewport widths. Do not assume desktop columns simply stack without art direction. Verify against live responsive reference where available.

### 6. Confidence and unknowns
Classify important observations as:
- Observed
- Strong inference
- Weak inference / needs validation

## Phase C — Convert specification into implementation contracts

Before implementation:
1. Map visual regions to semantic components.
2. Define design tokens for colors, typography, spacing, sizing, radius, borders, shadows, blur, depth, and motion.
3. Define a small set of layout primitives and explicit responsive rules.
4. Choose implementation technology based on the actual effect: CSS transforms/transitions for simple motion; GSAP/ScrollTrigger for choreographed scroll sequences when justified; Canvas/WebGL/React Three Fiber only when the experience materially requires it.
5. Identify content and asset dependencies before building.
6. Create a component-to-reference map: each key component should identify which reference region and specification it implements.

Avoid premature abstraction. First achieve faithful visual structure; then extract reusable components without changing the visual result.

## Phase D — Implementation order

Use this order unless a project-specific reason justifies another:
1. Correct assets and fonts.
2. Page silhouette, container, grid, and major proportions.
3. Hero/primary composition and typography.
4. Surface, color, contrast, lighting, borders, and depth.
5. Component anatomy and content density.
6. Interaction states and motion.
7. Responsive art direction.
8. Accessibility, performance, edge states, and polish.

Do not compensate for incorrect layout with decoration or animation.

## Phase E — Screenshot-driven iteration

1. Run the actual app and render at the same viewport as the reference.
2. Compare reference and implementation side-by-side; use an overlay or difference image when available.
3. Review by region: global silhouette, alignment, dimensions, typography/wrapping, imagery/crop, color/surface, spacing, details, motion/state.
4. Create a ranked defect list with severity, evidence, likely cause, and specific fix.
5. Fix the highest-impact mismatch first; avoid changing many unrelated variables at once.
6. Re-render after meaningful changes and confirm the intended correction did not cause regressions.
7. Repeat until the visual acceptance criteria are met or remaining deviations and blockers are explicitly reported.

Use image-difference metrics only as aids. Pixel differences can be misleading for dynamic content, anti-aliasing, font rendering, video, and animation. Human visual inspection remains necessary.

## Visual defect priority

- P0: broken/absent content, unusable layout, severe overflow, blocked interaction.
- P1: major composition, scale, typography, asset, hierarchy, or motion mismatch.
- P2: visible spacing, color, surface, state, or responsive discrepancy.
- P3: micro-polish with low overall impact.

Fix in this order: P0 → P1 → P2 → P3. Prefer root-cause fixes over local CSS patches.

## Acceptance contract

A reference-driven implementation is not complete merely because it compiles. Before declaring done, report:
- reference viewport(s) and states tested;
- which visual regions were compared;
- important deviations remaining;
- responsive widths checked;
- interactions/motion checked;
- accessibility/performance checks run;
- what could not be verified and why.

Do not fabricate tests, screenshot inspection, pixel accuracy, or tool results. If browser rendering or image comparison tools are unavailable, state that limitation and perform the strongest available validation.
