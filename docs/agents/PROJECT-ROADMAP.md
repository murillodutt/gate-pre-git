---
tes_doc: project-roadmap
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: README.md
  - path: docs/agents/evidence/20260511T220733Z-tes-project-manifest.json
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - project-roadmap
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-STATE]]"
  - "[[EXECUTION-LINE]]"
---

# Project Roadmap

This roadmap starts with a System X-Ray and a Convergence Line, then keeps
compact audit lanes. It prevents future agents from rebuilding what `/tes-init`
already identified and keeps uncertainty explicit.

## System X-Ray

```mermaid
flowchart TD
  A["Project system<br/>real operating map"] --> B["Git state"]
  A --> C["Delivered behavior"]
  A --> D["Validation mesh"]
  A --> E["Release boundary"]

  B --> B1["HEAD and worktree<br/>verify before commit"]
  C --> C1["docs/agents/**<br/>project operating mesh"]
  C --> C2["Runtime adapters<br/>Codex, Claude, Cursor"]
  D --> D1["Context oracle"]
  D --> D2["Alignment oracle"]
  D --> D3["Project quality gates"]
  E --> E1["Technical GO"]
  E --> E2["Sealed/release claim<br/>requires explicit gate"]

  classDef system fill:#eef2f7,stroke:#475569,color:#0f172a;
  classDef behavior fill:#e6f0ff,stroke:#2b6cb0,color:#102a43;
  classDef gate fill:#d8f5df,stroke:#1b7f3a,color:#0b351a;
  classDef pending fill:#ffe4e6,stroke:#be123c,color:#4c0519;
  classDef release fill:#f3e8ff,stroke:#7e22ce,color:#2e1065;

  class A,B,C,D,E,B1 system;
  class C1,C2 behavior;
  class D1,D2,D3,E1 gate;
  class E2 pending;
```

## Convergence Line

```mermaid
flowchart TD
  A["Done: project identity detected"] --> B["Done: context and register created"]
  B --> C["Current: semantic alignment"]
  C --> D["Next: confirm project quality gate"]
  D --> E["Next: refine state, execution line, and gates"]
  E --> F["Later: add ADRs when decisions are evidenced"]
  E --> J["Deferred: release or bundle claim until requested"]
  E --> I["Final: technical GO after project gates pass"]
  D --> G["Blocked: secrets, external systems, or destructive work need approval"]
  C --> H["Unknown: runtime and deployment claims need source evidence"]

  classDef done fill:#d8f5df,stroke:#1b7f3a,color:#0b351a;
  classDef current fill:#fff0bf,stroke:#b7791f,color:#4a2d00;
  classDef next fill:#e6f0ff,stroke:#2b6cb0,color:#102a43;
  classDef later fill:#eef2f7,stroke:#64748b,color:#0f172a;
  classDef deferred fill:#fef9c3,stroke:#a16207,color:#422006;
  classDef blocked fill:#ffe4e6,stroke:#be123c,color:#4c0519;
  classDef unknown fill:#f5f5f4,stroke:#78716c,color:#1c1917;
  classDef final fill:#f3e8ff,stroke:#7e22ce,color:#2e1065;

  class A,B done;
  class C current;
  class D,E next;
  class F later;
  class J deferred;
  class G blocked;
  class H unknown;
  class I final;
```

## Current Claim

- Initial project scaffold: `PASS`.
- Alignment depth remains limited until `/tes-align` reads strong project
  anchors and updates the mesh with source-backed meaning.
- Sealed, release-ready, pushed, or commercial-use claims are not available
  until the matching Git, bundle, release, and canary gates pass.

## Next Irreversible Step

- Run the smallest project quality gate from [[QUALITY-GATES]] before commit.
- Commit only after separating unrelated staged work from this project lane.

## Done

- Project identity and source anchors were captured from `README.md`.
- `docs/agents/PROJECT-CONTEXT.md` and `docs/agents/PROJECT-REGISTER.md` were
  created as initial durable context.

## Active

- Execute `/tes-align` semantics by reading the strongest anchors and refining
  [[PROJECT-STATE]], [[EXECUTION-LINE]], and [[QUALITY-GATES]].

## Next

- Confirm the smallest safe project gate from `README.md` or package metadata.
- Promote stable facts to Cortex only after review.

## Later

- Add project-specific ADRs when architectural decisions become clear.

## Deferred

- Visual Obsidian Canvas or Bases views are optional and must point back to
  Markdown truth.

## Blocked

- Mark work blocked when secrets, external services, destructive operations, or
  missing local dependencies prevent proof.

## Unknown

- Any architecture or product claim not supported by `README.md` or
  `docs/agents/evidence/20260511T220733Z-tes-project-manifest.json` remains unknown.
