
# WORKFLOW — End-to-End Execution (v2.3)

## Phase 0 — Mandatory bootstrap
Read:
- `START-HERE.md`
- `AGENTS.md`
- `CORE.md`
- `PROJECT.md`
- `MODES.md`
- `INDEX.md`
- `REFERO-RESEARCH.md`
- `MCP-RESEARCH-PROTOCOL.md`

For ambitious visual work, also read the relevant creative, reference, motion, implementation, and QA modules before acting. Do not treat a filename as an executed instruction: open and read the file contents.

## Phase 1 — Understand the actual task
Run:
- `agents/INTENT-COMPILER.md`
- `EXISTING-PRODUCT.md` or `NEW-PRODUCT.md` as appropriate

Inspect the repository and identify the framework, existing design system, primary user journeys, constraints, and current visual state. Do not modify files until the scope and architecture are understood.

## Phase 2 — Retrieve relevant memory
Run `agents/MEMORY-RETRIEVER.md`. Retrieve only context relevant to this project. Prior references may inform research but must not predetermine it.

## Phase 3 — Mandatory live reference discovery
Run `agents/MCP-RESEARCH-AGENT.md` using `MCP-RESEARCH-PROTOCOL.md`.
- Discover the currently available Refero MCP tools and schemas.
- Search project-specific styles, screens, and flows through available tool families.
- Use multiple queries and inspect candidate details.
- Aim for at least five candidates when results permit.
- Create a project-local `REFERENCE-RESEARCH.md`.
- If MCP is unavailable, document that fact and use only available alternatives.

**Hard gate:** Do not choose the final design direction for ambitious visual work before this research attempt is complete or its unavailability is documented.

## Phase 4 — Creative exploration
Run:
- `CREATIVE-EXCELLENCE.md`
- `CREATIVE-WEB.md` for cinematic/experimental work
- `REFERENCE-INTELLIGENCE.md`
- `agents/CREATIVE-DIRECTOR.md`
- `agents/UX-DIRECTOR.md`
- `agents/TECHNICAL-DIRECTOR.md`
- `agents/REFERENCE-CURATOR.md`

Produce two materially different creative directions, a creative thesis, signature moment, Reference Lock, explicit reject list, and feasibility notes. Select based on product fit and evidence.

## Phase 5 — Systemize
For reference-led or screenshot-led work, run `IMAGE-TO-CODE.md`. For motion-led work, run `MOTION-RECONSTRUCTION.md`. Create project-specific visual and motion specifications before substantial implementation.
Create/update applicable design tokens, typography, content, responsive, accessibility, motion, and performance specifications.

## Phase 6 — Build
Inspect the repository before editing. Implement in small, coherent increments, preserving existing behavior. Use real assets where available; avoid placeholder visuals and gratuitous effects.

## Phase 7 — Verify and iterate
Run `VISUAL-QA.md`, relevant checks in `BENCHMARK-SUITE.md` when validating REFERO itself, and applicable quality tools:
- design linter;
- state matrix;
- edge-case engine;
- visual regression;
- performance adaptation;
- user simulator;
- originality reviewer.

Launch the app and inspect rendered screenshots/interaction states when tools allow. Fix the highest-impact discrepancy, rerender, and repeat. Compilation alone is not visual QA.

## Phase 8 — Document and postmortem
Run `SELF-DOCUMENTATION-AGENT.md` and `agents/POSTMORTEM-AGENT.md`. Update only relevant project records, decisions, changelog, indexes, and durable lessons.

## Completion report
Report:
- what changed;
- reference research actually performed and MCP tools actually used;
- direction chosen and why;
- files changed;
- tests and visual states actually checked;
- remaining issues and confidence;
- anything blocked by unavailable tools or permissions.
