# MEMORY PROTOCOL

## Purpose

Define what becomes durable memory and how agents read, write, validate, compress, and evolve it.

## Memory classes

- PROJECT
- CLIENT
- REFERENCE
- PATTERN
- DECISION
- LESSON
- NEGATIVE_LEARNING
- OUTCOME
- RESEARCH
- TECHNICAL_KNOWLEDGE

## Write triggers

Write memory when:
- a reusable pattern is discovered;
- a reference is evaluated;
- a major decision is made;
- a hypothesis succeeds or fails;
- a client preference is confirmed;
- an implementation outcome provides evidence;
- research changes an existing belief.

Do not write trivial chat chatter.

## Memory record requirements

Each durable record should include:
- ID
- type
- title
- source
- project
- date
- context
- content
- evidence
- confidence
- tags
- reuse guidance
- avoid conditions

## Confidence

Use:
- LOW — hypothesis or weak evidence
- MEDIUM — observed once or supported indirectly
- HIGH — repeatedly validated
- VERIFIED — directly supported by authoritative evidence or multiple strong outcomes

## Memory firewall

Current user requirements override memory.

If memory conflicts with current context:
1. flag conflict;
2. prefer current explicit constraints;
3. preserve the old record;
4. record the new decision if durable.

## Retrieval

Retrieve the smallest relevant set.

Rank by:
- semantic relevance;
- project similarity;
- client similarity;
- product category;
- technical similarity;
- recency;
- evidence strength.

## Compression

When memory grows:
- summarize repeated knowledge;
- preserve provenance;
- retain source records;
- archive obsolete material;
- never collapse conflicting lessons into a false consensus.

## Model portability

The memory format must be readable as plain Markdown and optionally indexable through a database/vector index.
