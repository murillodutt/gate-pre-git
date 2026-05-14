---
tes_doc: assets-map
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/agents/PROJECT-REGISTER.md
  - path: docs/agents/evidence/20260511T220733Z-tes-project-manifest.json
tags:
  - tes
  - map
---

# Assets Map

## Product Runtime Assets

- `src/**`: TypeScript CLI/runtime source.
- `templates/pre-commit`: hook template.
- `.gate-pre-git/**`: vendored self-hosting runtime and governance state.

## Verification Assets

- `tests/**`: Bun test suite.
- `fixtures/workspaces/**`: replay workspaces and mutation specs.
- `.github/workflows/gate-pre-git-audit.yml`: remote audit workflow.

## Documentation Assets

- `README.md`: public product entry.
- `docs/**`: product strategy, trust model, roadmap, migration, release, and
  incident evidence.

## TES Assets

- `docs/agents/**`: durable agent governance.
- `.tes/bin/**`: TES helper runtime.
- `.agents/**`, `.claude/**`, `.cursor/**`, `skills/**`,
  `plugins/tilly-engineer-skills/**`: runtime adapter capabilities.
