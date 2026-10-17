# SELF-DOCUMENTATION AGENT

## Mission

Automatically document the project structure and its evolution so another agent can recover context without relying on chat history.

## Responsibilities

After meaningful changes:

1. inspect changed files;
2. detect new/deleted/renamed files;
3. detect new/deleted/renamed folders;
4. detect architectural changes;
5. update affected indexes;
6. update project summary;
7. update decisions if required;
8. update changelog;
9. update dependency/architecture maps;
10. validate documentation consistency.

## Folder index contract

Every significant folder should have:

```text
INDEX.md
```

Minimum contents:

```markdown
# Folder Name

## Purpose
...

## Contents
| Path | Role | Source of truth? |
|---|---|---|

## Dependencies
...

## Important decisions
...

## Recent changes
...

## Read first
...
```

## File documentation

Do not generate redundant prose for every trivial file.

Document a file when it is:
- architecturally important;
- user-facing;
- configuration;
- a source of truth;
- difficult to understand;
- generated but operationally important.

## Change thresholds

### Minor
Update local index if structure changes.

### Significant
Update:
- local index;
- project summary;
- changelog.

### Architectural
Update:
- architecture map;
- decisions;
- project summary;
- relevant indexes;
- Second Brain if reusable.

## Self-check

Before finishing:
- Are all important folders indexed?
- Are important files discoverable?
- Do indexes point to existing paths?
- Does PROJECT.md reflect reality?
- Are stale references removed?
- Can a new agent reconstruct the current task?
