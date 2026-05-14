---
tes_doc: quality-contract
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: docs/release-slo-and-noise.md
  - path: docs/product-roadmap.md
  - path: package.json
  - path: docs/agents/QUALITY-GATES.md
tags:
  - tes
  - contract
---

# Quality Contract

The current quality bar is evidence-led, not prose-led.

Minimum safe gates for material code changes:

- `bun run typecheck`
- `bun test`
- `bun src/cli.ts doctor --target .`
- `bun src/cli.ts check --target . --all`

Replay, release, and migration work may also require:

- `bun test tests/replay-fixtures.test.ts`
- `bun src/cli.ts version audit --target .`
- `bun src/cli.ts release audit --target .`
- JSON/SARIF audit identity checks when audit output changes.

If a gate is unsafe, unavailable, or requires missing local state, record the
blocker and do not claim full project quality coverage.
