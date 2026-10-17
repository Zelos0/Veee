# REFERO VISUAL FIDELITY BENCHMARK SUITE

## Purpose

A repeatable first benchmark for the skill. These three references deliberately test different strengths: kinetic typography and motion, premium interface craft, and an immersive interactive world. They are not a universal style target and must not be merged into one aesthetic.

**Important:** this file defines the test plan, not a claim that every reference has been exhaustively verified in the current run. Open each live site and record what is actually observed. Sites may change over time.

## Benchmark A — Exat Typeface

- Reference: https://exat.hottype.co
- Primary capability: kinetic typography, pacing, transitions, scroll/motion-led visual impact.
- Test question: can the skill identify that animation and timing—not merely a static layout—are the main source of impact?
- Capture: initial viewport; several motion states; scroll sequence; typography at different widths; mobile state where accessible.
- Expected analysis: type roles and geometry, sequence map, trigger model, rhythm, motion hierarchy, quiet vs. active moments, reduced-motion fallback.
- Failure signs: static typographic imitation, random animation, constant movement with no hierarchy, unsupported claims about implementation.

## Benchmark B — Lando Norris

- Reference: https://landonorris.com
- Primary capability: premium UI, cinematic object presentation, spatial composition, polished interface and motion working together.
- Test question: can the skill preserve the whole experience instead of focusing only on the 3D hero object?
- Capture: hero at first load; object/camera/scroll states; navigation and CTA states; one lower-page section; narrow viewport.
- Expected analysis: visual hierarchy, typography, spacing, object scale, light/contrast, surface treatment, motion behavior, interaction affordances, fallback behavior.
- Failure signs: a generic dark landing page with a 3D model; poor type/spacing; visual spectacle that harms navigation; no mobile strategy.

## Benchmark C — Messenger

- Reference: https://messenger.abeto.co
- Primary capability: exploratory interactive world, spatial navigation, playful interaction, 3D/real-time experience.
- Test question: can the skill recognize this as a distinct experience type and decide when such a pattern is appropriate rather than applying it to every product?
- Capture: entry/onboarding; movement or navigation interactions; one object/world interaction; feedback states; mobile or non-WebGL fallback if available.
- Expected analysis: world model, navigation grammar, interaction feedback, user orientation, progress/exit path, performance and fallback, accessibility implications.
- Failure signs: treating it as a normal page with decorative 3D; no clear orientation or escape path; proposing an immersive world for a task-focused product without justification.

## Test protocol

For each benchmark, use the same process and preserve the same prompt/task brief across runs:

1. Inspect the live reference; record URL, date, viewport, evidence, and unknowns.
2. Build a visual spec and motion map before substantial code.
3. State which traits are essential, which are secondary, and which should not be copied.
4. Implement the smallest coherent page/experience that tests the reference's defining capability.
5. Run it locally and capture matching viewport states.
6. Compare reference vs. implementation. List observed differences, not vague judgments.
7. Fix the highest-impact mismatch, render again, and keep before/after evidence.
8. Record what the skill got right, missed, hallucinated, or overcomplicated.

## Scorecard

Score each category from 0 to 5. Add a short evidence-based reason for each score.

| Category | 0 | 3 | 5 |
|---|---|---|---|
| Reference understanding | Misidentified the experience | Captured major traits, missed some behavior | Explains impact and limits with strong evidence |
| Visual fidelity | Generic or materially wrong | Recognizable but notable mismatches | Essential geometry, hierarchy, type, imagery and atmosphere align |
| Motion fidelity | Missing/random | Some triggers and timing reproduced | Sequence, trigger, rhythm and state transitions closely match |
| Interaction fidelity | Broken/unclear | Core path works | Core path and meaningful states are coherent and robust |
| Responsive art direction | Desktop shrunk | Usable but some awkward transformations | Intentional, tested composition per relevant viewport |
| Technical judgment | Over/under-engineered | Reasonable with trade-offs | Least-complex suitable approach, measured constraints, graceful fallback |
| Accessibility and performance | Major unaddressed issues | Basic support | Reduced motion, keyboard/focus, loading and performance considered and tested |
| Originality and coherence | Blind copy or generic | Coherent but derivative | Principle-level transfer with distinct creative thesis |
| QA and honesty | Claims unverified success | Some screenshots and caveats | Repeatable evidence, explicit unknowns, before/after iteration |

**Total:** 45 points. Do not use the total alone. A zero in interaction, accessibility, or reference honesty is a blocking issue even if the total is high. Record evidence links and screenshots beside the scores.

## Benchmark report template

- Benchmark and date:
- Environment / viewport:
- Reference evidence captured:
- Intended skill capability:
- Visual thesis:
- Essential fidelity traits:
- Motion storyboard:
- Implementation decisions and trade-offs:
- Scorecard with evidence:
- Largest three mismatches:
- Corrections made and re-render result:
- False assumptions / hallucinations:
- What to change in REFERO:
- What should become reusable memory:

## Benchmark governance

- Keep the three benchmark roles stable for comparisons, but refresh captures when sites materially change.
- Do not hard-code one reference's aesthetic as the default for unrelated projects.
- A benchmark pass does not prove general capability. It is a small, deliberately diverse test set.
- After meaningful skill changes, rerun at least the benchmark most affected by the change and record the version.
