---
tes_doc: project-context
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/README.md
  - path: package.json
  - path: docs/agents/evidence/20260511T220733Z-tes-project-manifest.json
tags:
  - tes
  - project-context
related:
  - "[[PROJECT-REGISTER]]"
  - "[[PROJECT-STATE]]"
  - "[[PROJECT-ROADMAP]]"
  - "[[EXECUTION-LINE]]"
---

# Tilly Project Context

Generated: `2026-05-11T22:07:33Z`

This is the initial project context compiled by `/tes-init`. It is a durable
starting map for agents, not a substitute for the source files. Agents should
read this before broad project work, then open the cited anchors and update the
context when new durable understanding is learned.

## Identity

| Field | Value |
|-------|-------|
| Name | `gate-pre-git` |
| Description | `Local repository governance runtime for GitHub-bound repositories.` |
| Identity source | `package.json + README` |
| Target | `/Users/murillo/Dev/gate-pre-git` |
| Git HEAD | `57af462bf51a2f6dd6e2c589563436a60220e2b2` |
| Manifest | `docs/agents/evidence/20260511T220733Z-tes-project-manifest.json` |

## Initial Semantic Signals

These signals are deterministic extracts from high-signal project files. They
are starting evidence for the active agent, not a final semantic analysis.

| Signal | Value | Source |
| --- | --- | --- |
| README heading | gate-pre-git | README.md |
| README summary | Local repository governance runtime for GitHub-bound repositories. | README.md |
| Detected stack | TypeScript codebase | package/config files |

## Active Semantic Context

This section was refined during the TES installation after opening the project
anchors `AGENTS.md`, `CLAUDE.md`, `CURSOR.md`, `README.md`,
`docs/README.md`, `docs/governance-runtime.md`, `docs/trust-model.md`,
`docs/product-roadmap.md`,
`docs/release-slo-and-noise.md`, `docs/version-governance.md`, `src/cli.ts`,
`src/gate.ts`, `src/governance.ts`, and
`tests/replay-fixtures.test.ts`.

`gate-pre-git` is a Bun/TypeScript local repository governance runtime. Its
product boundary is the local Git-to-GitHub transition: staged snapshots,
trusted fixes, push ranges, governance maps, evidence policy, adapter/tool
execution, JSON/SARIF audit manifests, and GitHub audit workflow validation.

The current public maturity is pre-RC. `README.md` and release docs state that
public package distribution remains closed while support policy, package
artifacts, and pinned external canaries are finalized.

Core runtime ownership is concentrated in `src/cli.ts` for command routing,
`src/gate.ts` for check composition, `src/governance.ts` for path/zone/risk
classification, `src/installer.ts` for vendored install behavior, and the
release/version modules for governed release artifacts.

The strongest project quality gates are `bun run typecheck`, `bun test`,
`bun test tests/replay-fixtures.test.ts`, `bun src/cli.ts doctor --target .`,
and `bun src/cli.ts check --target . --all`. Release or audit work may also
need version, release, JSON, SARIF, and migration canary gates listed in
`docs/release-slo-and-noise.md`.

Durable uncertainty remains around public distribution, branch-protection
configuration on the real GitHub repository, repeated RC measurements, and
pinned external canaries. Do not claim those as complete without current
evidence.

## Maximum-Depth Initialization Contract

- `/tes-init` must initialize the project, not only install TES runtime files.
- The project was inventoried through tracked and unignored files.
- Raw project files remain the source of truth; this context cites anchors
  instead of copying code or secrets.
- Unknowns stay explicit. Do not invent product, architecture, compliance, or
  deployment claims not supported by project files.

## Active Agent Refinement Contract

- Deterministic scaffold: `tes_init.py` creates the inventory, anchors,
  scripts, runtime surfaces, evidence manifest, and initial gaps.
- Semantic refinement: the active agent must open the strongest listed anchors
  before claiming deep project understanding for non-trivial projects.
- After reading anchors, refine this file with supported product domain,
  architecture, operational boundaries, validation gates, and durable unknowns.
- If anchor reading or local tools are blocked, report
  `Project context: NEEDS_REVIEW` with the blocker instead of claiming depth.

## Coverage

| Field | Value |
|-------|-------|
| File count | `128` |
| Total bytes | `789223` |
| Anchor count | `40` |
| Gate status | `PASS` |

## Project Territories

