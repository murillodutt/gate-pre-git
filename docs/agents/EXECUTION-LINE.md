---
tes_doc: execution-line
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/evidence/20260511T220733Z-tes-project-manifest.json
tags:
  - tes
  - execution-line
related:
  - "[[PROJECT-ROADMAP]]"
  - "[[QUALITY-GATES]]"
  - "[[BOUNDARIES-AND-CONSTRAINTS]]"
---

# Execution Line

Current lane: use `docs/agents/PROJECT-CONTEXT.md` as the entry map, then open
`README.md` before planning material work.

## Reentry

- Read [[PROJECT-CONTEXT]], [[PROJECT-STATE]], and [[PROJECT-ROADMAP]].
- Check `git status --short --branch`.
- Confirm the next gate from [[QUALITY-GATES]] before editing.

## Build-Test-Fail-Fix

- State the hypothesis.
- Run the smallest relevant gate.
- Classify failure before fixing.
- Retest the exact failing proof before broader gates.

## Stop Condition

Stop when the work touches secrets, external systems, destructive operations,
project-owned governance, remotes, tags, releases, or unreviewed generated
artifacts.
