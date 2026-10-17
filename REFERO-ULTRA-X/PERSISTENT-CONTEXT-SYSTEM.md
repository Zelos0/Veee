# PERSISTENT CONTEXT SYSTEM

## Objective

Prevent loss of project context when chat history becomes unavailable, context windows are exhausted, sessions change, or the AI model changes.

## Fundamental rule

> The filesystem is the durable context layer. The conversation is a temporary working surface.

## Five layers

### 1. File Index

Every meaningful project folder has an `INDEX.md`.

It explains:
- folder purpose;
- file inventory;
- role of each file;
- dependencies;
- source-of-truth files;
- generated files;
- recently changed files;
- recommended reading order.

### 2. Project Memory

`PROJECT.md` is the compressed representation of the current project.

It contains:
- purpose;
- audience;
- product model;
- stack;
- architecture;
- design direction;
- current status;
- constraints;
- important files;
- active work;
- next actions.

### 3. Decision Memory

`DECISIONS.md` records why important choices were made.

Each decision should include:
- context;
- decision;
- alternatives;
- rationale;
- sources;
- date;
- consequences;
- reversibility.

### 4. Knowledge Memory

The Second Brain contains reusable cross-project knowledge.

### 5. Recovery Protocol

A new agent reconstructs context from:
1. `AGENTS.md`
2. `PROJECT.md`
3. relevant `INDEX.md`
4. active task state
5. relevant decisions
6. relevant memory
7. only then source code.

## Documentation hierarchy

```text
PROJECT ROOT
├── AGENTS.md
├── PROJECT.md
├── INDEX.md
├── DESIGN.md
├── DECISIONS.md
├── CHANGELOG.md
├── architecture/
│   └── INDEX.md
├── app/
│   └── INDEX.md
├── design/
│   └── INDEX.md
└── memory/
    └── INDEX.md
```

## Context compression

Indexes must be compact.

Do not duplicate the contents of every file. Store:
- what exists;
- where it exists;
- why it matters;
- what changed.

## Staleness

Documentation is not assumed correct.

The agent should detect:
- missing files referenced by indexes;
- files absent from indexes;
- stale architecture claims;
- obsolete decisions;
- broken dependency references.

## Cross-model portability

The system must work independently of:
- Claude;
- Codex;
- other coding agents;
- desktop apps;
- CLI agents.

Model-specific adapters may exist, but the knowledge format remains model-neutral.