| Territory | Initial role | Files | Sample anchors |
| --- | --- | --- | --- |
| fixtures | experiments, reproductions, and fixtures | 31 | `fixtures/workspaces/docs-basic/baseline/README.md`, `fixtures/workspaces/docs-basic/baseline/docs/guide.md`, `fixtures/workspaces/docs-basic/fixture.json`, `fixtures/workspaces/github-actions-basic/baseline/.github/workflows/ci.yml`, `fixtures/workspaces/github-actions-basic/baseline/README.md`, `fixtures/workspaces/github-actions-basic/fixture.json` |
| src | product/source code territory | 23 | `src/adapter-runner.ts`, `src/adapters.ts`, `src/audit.ts`, `src/checks.ts`, `src/cli.ts`, `src/config.ts` |
| plugins | project territory to inspect | 22 | `plugins/tilly-engineer-skills/.codex-plugin/plugin.json`, `plugins/tilly-engineer-skills/skills/tes-adapter/SKILL.md`, `plugins/tilly-engineer-skills/skills/tes-align/SKILL.md`, `plugins/tilly-engineer-skills/skills/tes-align/agents/openai.yaml`, `plugins/tilly-engineer-skills/skills/tes-align/docs/CONTRACT-HISTORY.md`, `plugins/tilly-engineer-skills/skills/tes-align/references/alignment-procedure.md` |
| tests | test or verification territory | 15 | `tests/adapter-runner.test.ts`, `tests/adapters.test.ts`, `tests/audit-manifest.test.ts`, `tests/evidence.test.ts`, `tests/gate.test.ts`, `tests/governance-integration.test.ts` |
| docs | documentation and durable explanation | 13 | `docs/README.md`, `docs/build-test-fail-fix-local-ci-os.md`, `docs/governance-runtime.md`, `docs/incidents/2026-05-11-github-audit-self-contamination.md`, `docs/landscape-and-lessons.md`, `docs/migration-v0.1.0-rc.md` |
| .gate-pre-git | project territory to inspect | 6 | `.gate-pre-git/bin/gate-pre-git`, `.gate-pre-git/cache/.gitignore`, `.gate-pre-git/config.json`, `.gate-pre-git/governance.json`, `.gate-pre-git/lock.json`, `.gate-pre-git/runtime/cli.js` |
| .cursor | agent runtime surface | 2 | `.cursor/mcp.json`, `.cursor/rules/tes-runtime-capabilities.mdc` |
| .agents | agent runtime surface | 1 | `.agents/plugins/marketplace.json` |
| .codex | agent runtime surface | 1 | `.codex/config.toml` |
| .github | repository automation and collaboration | 1 | `.github/workflows/gate-pre-git-audit.yml` |
| templates | project territory to inspect | 1 | `templates/pre-commit` |

## Semantic Territory Guide

This section is deterministic interpretation from paths and known project
surfaces. It is meant to guide first reads, not replace source inspection.

| Territory | Likely boundary | Evidence | Next move |
| --- | --- | --- | --- |
| fixtures | fixture/example boundary; good for repros, weak evidence for product architecture | `fixtures/workspaces/docs-basic/baseline/README.md`, `fixtures/workspaces/docs-basic/baseline/docs/guide.md`, `fixtures/workspaces/docs-basic/fixture.json` | do not promote fixture shape as core runtime design |
| src | unclassified territory; evidence is inventory-level until anchors are read | `src/adapter-runner.ts`, `src/adapters.ts`, `src/audit.ts` | open the listed anchors before claiming ownership or runtime role |
| plugins | unclassified territory; evidence is inventory-level until anchors are read | `plugins/tilly-engineer-skills/.codex-plugin/plugin.json`, `plugins/tilly-engineer-skills/skills/tes-adapter/SKILL.md`, `plugins/tilly-engineer-skills/skills/tes-align/SKILL.md` | open the listed anchors before claiming ownership or runtime role |
| tests | verification boundary; use this to choose focused tests rather than infer runtime design | `tests/adapter-runner.test.ts`, `tests/adapters.test.ts`, `tests/audit-manifest.test.ts` | start with local test governance and smallest related test command |
| docs | documentation/API contract boundary; useful for public behavior but not sufficient runtime proof | `docs/README.md`, `docs/build-test-fail-fix-local-ci-os.md`, `docs/governance-runtime.md` | cross-check claims against source anchors before editing behavior |
| .gate-pre-git | unclassified territory; evidence is inventory-level until anchors are read | `.gate-pre-git/bin/gate-pre-git`, `.gate-pre-git/cache/.gitignore`, `.gate-pre-git/config.json` | open the listed anchors before claiming ownership or runtime role |
| .cursor | agent governance boundary; clean runtime replaces active bootloaders after central backup | `.cursor/mcp.json`, `.cursor/rules/tes-runtime-capabilities.mdc` | recover durable local semantics from `.tes/bk/**` into docs/agents evidence |
| .agents | agent governance boundary; clean runtime replaces active bootloaders after central backup | `.agents/plugins/marketplace.json` | recover durable local semantics from `.tes/bk/**` into docs/agents evidence |
| .codex | agent governance boundary; clean runtime replaces active bootloaders after central backup | `.codex/config.toml` | recover durable local semantics from `.tes/bk/**` into docs/agents evidence |
| .github | repository automation, ownership, and CI boundary | `.github/workflows/gate-pre-git-audit.yml` | check workflows and CODEOWNERS before workflow or ownership changes |
| templates | unclassified territory; evidence is inventory-level until anchors are read | `templates/pre-commit` | open the listed anchors before claiming ownership or runtime role |

