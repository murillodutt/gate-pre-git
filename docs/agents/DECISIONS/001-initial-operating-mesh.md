---
tes_doc: decision
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
  - decision
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-ROADMAP]]"
  - "[[EXECUTION-LINE]]"
---

# Decision: Initial Operating Mesh

Use `docs/agents/**` as the portable Markdown operating mesh for this project.
Obsidian may visualize the mesh, but Markdown and Git remain the source of
truth.

## Evidence

- `README.md`
- `docs/agents/PROJECT-CONTEXT.md`
- `docs/agents/evidence/20260511T220733Z-tes-project-manifest.json`

## Consequences

- Runtime adapter files stay thin.
- Future work starts from [[PROJECT-CONTEXT]] and [[EXECUTION-LINE]].
- Deeper semantic refinement belongs to `/tes-align`.
