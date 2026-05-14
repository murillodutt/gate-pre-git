---
tes_doc: knowledge-lifecycle
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
  - knowledge-lifecycle
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-ROADMAP]]"
  - "[[GLOSSARY]]"
---

# Knowledge Lifecycle

- Validate new claims against `README.md`, `docs/README.md`, or another cited
  project path before promotion.
- Refresh [[PROJECT-CONTEXT]] and [[PROJECT-STATE]] after architecture,
  runtime, ownership, or quality-gate changes.
- Retire superseded roadmap items by moving them to Done, Deferred, or Blocked
  with evidence instead of deleting history silently.
- Preserve contradictions until source evidence resolves them.
