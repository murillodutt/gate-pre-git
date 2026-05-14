---
tes_doc: boundaries
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: README.md
  - path: docs/governance-runtime.md
  - path: docs/trust-model.md
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/contracts/domain-boundaries.md
  - path: CLAUDE.md
tags:
  - tes
  - boundaries
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[EXECUTION-LINE]]"
  - "[[QUALITY-GATES]]"
---

# Boundaries And Constraints

## Approval Locks

- Do not push, tag, publish, amend, change remotes, install dependencies, or
  touch secrets without explicit user approval. Source: `CLAUDE.md`,
  `AGENTS.md`.
- Do not run destructive commands (`git reset --hard`, `git push --force`,
  `rm -rf`, `--no-verify`) to get a green result. Source: `CLAUDE.md`
  governance, project execution contract.
- Do not modify project-owned governance (`AGENTS.md`, `CLAUDE.md`,
  `CURSOR.md`, `.cursor/rules/**`, `.claude/settings.json`, `.codex/**`)
  without a reviewed merge. Source: `docs/agents/PROJECT-CONTEXT.md` Caution
  Zones.
- Do not place project-specific rules inside TES-owned skills
  (`.claude/skills/tes-*/**`, `skills/tes-*/**`,
  `.agents/skills/tes-*/**`). Source: `CLAUDE.md` Locks.

## Product Runtime Boundaries

- `src/**` is product runtime; only `src/cli.ts` is a CLI entrypoint; do
  not invent CLI commands outside it. Source:
  `docs/agents/contracts/domain-boundaries.md`.
- `src/governance.ts` owns zone/owner/risk/evidence/exception mapping.
  Source: `docs/agents/contracts/domain-boundaries.md`.
- `src/gate.ts` composes checks, governance, evidence, impact, adapters,
  and configured commands. Source:
  `docs/agents/contracts/domain-boundaries.md`.
- `.gate-pre-git/**` is the vendored install surface used by this
  repository for self-hosted proof. Do not edit it as if it were source.
  Source: `docs/agents/contracts/domain-boundaries.md`.
- `.github/workflows/gate-pre-git-audit.yml` is the remote audit anchor.
  Audit artifacts must be emitted outside the audited workspace. Source:
  `README.md`, `docs/incidents/2026-05-11-github-audit-self-contamination.md`.

## Evidence And Privacy Boundaries

- Treat `README.md` and Git-tracked source as truth. Treat generated TES
  files as context aids, not truth. Source: project execution contract.
- Do not expose secrets or copy sensitive source content into TES Field
  Reports. Source: `.tes/field-reports/**` privacy contract.
- Do not call external services, publish, push, tag, or create issues
  without explicit approval. Source: `CLAUDE.md`.

## Trust Model Boundaries

- Local hooks are powerful defaults, not a security boundary. Source:
  `README.md` Trust Model.
- GitHub audit proves the repository state can produce the expected audit
  manifest. It does not prove every developer ran the local hook before
  push. Source: `README.md` Trust Model.

## Caution Zones

| Zone | Reason | Handling |
|------|--------|----------|
| `.gate-pre-git/**` | Vendored install surface, not source. | Reinstall via `bun src/cli.ts init`; do not hand-edit. |
| `.github/workflows/gate-pre-git-audit.yml` | Workflow output must not contaminate workspace. | Verify writes target runner temp directory. |
| `fixtures/workspaces/**` | Replay/migration canaries. | Use for proofs; do not promote fixture shape as core architecture. |
| `.tes/**`, `.claude/**`, `.cursor/**`, `.codex/**`, `.agents/**` | Agent runtime surfaces. | Recover durable semantics via `.tes/bk/**` after central clean backup. |
