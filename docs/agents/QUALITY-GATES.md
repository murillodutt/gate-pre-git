---
tes_doc: quality-gates
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
  - quality-gates
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[EXECUTION-LINE]]"
  - "[[BOUNDARIES-AND-CONSTRAINTS]]"
---

# Quality Gates

| Gate | Class | Command Or Proof |
|------|-------|------------------|
| Project context oracle | required | `python3 .tes/bin/project_context_oracle.py --target .` |
| Project alignment oracle | focused | `python3 .tes/bin/project_alignment_oracle.py --target .` |
| Project quality gates | required | `check: bun src/cli.ts check` |
| Unclassified quality gate | needs_review | Record the missing, unsafe, or ambiguous proof before claiming GO. |
| Missing local toolchain | unavailable | Record the blocker before claiming coverage. |
| Production or secret-backed action | unsafe | Requires explicit user approval. |

Initialization gate status: `PASS`.
