---
tes_doc: boundaries
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/evidence/20260511T220733Z-tes-project-manifest.json
tags:
  - tes
  - boundaries
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[EXECUTION-LINE]]"
  - "[[QUALITY-GATES]]"
---

# Boundaries And Constraints

- Preserve project-owned governance such as `AGENTS.md`, `CLAUDE.md`, Cursor
  rules, and existing docs unless the user authorizes a reviewed merge.
- Do not expose secrets or copy sensitive source content into Field Reports.
- Do not call external services, publish, push, tag, or create issues without
  explicit approval.
- Do not run destructive commands to get a green result.
- Treat `README.md` and Git-tracked source as truth; treat generated TES files
  as context aids.
