---
tes_doc: quality-gates
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: README.md
  - path: package.json
  - path: docs/README.md
  - path: docs/agents/contracts/quality.md
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/evidence/20260514T221551Z-tes-project-manifest.json
tags:
  - tes
  - quality-gates
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[EXECUTION-LINE]]"
  - "[[BOUNDARIES-AND-CONSTRAINTS]]"
---

# Quality Gates

Project gates are evidence producers, not generic command wrappers. Every
gate must produce inspectable output or fail explicitly.

## Project Runtime Gates

| Gate | Class | Command | Purpose |
|------|-------|---------|---------|
| Typecheck | required | `bun run typecheck` | TypeScript contract proof. |
| Unit/integration tests | required | `bun test` | Full Bun suite under `tests/**`. |
| Replay fixtures | focused | `bun test tests/replay-fixtures.test.ts` | Multi-ecosystem fixture replay. |
| Migration canary | focused | `bun test tests/migration-canary.test.ts` | Clean external repo install proof. |
| Local check (changed) | required | `bun src/cli.ts check` | Index-aware quality run. |
| Local check (all) | broader | `bun src/cli.ts check --all` | Full repository sweep. |
| Doctor self-check | required | `bun src/cli.ts doctor --target .` | Install + drift integrity proof. |
| Staged hook smoke | focused | `bun src/cli.ts staged` | Real Git index governance. |
| Push gate | focused | `bun src/cli.ts push --base origin/main` | Push range governance. |
| Audit (JSON) | focused | `bun src/cli.ts audit --all --format json` | Remote-anchor evidence proof. |
| Audit (SARIF) | focused | `bun src/cli.ts audit --all --format sarif` | SARIF-shape audit proof. |
| Version audit | focused | `bun src/cli.ts version audit --target .` | SemVer sync proof. |
| Release audit | focused | `bun src/cli.ts release audit --target .` | Release artifact identity proof. |

## TES Operating Mesh Gates

| Gate | Class | Command |
|------|-------|---------|
| Project context oracle | required | `python3 .tes/bin/project_context_oracle.py --target .` |
| Project alignment oracle | required | `python3 .tes/bin/project_alignment_oracle.py --target .` |
| Cortex verify | focused | `python3 .tes/bin/cortex.py verify --target .` |
| Cortex audit | focused | `python3 .tes/bin/cortex.py audit --target .` |
| Cortex rebuild | focused | `python3 .tes/bin/cortex.py rebuild --target .` |

## Gate Classes

- `required`: must pass before claiming the affected scope is healthy.
- `focused`: required for the matching scope (release, audit, fixtures).
- `broader`: runs the full sweep; use when scope is large or before tagging
  a wave.
- `needs_review`: result requires human judgment before becoming a PASS or
  FAIL claim (ambiguous output, partial evidence, contradictory signal).
- `unsafe`: requires explicit user approval (publish, push, dependency
  change, remote mutation, secret access).
- `unavailable`: missing local toolchain; record the blocker before claiming
  coverage.

## Initialization Gate Status

`PASS` at TES version `0.3.101`, commit `2ef45d6`. Evidence:
`docs/agents/evidence/20260514T221551Z-project-alignment.md`.

## No-Coverage Rule

`README.md` rule: no repo is covered until `doctor`, `check --all`, `staged`,
`push`, and `audit --format json` are green. Apply the same rule when
auditing wave completion.
