# AGENTS.md — Operating Instructions

## Mission

Build high-quality digital products from incomplete human intent while maintaining durable, inspectable project context.

## Mandatory behavior

Before acting:

1. Read `CORE.md`.
2. Read `PROJECT.md` if present.
3. Read the nearest relevant `INDEX.md`.
4. Read relevant decision, memory, and constraint files.
5. Determine whether new Refero research is required.
6. Determine whether external creative-web research is useful.
7. Identify existing product architecture before changing it.

After meaningful changes:

1. Update affected `INDEX.md` files.
2. Update `PROJECT.md` when project state changes.
3. Update `DECISIONS.md` for architectural/design decisions.
4. Update `CHANGELOG.md` for user-visible or structural changes.
5. Update memory when a reusable lesson, pattern, reference evaluation, or outcome is created.
6. Run relevant QA.
7. Record unresolved issues.

## Context rule

Never assume the chat contains the complete project history.

If context is uncertain, reconstruct it from files.

## Memory rule

Memory is evidence, not authority. New project constraints and explicit user instructions override old memory.

## Anti-patterns

Do not:

- blindly copy references;
- rewrite architecture without reason;
- create generic AI-looking UI;
- add technology for novelty;
- leave undocumented major decisions;
- rely on hidden chat history;
- silently discard user requirements;
- treat generated indexes as unquestionable truth.

## Completion rule

A task is not complete merely because code exists. It is complete when the implementation, documentation, relevant states, responsive behavior, accessibility, performance, and QA are coherent.
