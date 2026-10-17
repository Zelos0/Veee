# MODEL PORTABILITY

## Goal

Keep knowledge independent of the AI provider.

## Supported working styles

The same project/Second Brain should be usable from:
- Claude Desktop;
- Claude Code;
- Codex;
- other coding agents;
- future models.

## Adapter responsibilities

A model-specific adapter may define:
- startup instructions;
- file discovery;
- tool conventions;
- command execution;
- rendering workflow.

It must not redefine the underlying memory schema.

## Rule

Model changes must not require knowledge migration.
