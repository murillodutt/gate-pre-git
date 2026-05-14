---
tes_doc: domain-boundaries
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: docs/governance-runtime.md
  - path: docs/version-governance.md
  - path: docs/trust-model.md
  - path: tests/replay-fixtures.test.ts
tags:
  - tes
  - contract
---

# Domain Boundaries

## Product Runtime

- `src/cli.ts` routes CLI commands.
- `src/gate.ts` composes checks, governance, evidence, impact, adapters, and
  configured commands.
- `src/governance.ts` maps files to zones, owners, risk, evidence, exceptions,
  sensitive paths, and generated paths.

## Project Evidence

- `docs/**` records current and target product meaning.
- `fixtures/workspaces/**` are replay and migration canaries. Use them for
  proofs, not as primary architecture.
- `tests/**` is the verification boundary.

## Vendored Target Runtime

- `.gate-pre-git/**` is the vendored install surface used by this repository
  for self-hosted proof.
- `.github/workflows/gate-pre-git-audit.yml` is the remote audit anchor.

## TES Runtime

- `docs/agents/**` is project governance.
- `.tes/bin/**`, `.agents/**`, `.claude/**`, `.cursor/**`, `skills/**`, and
  `plugins/tilly-engineer-skills/**` are runtime capabilities.
