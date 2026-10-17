# CONTEXT RECOVERY PROTOCOL

## Trigger

Use when:
- starting a new session;
- chat context is incomplete;
- switching models;
- switching agents;
- returning to a project later;
- the user says "continue";
- the current state is unclear.

## Procedure

```text
READ AGENTS.md
↓
READ PROJECT.md
↓
READ ROOT INDEX.md
↓
IDENTIFY ACTIVE TASK
↓
READ RELEVANT SUBTREE INDEXES
↓
READ ACTIVE DECISIONS
↓
READ RELEVANT MEMORY
↓
INSPECT SOURCE FILES ONLY AS NEEDED
↓
VALIDATE DOCUMENTATION AGAINST REALITY
↓
CONTINUE
```

## Recovery output

Before making risky changes, summarize internally:
- current objective;
- known constraints;
- current implementation;
- relevant prior decisions;
- unresolved issues;
- next action.

## No-context hallucination rule

If documentation and source disagree, inspect source and flag the discrepancy.

Never invent missing history.
