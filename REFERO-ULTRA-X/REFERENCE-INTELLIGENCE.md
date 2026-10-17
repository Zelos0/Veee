# REFERENCE INTELLIGENCE — Evidence-Led Design Analysis

## Purpose

Turn visual references into a reusable, implementation-ready understanding of *why* they work. Do not stop at collecting URLs, screenshots, adjectives, or technology names. Analyze the experience, separate observed evidence from inference, and transfer design principles rather than copying a page wholesale.

## 1. Reference intake contract

For every candidate reference, record:
- URL, page/title, capture date, viewport, browser/device if known;
- intended role: visual system, product UI, typography, motion, 3D/immersive, interaction, conversion flow, responsive behavior, or technical pattern;
- evidence captured: initial viewport, full-page/section captures, interaction states, scroll sequence, mobile state, DOM/style/resource inspection, video, or notes;
- evidence gaps and confidence (high / medium / low);
- whether the live site was actually inspected. Never imply interaction testing from a thumbnail or search result alone.

## 2. Decompose the experience into layers

Analyze only layers that are relevant; do not force every site into every category.

1. **Composition:** grid, hierarchy, whitespace, alignment, density, rhythm, framing, asymmetry.
2. **Typography:** type roles, scale, width, weight, line breaks, tracking, contrast, variable axes, kinetic behavior.
3. **Color and light:** palette, contrast, gradients, bloom, shadows, highlights, atmosphere, light direction.
4. **Surface and material:** glass, blur, translucency, grain, reflections, texture, depth cues.
5. **Objects and imagery:** focal object, crop, silhouette, asset quality, art direction, image-to-layout relationship.
6. **Spatial model:** layers, perspective, camera, parallax, depth, 3D scene, world boundaries.
7. **Motion grammar:** triggers, duration, easing, sequencing, continuity, anticipation, follow-through, scroll linkage.
8. **Interaction grammar:** hover, focus, click, drag, reveal, navigation, progress, feedback, reversible actions.
9. **Content and meaning:** voice, density, storytelling, information scent, relationship between copy and visuals.
10. **Responsive art direction:** what is preserved, transformed, simplified, or removed at each breakpoint.
11. **System quality:** accessibility, loading, performance, reduced motion, fallback behavior, robustness.

For each important observation, separate:
- **Observed:** directly visible or measured evidence.
- **Inferred:** likely implementation or design intent.
- **Unknown:** cannot yet be determined.

Do not claim the source uses a specific library, shader, model, or technique unless inspected evidence supports it. If implementation is inferred, label it as a hypothesis.

## 3. The “why it works” analysis

For every selected reference, answer:
- What is the primary source of impact: motion, typography, composition, spatial depth, craft, narrative, interaction, or a combination?
- What does the experience make the user notice, feel, understand, or do?
- What is the signature moment, and what causes it?
- What remains intentionally quiet so the signature moment can stand out?
- Which three to five characteristics are essential to its identity?
- Which characteristics are incidental and should not be copied?
- What would break if the animation, 3D, or visual effect were removed?
- What is the minimum implementation that preserves the intended effect?

## 4. Reference role and borrowing budget

Assign each reference one or more explicit roles:
- **Anchor:** establishes the dominant visual/experience direction.
- **Specialist:** contributes a specific capability such as kinetic type, 3D art direction, or navigation behavior.
- **Utility:** informs a component, state, or flow.
- **Counter-reference:** demonstrates what to avoid.

Never average references into an indistinct midpoint. Create a reference-fusion map with: source → borrowed principle → target layer → adaptation → explicit rejection. Keep one coherent creative thesis. Avoid copying proprietary assets, logos, or distinctive branded compositions when a principle-level adaptation will achieve the goal.

Use `memory/BORROWING-BUDGET.md` to keep borrowing selective. A reference contributes a limited number of defining traits; the final work must have its own identity.

## 5. Visual and interaction evidence capture

For a page with meaningful interaction, inspect at minimum:
- initial state;
- one representative scroll state;
- one important interaction state;
- transition between states;
- mobile or narrow viewport when responsive behavior matters.

For motion-heavy pages, capture a sequence rather than relying on isolated screenshots. Record trigger, start state, intermediate states, end state, duration estimate, easing character, scroll relation, repeat/reverse behavior, and reduced-motion implications. If an element is not reproducible due to loading, consent, network, browser, or hardware, record the limitation instead of inventing behavior.

## 6. Confidence and provenance

Give each high-impact finding a confidence label:
- **High:** directly observed across sufficient states or measured.
- **Medium:** visible but not fully tested, or supported by partial evidence.
- **Low:** inferred from a still, description, or incomplete capture.

Keep source URLs and capture artifacts near the finding. Do not let confidence turn into false precision. Unknowns that materially affect implementation become explicit questions or test tasks.

## 7. Transfer into implementation

A reference analysis is not complete until it produces:
- a short design thesis;
- reference roles and borrowing map;
- visual specification (see `VISUAL-SPEC-TEMPLATE.md`);
- motion map (see `MOTION-RECONSTRUCTION.md`);
- essential fidelity traits and lower-priority details;
- technical options with trade-offs and fallback;
- acceptance criteria that can be checked in rendered output.

## 8. Anti-patterns

Reject:
- “looks premium” without concrete evidence;
- treating a hero thumbnail as a full-page reference;
- assuming a static screenshot communicates motion;
- naming a library based only on appearance;
- copying every effect from every reference;
- choosing WebGL/3D because it seems impressive rather than useful;
- treating a failed capture as proof that an effect does not exist;
- marking analysis complete without recording important unknowns.
