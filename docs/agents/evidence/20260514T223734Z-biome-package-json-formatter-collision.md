---
tes_doc: evidence
status: active
owner: project
updated: 2026-05-14
confidence: high
evidence:
  - path: src/installer.ts
  - path: tests/migration-canary.test.ts
  - path: tests/profile-fixtures.test.ts
  - path: docs/migration-v0.1.0-rc.md
tags:
  - tes
  - evidence
  - adoption-learning
  - biome
  - formatter-collision
related:
  - "[[QUALITY-GATES]]"
  - "[[PROJECT-ROADMAP]]"
---

# Biome Package JSON Formatter Collision

Timestamp: `2026-05-14T22:37:34Z`

Status: `PROMOTED`

## Summary

ZQX adoption found a stable formatter loop between `builtin:json-format` and
Biome 2.4.15 on `package.json` arrays. The built-in normalizer collapsed short
arrays that fit the line width. Biome's `package.json` behavior expanded them
unless `json.formatter.expand` was configured explicitly. With auto-stage
fixes enabled, the gate could stage one formatter's output and then fail on the
other formatter's policy check.

## Classification

| Field | Value |
| --- | --- |
| Failure class | `product_bug` |
| Impact | New Biome-enabled adoptions could be commit-blocked by formatter disagreement. |
| False-green risk | A docs-only fix would leave new installs vulnerable. |
| Product fix | Installer now writes or narrowly merges `json.formatter.expand=auto` for Biome-enabled projects. |
| Regression oracle | Migration canary commits a `package.json` short-array mutation through the installed pre-commit hook. |

## 4D Transfer

- `product`: adapter defaults can conflict with built-in fixers even when both
  tools are individually correct. Selection: `apply_now`. Redistribution:
  installer compatibility baseline.
- `oracle`: structural install tests did not prove formatter convergence at
  the commit boundary. Selection: `apply_now`. Redistribution: real migration
  canary commit using the installed launcher and hook.
- `docs`: existing adopters need a recognizable symptom and one-line
  remediation. Selection: `apply_now`. Redistribution: migration guide
  troubleshooting entry.
- `decay`: future formatter adapters may add file-specific defaults.
  Selection: `defer`. Redistribution: general formatter ownership/collision
  detector remains a later design cut.

## Non-Claims

- This does not make Biome's `expand=always` policy wrong.
- This does not implement general inverse-diff collision detection.
- This does not transfer ownership of all `package.json` formatting to Biome.
- This does not certify projects that intentionally set
  `json.formatter.expand=always`; those projects must choose a local policy.
