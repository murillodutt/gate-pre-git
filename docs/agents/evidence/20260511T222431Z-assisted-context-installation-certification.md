# Assisted Context Installation Certification

Status: `GO meshed`

Timestamp: `2026-05-11T22:24:31Z`

Target: `/Users/murillo/Dev/gate-pre-git`

## Step Zero

- Git baseline status before install: clean.
- Rollback point before install: `57af462bf51a2f6dd6e2c589563436a60220e2b2`.
- Branch: `main...origin/main`.
- Baseline commit offer: not needed because the working tree was clean.

## Runtime Route

- Detected runtime: Codex desktop app in a local Git workspace.
- Selected TES route: `all`.
- Initial project class: `existing`.
- Final project class: `meshed`.
- Route reason: user requested AGENTS, CLAUDE, CURSOR, Cursor rules, runtime capabilities, Cortex, and MCP.

## Source Snapshot

- TES version: `0.3.82`.
- Public bundle URL: `https://murillodutt.github.io/tilly-engineer-skills/dist/0.3.82/tilly-engineer-skills-0.3.82.zip`.
- Public bundle SHA-256: `8598c167e9a70c744c7397c6880ce497da0b5416108dd797c191be0cbf9ec360`.
- Bundle staging path: `.tes/setup/0.3.82/`.
- Bundle staging result: `STAGED`, 99 entries.
- Source freshness: `PASS`, meaning `current public bundle`.
- Remote source head inspected: `e2fee9ce8e672b8fd85addb788f0262f80f6da67`.
- Public package source commit: `0a448e927aed56157621657bdb8a135a8a48a0aa`.

## Backup

- Central TES backup id: `20260511T220653Z`.
- Central TES backup manifest: `.tes/bk/20260511T220653Z/manifest.json`.
- Backup entry count: 0, because no prior root runtime files existed in this target.
- Root runtime files were not overwritten before the backup manifest existed.

## Applied Surfaces

- Root bootloaders: `AGENTS.md`, `CLAUDE.md`, `CURSOR.md`.
- Cursor rules: `.cursor/rules/tes-guidelines.mdc`, `.cursor/rules/tes-runtime-capabilities.mdc`.
- Runtime capabilities: `.agents/skills/**`, `.claude/skills/**`, `skills/**`,
  `plugins/tilly-engineer-skills/**`.
- TES helpers and manifest: `.tes/bin/**`, `.tes/manifest.json`.
- Project mesh: `docs/agents/**`.
- Cortex continuity layer: `docs/agents/cortex/**`.
- Project-scoped read-only MCP configs: `.codex/config.toml`, `.mcp.json`, `.cursor/mcp.json`.
- Field Reports local outbox: `.tes/field-reports/outbox.jsonl`.

## Semantic Recovery

- Root governance recovery evidence: `docs/agents/evidence/20260511T220653Z-root-governance-recovery.md`.
- Recovered semantic counts: keep 0, compress 0, replaced 0, rejected 0.
- Durable project semantics were built from project anchors, not copied generic instructions:
  `README.md`, `docs/README.md`, `docs/governance-runtime.md`, `docs/trust-model.md`,
  `docs/product-roadmap.md`, `src/cli.ts`, `src/gate.ts`, `src/governance.ts`, and tests.

## Local Adaptations

- `.gate-pre-git/governance.json` now includes a `tes_runtime_capabilities` zone so the project
  gate owns TES surfaces explicitly.
- `biome.json` excludes `.tes/bin/cortex_embed.mjs` from formatting so TES helper hashes stay
  equal to the verified bundle while project Biome checks still pass.
- `.markdownlint-cli2.jsonc` disables local MD029 and MD060 rules that conflict with installed
  TES/user-guide markdown shape.
- `.git/hooks/pre-push` was locally adjusted to preserve the project gate command and drain TES
  Field Reports afterward.
- `.git/info/exclude` was locally extended for TES setup, backup, cache, and Field Reports state.

## Certification Gates

- `tes_update.py plan --target . --runtime codex --json-only --record-field-report`: `PASS`.
- Helper contract: `PASS`.
- Runtime triggers: `PASS`.
- Project context oracle: `PASS`.
- Project alignment oracle: `PASS`.
- Command trigger oracle: `PASS`.
- Cortex verify, audit, rebuild, and lexical curate-plan: `PASS`.
- Cortex MCP self-test: `PASS`.
- Obsidian preflight dry-run: `READY`; no Obsidian launch performed.
- Field Reports status: `PASS`, pending local outbox entries present.
- `git diff --check`: `PASS`.
- `bun --no-install run typecheck`: `PASS`.
- `bun --no-install test`: `PASS`.
- `bun --no-install src/cli.ts doctor --target .`: `PASS`.
- `bun --no-install src/cli.ts check --target . --all`: `PASS`.

## Limits

- No commit, push, amend, tag, publish, remote change, dependency install, or package release was
  performed.
- No global MCP configuration was changed.
- Ignored local state under `.tes/setup/**`, `.tes/bk/**`, `.tes/field-reports/**`, and
  `.tes/cortex/*.sqlite*` is intentionally outside the Git-visible installation diff.
- Obsidian was detected, but opening was only dry-run because opening may create project-owned
  `.obsidian/**` state.

## Manual

- User manual web: `https://github.com/murillodutt/tilly-engineer-skills/blob/main/docs/install/USER-MANUAL.html`.
- Local package path when using the TES package checkout: `docs/install/USER-MANUAL.html`.

## Rollback Notes

- Clean Git rollback target for tracked changes: restore the working tree to
  `57af462bf51a2f6dd6e2c589563436a60220e2b2`.
- Local nontracked runtime state can be removed after review:
  `.tes/setup/0.3.82`, `.tes/bk/20260511T220653Z`, `.tes/field-reports`, `.tes/cortex`.
- Local hook backup: `.git/hooks/pre-push.before-tes-20260511T220733Z`.
