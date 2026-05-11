# Documentation Index

This directory is the product memory for `gate-pre-git`.

The product goal is to make the local Git boundary a governed, deterministic,
and cheap quality frontier before GitHub receives a change. GitHub remains the
remote audit anchor, not the primary place where expensive sanitation and
governance are discovered.

## Reading Order

| Document | Purpose |
| --- | --- |
| [Product Strategy](product-strategy.md) | Defines the category, thesis, pillars, and non-goals. |
| [Landscape And Lessons](landscape-and-lessons.md) | Captures prior art, learnings, and competitive traps. |
| [Positioning](positioning.md) | Defines the public comparison and verifiable claims. |
| [Product Roadmap](product-roadmap.md) | Defines the target waves, acceptance gates, and release shape. |
| [Governance Map Runtime](governance-runtime.md) | Explains executable local repository governance. |
| [Version Governance Runtime](version-governance.md) | Explains governed version, changelog, and release artifact behavior. |
| [Release SLO And Noise Criteria](release-slo-and-noise.md) | Defines RC latency, determinism, and noise gates. |
| [Migration Guide v0.1.0 RC](migration-v0.1.0-rc.md) | Explains vendored adoption, rollback, and acceptance. |
| [Build-Test-Fail-Fix Ledger](build-test-fail-fix-local-ci-os.md) | Records implementation evidence and certification history. |

## Canonical Product Claim

`gate-pre-git` is a local repository governance runtime for GitHub-bound
repositories.

It should answer these questions before a commit or push leaves the developer
machine:

1. What changed in the real Git index or push range?
2. Which governance zone owns the change?
3. What risk level and evidence are required?
4. Which tools and exact versions evaluated the change?
5. Which trusted fixes were applied and staged?
6. Which findings remain blocking?
7. What minimal proof should GitHub audit remotely?
8. Which project version and release metadata are in sync?
9. Which commits entered the release interval and why?
10. Can a clean external repository run from only its vendored launcher?

## Documentation Governance

Docs are product artifacts, not notes. Every new strategic document should:

1. Link to the artifact it depends on.
2. State whether it describes current behavior or a target state.
3. Keep acceptance criteria observable.
4. Avoid claiming remote CI cost reduction unless the local gate path is named.
5. Stay aligned with `.gate-pre-git/governance.json`.

## Evidence Commands

Use these commands before treating documentation as accepted:

```sh
bun src/cli.ts check --target . --all
bun run typecheck
bun test
bun src/cli.ts doctor --target .
```
