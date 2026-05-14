---
tes_doc: execution-line
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: README.md
  - path: src/cli.ts
  - path: src/gate.ts
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/PROJECT-STATE.md
  - path: docs/agents/contracts/execution.md
tags:
  - tes
  - execution-line
related:
  - "[[PROJECT-ROADMAP]]"
  - "[[QUALITY-GATES]]"
  - "[[BOUNDARIES-AND-CONSTRAINTS]]"
  - "[[PROJECT-STATE]]"
---

# Execution Line

Current lane: deepen Wave 6 fleet governance scope and decide commit slicing
for the local TES runtime refresh that already sits 2 commits ahead of
`origin/main`.

## Reentry

- Read [[PROJECT-CONTEXT]], [[PROJECT-STATE]], [[PROJECT-ROADMAP]].
- `git status --short --branch --untracked-files=all`.
- Confirm the next gate from [[QUALITY-GATES]] before editing.

## Smallest Falsifiable Local Loop

For any source change in `src/**` or `tests/**`:

1. `bun run typecheck`
2. `bun test <focused-suite>`
3. `bun src/cli.ts doctor --target .`
4. `bun src/cli.ts check --target . --all`

For replay or audit behavior changes:

1. `bun test tests/replay-fixtures.test.ts`
2. `bun src/cli.ts audit --all --format json`

For release or version changes:

1. `bun src/cli.ts version audit --target .`
2. `bun src/cli.ts release audit --target .`

## Build-Test-Fail-Fix

- State the hypothesis in one sentence.
- Run the smallest relevant gate.
- Classify failure: governance, evidence, adapter, fixture, or contract.
- Retest the exact failing proof before broader gates.
- Promote the durable lesson into `docs/build-test-fail-fix-local-ci-os.md`
  when the lesson is durable, not just local.

## Active Work Slice (2026-05-14)

- Branch `main` is 2 commits ahead of `origin/main`; worktree has unstaged
  TES runtime modifications and new TES skills (`tes-mine`, `tes-prospect`,
  `tes-setup`).
- Do not push, amend, or change remotes without explicit user approval.
- When slicing commits, separate TES runtime updates from product runtime
  changes so each can be audited against its own gates.

## Stop Condition

Stop when work touches secrets, external systems, destructive operations,
project-owned governance, remotes, tags, releases, dependencies, or
unreviewed generated artifacts. Reference
[[BOUNDARIES-AND-CONSTRAINTS]] before proceeding.
