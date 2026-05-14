---
tes_doc: execution-contract
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: src/cli.ts
  - path: src/gate.ts
  - path: docs/agents/QUALITY-GATES.md
tags:
  - tes
  - contract
---

# Execution Contract

Agents should work from the smallest falsifiable gate outward.

Preferred local order:

1. `git status --short --branch --untracked-files=all`
2. Focused source or test read.
3. Smallest relevant command.
4. Broader gate only when the scope justifies it.

Common project gates:

- `bun run typecheck`
- `bun test`
- `bun test tests/replay-fixtures.test.ts`
- `bun src/cli.ts doctor --target .`
- `bun src/cli.ts check --target . --all`

Do not publish, push, tag, amend, change remotes, install dependencies, or touch
secrets unless the user explicitly approves that step.
