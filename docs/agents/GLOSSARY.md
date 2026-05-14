---
tes_doc: glossary
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: README.md
  - path: docs/governance-runtime.md
  - path: docs/product-roadmap.md
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - glossary
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-STATE]]"
---

# Glossary

## Product Terms

| Term | Meaning |
|------|---------|
| Local Git boundary | The transition between developer worktree and Git history, where `gate-pre-git` runs. |
| Vendored install | `.gate-pre-git/**` written into a target repo; the runtime ships with the repo, not on PATH. |
| Governance Map | Local versioned policy mapping files to zone, owner, risk, evidence, and exception. Source: `docs/governance-runtime.md`. |
| Governed evidence | Structured output from `doctor`, `check`, `staged`, `push`, `audit` carrying governance/evidence/impact data. |
| Manifest hash | Deterministic identity included in JSON/SARIF audit output for remote validation. |
| Audit self-contamination | Failure mode where audit output is written into the audited workspace. Source: `docs/incidents/2026-05-11-github-audit-self-contamination.md`. |
| Strict mode | Default policy with no permissive baseline path. Source: `docs/product-roadmap.md` V1 DoD. |
| Pre-RC foundation | Local proof baseline at commit `62d3fe3`, tag `foundation/pre-rc-2026-05-11`. |

## TES / Mesh Terms

| Term | Meaning |
|------|---------|
| Project anchor | High-signal path used to verify context (`README.md`, `src/cli.ts`, `package.json`). |
| Gate | Command, oracle, or documented proof that certifies a claim. |
| Operating mesh | Linked `docs/agents/**` layer used by future agents. |
| System X-Ray | Mermaid view of the project organism: Git state, behavior, validation mesh, release boundary, memory. |
| Convergence Line | Mermaid view of done/current/next/later/deferred/blocked/unknown/final states. |
| Evidence packet | Timestamped Markdown under `docs/agents/evidence/**` retained as immutable proof. |
| Cortex cell | Durable knowledge artifact under `docs/agents/cortex/cells/**` promoted after user review. |
| Field Report | Sanitized operational transport packet under `.tes/field-reports/**`. |
| Quality oracle | Python helper under `.tes/bin/**` that returns deterministic PASS/NEEDS_REVIEW/BLOCKED. |