## Weak Anchor Triage

These surfaces were detected as weak evidence for architecture. They may be
useful for focused work, but they should not dominate first-pass understanding.

| Category | Sample | Handling |
| --- | --- | --- |
| fixture/example data | fixtures/workspaces/docs-basic/baseline/README.md | use for repros, not architecture |

## Caution Zones

| Zone | Evidence | Guidance |
| --- | --- | --- |
| fixtures and generated data | fixtures/workspaces/docs-basic/baseline/README.md | avoid deriving product boundaries from these alone |

## Workspace Boundaries

| Source | Kind | Pattern |
| --- | --- | --- |

## Source Anchors Read First

| Path | Kind | Bytes |
| --- | --- | --- |
| AGENTS.md | .md | active thin Codex bootloader |
| CLAUDE.md | .md | active thin Claude bootloader |
| CURSOR.md | .md | active thin Cursor bootloader |
| README.md | .md | 10812 |
| docs/README.md | .md | 2951 |
| package.json | .json | 1442 |
| tsconfig.json | .json | 277 |
| src/adapter-runner.ts | .ts | 3525 |
| src/adapters.ts | .ts | 5241 |
| src/audit.ts | .ts | 2725 |
| src/checks.ts | .ts | 6890 |
| src/cli.ts | .ts | 14786 |
| src/config.ts | .ts | 2754 |
| src/doctor.ts | .ts | 14979 |
| src/evidence.ts | .ts | 4377 |
| src/fixes.ts | .ts | 8954 |
| src/gate.ts | .ts | 6805 |
| src/git.ts | .ts | 4069 |
| src/governance.ts | .ts | 9682 |
| src/impact.ts | .ts | 4296 |
| src/installer.ts | .ts | 17794 |
| src/manifest.ts | .ts | 2371 |
| src/profiles.ts | .ts | 7363 |
| src/push.ts | .ts | 3134 |
| src/release.ts | .ts | 12547 |
| src/snapshot.ts | .ts | 2314 |
| src/tools.ts | .ts | 4159 |
| src/types.ts | .ts | 4364 |
| src/versioning.ts | .ts | 14547 |
| src/workflow.ts | .ts | 1985 |
| docs/build-test-fail-fix-local-ci-os.md | .md | 41681 |
| docs/governance-runtime.md | .md | 6179 |
| docs/incidents/2026-05-11-github-audit-self-contamination.md | .md | 3397 |
| docs/landscape-and-lessons.md | .md | 6894 |
| docs/migration-v0.1.0-rc.md | .md | 5096 |
| docs/positioning.md | .md | 4179 |
| docs/product-roadmap.md | .md | 7042 |
| docs/product-strategy.md | .md | 5108 |
| docs/release-slo-and-noise.md | .md | 4419 |
| docs/releases/v0.1.0.md | .md | 331 |
| docs/trust-model.md | .md | 3816 |
| docs/version-governance.md | .md | 2960 |
| .cursor/rules/tes-runtime-capabilities.mdc | .mdc | 1844 |

## Runtime And Governance Surfaces

