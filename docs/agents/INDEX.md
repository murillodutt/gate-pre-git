---
tes_doc: index
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/README.md
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - index
---

# Agent Context Index

This directory is the durable source for agent context in `gate-pre-git`.
Runtime files such as `AGENTS.md`, `CLAUDE.md`, `CURSOR.md`, `.cursor/**`,
`.agents/**`, `.claude/**`, and `.tes/bin/**` route here.

## Start Here

- `PROJECT-CONTEXT.md`: evidence-led project map.
- `PROJECT-REGISTER.md`: deterministic inventory and gate records.
- `PROJECT-STATE.md`: current operating state.
- `PROJECT-ROADMAP.md`: System X-Ray and convergence line.
- `EXECUTION-LINE.md`: working protocol and stop conditions.
- `QUALITY-GATES.md`: local certification commands.
- `BOUNDARIES-AND-CONSTRAINTS.md`: no-go zones and approval locks.
- `cortex/**`: durable continuity and memory layer.

## Contracts

- `contracts/core.md`
- `contracts/execution.md`
- `contracts/domain-boundaries.md`
- `contracts/quality.md`

## Runtime Adapters

- `adapters/codex.md`
- `adapters/claude.md`
- `adapters/cursor.md`

## Maps

- `maps/assets.md`
