# zqx Adoption Learning

## Claim

The `zqx` adoption proved that `gate-pre-git` needs two explicit operating
routes:

1. an assisted adoption route that is reversible, scoped to changed/governed
   files, project-aware, and upstream-aware; and
2. a strict certification route for full repository audits and release
   readiness.

## Evidence

- `docs/agents/evidence/20260514T220842Z-zqx-adoption-learning.md`
- `docs/governance-runtime.md`
- `docs/product-roadmap.md`
- Runtime anchors: `src/adapters.ts`, `src/adapter-runner.ts`,
  `src/installer.ts`, and `src/push.ts`.

## Durable Lessons

- Changed-scope gates must not silently become whole-repo audits.
- Existing Git hooks are project governance and must be composed, not blindly
  overwritten.
- Push scope must derive from the branch upstream before falling back to
  `origin/main`.
- Runtime mesh files must not dominate product profile detection.
- A successful first install should end with a certification report and a named
  optional audit debt lane, not a demand to clean all historical repository
  noise immediately.

## Related

- `docs/agents/cortex/cells/gate-pre-git-project-boundary.md`
- `docs/agents/PROJECT-ROADMAP.md`
- `docs/certified-installation.md`
