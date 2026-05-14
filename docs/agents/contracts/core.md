---
tes_doc: core-contract
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/trust-model.md
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - contract
---

# Core Contract

`gate-pre-git` is a local repository governance runtime for GitHub-bound
repositories. It governs the Git transition before a change becomes a commit,
push, pull request, or GitHub audit event.

Agents must preserve these product facts:

- Git remains the source of repository truth.
- GitHub remains the remote audit and branch-protection anchor.
- Local hooks are useful defaults, not a security boundary.
- `doctor`, `check`, `staged`, `push`, and `audit` are governed evidence
  producers, not generic command wrappers.
- JSON/SARIF audit artifacts must not contaminate the audited workspace.

Unknowns and public-release claims must stay explicit until backed by project
docs, source, and current local gates.