| Surface | Status |
| --- | --- |
| claude_mcp | present |
| claude_md | present |
| claude_plugin | present |
| claude_plugin_skill | present |
| claude_project_skill | present |
| codex_agents | present |
| codex_mcp | present |
| codex_skill | present |
| cortex_contract | present |
| cursor_bootloader | present |
| cursor_mcp | present |
| cursor_rules | present |
| docs_agents | present |
| tes_field_reports_disabled | missing |
| tes_field_reports_helper | present |
| tes_field_reports_outbox | present |
| tes_field_reports_pre_push | present |
| tes_legacy_retirement_helper | present |
| tes_mcp_embed_helper | present |
| tes_mcp_server | present |
| tes_root_context_helper | present |
| tes_update_helper | present |

## Package Scripts

| Script | Command |
| --- | --- |
| advice | bun src/cli.ts advice |
| check | bun src/cli.ts check |
| check:all | bun src/cli.ts check --all |
| doctor | bun src/cli.ts doctor |
| gate | .gate-pre-git/bin/gate-pre-git check --all |
| gate:audit | .gate-pre-git/bin/gate-pre-git audit --all --format json |
| gate:doctor | .gate-pre-git/bin/gate-pre-git doctor |
| gate:push | .gate-pre-git/bin/gate-pre-git push |
| gate:release-plan | .gate-pre-git/bin/gate-pre-git release plan |
| gate:replay | bun test tests/replay-fixtures.test.ts |
| gate:staged | .gate-pre-git/bin/gate-pre-git staged |
| gate:version-audit | .gate-pre-git/bin/gate-pre-git version audit |
| init:dry | bun src/cli.ts init |
| staged | bun src/cli.ts staged |
| test | bun test |
| test:migration | bun test tests/migration-canary.test.ts |
| typecheck | tsc --noEmit |

## Quality And Certification Scripts

| Script | Command |
| --- | --- |
| check | bun src/cli.ts check |
| check:all | bun src/cli.ts check --all |
| doctor | bun src/cli.ts doctor |
| gate:doctor | .gate-pre-git/bin/gate-pre-git doctor |
| test | bun test |
| test:migration | bun test tests/migration-canary.test.ts |
| typecheck | tsc --noEmit |

## Recertification Gates

| Command | Status |
| --- | --- |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_context_oracle.py --self-test | PASS |
| git diff --check | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/root_context.py analyze --target /Users/murillo/Dev/gate-pre-git | RECOVERED |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/field_reports.py status --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_context_oracle.py --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_alignment_oracle.py --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py verify --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py audit --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py rebuild --target /Users/murillo/Dev/gate-pre-git | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py curate-plan --target /Users/murillo/Dev/gate-pre-git --backend lexical | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex_mcp.py --self-test | PASS |
| /opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.agents/skills/tes-engineering-discipline/scripts/discipline_oracle.py --self-test | PASS |

## Recommended Deep Reads

- `README.md`
- `docs/README.md`
- `package.json`
- `tsconfig.json`
- `src/adapter-runner.ts`
- `src/adapters.ts`
- `src/audit.ts`
- `src/checks.ts`
- `src/cli.ts`
- `src/config.ts`
- `src/doctor.ts`
- `src/evidence.ts`

## Next Work Guidance

- For `fixtures`, do not promote fixture shape as core runtime design.
- For `src`, open the listed anchors before claiming ownership or runtime role.
- For `plugins`, open the listed anchors before claiming ownership or runtime role.
- For `tests`, start with local test governance and smallest related test command.
- For `docs`, cross-check claims against source anchors before editing behavior.
- For `.gate-pre-git`, open the listed anchors before claiming ownership or runtime role.
- For `.cursor`, recover durable local semantics from `.tes/bk/**` into docs/agents evidence.
- For `.agents`, recover durable local semantics from `.tes/bk/**` into docs/agents evidence.

## Open Context Questions

- What is the project domain in one sentence, based on product docs and source
  entrypoints?
- Which directories define the runtime boundary, persistence boundary, and
  external integration boundary?
- Which commands are the smallest safe quality gates before commit?
- Which facts should be promoted into Cortex cells after user review?

## Maintenance Rule

Update this file when project meaning changes: architecture reshapes, new
runtime surfaces, major scripts, public API boundaries, test strategy,
deployment model, or agent governance. Keep detailed file inventories in
`docs/agents/evidence/**`; keep durable memory in `docs/agents/cortex/**`.
