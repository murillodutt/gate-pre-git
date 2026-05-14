---
tes_doc: knowledge-lifecycle
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: README.md
  - path: docs/README.md
  - path: docs/build-test-fail-fix-local-ci-os.md
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/agents/cortex/CONTRACT.md
tags:
  - tes
  - knowledge-lifecycle
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-ROADMAP]]"
  - "[[GLOSSARY]]"
---

# Knowledge Lifecycle

Knowledge layers, from volatile to durable:

| Layer | Path | Purpose |
|-------|------|---------|
| Working memory | conversation context | Active turn only; never source of truth. |
| Build-Test-Fail-Fix ledger | `docs/build-test-fail-fix-local-ci-os.md` | Implementation evidence and certification history. |
| Operating mesh | `docs/agents/**` | What is done, active, next, deferred, blocked, unknown. |
| Decisions | `docs/agents/DECISIONS/**` | Cited architectural/operational decisions. |
| Cortex cells | `docs/agents/cortex/cells/**` | Durable learning and durable boundaries. |
| Evidence packets | `docs/agents/evidence/**` | Retained generated proof with timestamp. |
| Product docs | `docs/**` (top level) | Public product memory: strategy, roadmap, runtime. |

## Promotion Rules

- Validate a new claim against `README.md`, `docs/README.md`,
  `docs/product-roadmap.md`, source under `src/**`, or evidence under
  `docs/agents/evidence/**` before promoting.
- Refresh [[PROJECT-CONTEXT]] and [[PROJECT-STATE]] after architecture,
  runtime, ownership, quality-gate, or release-boundary changes.
- Retire superseded roadmap items by moving them to Done, Deferred, or
  Blocked with evidence; never delete history silently.
- Preserve contradictions until source evidence resolves them.

## Cortex Promotion

- Promote a fact to a Cortex cell only after user review when:
  - The fact survives across at least one execution loop.
  - The fact is non-obvious from `README.md` or source.
  - The fact has at least one durable citation.
- Curated link candidates from `cortex.py curate-plan` require explicit
  source review before becoming wikilinks.

## Evidence Retention

- Every `/tes-init`, `/tes-align`, `/tes-update` run writes a timestamped
  packet under `docs/agents/evidence/`.
- Keep packets immutable. Newer runs append; older runs remain readable.
- Reference packets from `PROJECT-CONTEXT.md` and `PROJECT-ROADMAP.md`
  rather than copying content.

## Field Reports

- TES Field Reports are operational transport, not project truth.
- Outbox under `.tes/field-reports/outbox.jsonl`; install id under
  `.tes/field-reports/install_id`.
- Disable per-project only when a documented confidentiality reason exists.
