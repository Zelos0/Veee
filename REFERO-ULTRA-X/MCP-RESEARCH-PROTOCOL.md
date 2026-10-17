
# MCP RESEARCH PROTOCOL — REQUIRED, NOT OPTIONAL

## Purpose

Ensure the configured Refero MCP is actually used to discover project-relevant visual systems, screens, and flows. A design skill that only repeats a fixed reference is not performing research.

## A. Discover the live MCP interface

1. Inspect the MCP server/tool list and the descriptions and input schemas exposed by the current environment.
2. Identify available tools for style search/detail, screen search/detail/similarity/image, and flow search/detail or their current equivalents.
3. Use the names and schemas exposed now. Never assume a historic tool name, invent a tool, or infer a successful call from the server being configured.
4. If a tool family is absent, record it and use the available families. If no Refero tools are callable, explicitly report “Refero MCP unavailable in this session”; do not silently skip or claim use.

## B. Translate project intent into research queries

First inspect the product, users, primary tasks, domain, constraints, and desired emotional response. Then build 4–8 complementary queries, not just one query based on a visual adjective:
- product/domain + key screen (e.g. analytics dashboard + portfolio overview);
- user task + flow (e.g. onboarding + permissions);
- visual system / composition;
- motion / interaction / navigation;
- a relevant specialist quality (kinetic type, 3D, editorial, data density, tactile feedback, etc.);
- an intentionally different counter-direction.

Avoid broad “cool website” searches unless the user specifically wants open-ended inspiration. Query wording must be adapted to the actual project.

## C. Search broadly, inspect deeply

1. Search the most relevant Refero collections exposed by MCP: styles for design systems, screens for concrete UI patterns, flows for multi-step journeys.
2. Aim to gather at least 5–10 candidates across more than one query where the MCP data supports it.
3. For promising results, invoke detail tools and similarity/image tools if available. Do not rank candidates from titles alone when deeper details are available.
4. Deduplicate repeated examples and group candidates by the layer they can inform.
5. For every candidate, record source ID/URL and the actual evidence available. Mark unseen pages or missing details as unknown.
6. If MCP results are sparse, supplement with any permitted browser/search tools available in the environment. Keep MCP results and external web results distinguishable.

## D. Candidate evaluation

Score candidates from 1–5 on:
- relevance to actual product and users (weight 3);
- strength of the particular visual/interaction trait (weight 2);
- quality and specificity of evidence (weight 2);
- implementation feasibility (weight 1);
- originality / non-generic value (weight 2);
- compatibility with accessibility, performance, and responsive constraints (weight 2).

Explain scores briefly. Do not confuse popularity, award status, or visual extravagance with fit. Select a small, complementary set:
- **Anchor:** one primary reference for overall direction;
- **Specialists:** up to three references for specific strengths;
- **Counter-reference:** one reference that prevents overfitting or clarifies what to avoid.
Use only as many references as are needed.

## E. Reference synthesis

For each selected reference, state:
- exact source and evidence inspected;
- relevant role;
- specific properties to borrow at the principle level;
- properties to reject;
- target UI layer/component;
- adaptation to the project's product, content, brand, and users;
- confidence and unresolved questions.

Do not copy a complete site's composition, branded assets, logo, or signature arrangement wholesale. References are evidence for design decisions, not instructions to reproduce someone else's website.

## F. MCP failure and truthful fallback

When MCP is unavailable:
1. Say so in the task report.
2. Check whether the environment has browser/search, local reference assets, or previously captured references.
3. Use only the tools that are actually available.
4. Do not fabricate results, source IDs, screenshots, tool outputs, or claims of live inspection.
5. Continue with a clearly labelled fallback research plan if the user has authorized autonomous progress.

## G. Required output

Create a project-local `REFERENCE-RESEARCH.md` with:
- timestamp/session context if available;
- project intent and research questions;
- MCP availability and actual tools called;
- search queries;
- candidate table with source ID/URL, type, evidence, scores, and role;
- chosen Reference Lock;
- creative thesis plus two distinct alternatives;
- borrowed/rejected traits;
- evidence gaps and confidence;
- implementation consequences and acceptance criteria.

## Hard gate

Do not lock the visual direction for ambitious UI work until the MCP search has been attempted and its result or failure has been recorded. The only exception is when the user explicitly says not to research or not to use MCP.
