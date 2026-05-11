# Positioning

Status: public narrative draft backed by current local proofs.

Date: 2026-05-11.

## Core Claim

`gate-pre-git` governs the local Git boundary before GitHub sees the change.

It verifies the exact staged or push surface, applies only trusted
transactional fixes, classifies files by governance zone, runs locked local
tools, and emits JSON/SARIF audit evidence that GitHub can validate cheaply.

## Comparison By Job

| Alternative | What It Does Well | Where `gate-pre-git` Is Different |
| --- | --- | --- |
| pre-commit | Strong hook ecosystem and polyglot hook reuse. | The core product is governance evidence, manifest identity, and GitHub audit anchoring, not hook catalog size. |
| Lefthook | Fast local hook orchestration. | Commands become evidence required by zone, owner, and risk policy instead of remaining standalone tasks. |
| Husky plus CI | Simple Node hook plumbing and familiar package workflow. | The installer verifies native or Husky hooks, pre-push, package scripts, tool locks, governance map, runtime launcher, and workflow drift. |
| MegaLinter or Super-Linter | Broad linter coverage, especially in CI. | The product decides what must run locally, why it satisfies evidence, and what GitHub should audit remotely. |
| GitHub Actions-heavy workflows | Branch protection and remote audit remain valuable. | GitHub verifies the local contract instead of becoming the first expensive processor for preventable defects. |

## Verifiable Claims

| Claim | Proof |
| --- | --- |
| Reads the real staged index, not the working tree. | `tests/gate.test.ts` covers staged-invalid and worktree-valid divergence. |
| Blocks partial-staged fixer drift. | `tests/transaction.test.ts` proves the transaction engine refuses unrelated drift. |
| Executes trusted fixes transactionally and revalidates. | `tests/gate.test.ts` covers fix, stage, reload, and pass behavior. |
| Installs a vendored runtime instead of relying on a global binary. | `tests/migration-canary.test.ts` runs only `.gate-pre-git/bin/gate-pre-git` inside a clean external repo. |
| Fails install drift through `doctor`. | `src/doctor.ts` checks config, governance, lock, launcher, runtime, hooks, scripts, workflow, tools, smoke, and self-check. |
| Emits stable JSON/SARIF manifest identity. | `tests/audit-manifest.test.ts` covers hash stability and SARIF parity. |
| Treats governance as runtime data. | `tests/governance-integration.test.ts` verifies zone, owner, risk, evidence, and failure records. |
| Keeps GitHub audit small. | `.github/workflows/gate-pre-git-audit.yml` generates JSON/SARIF, validates manifest identity, and uploads artifacts. |

## Public Language

Use:

1. Local repository governance runtime.
2. Git boundary contract.
3. Vendored runtime and locked local tools.
4. Transactional fixes.
5. Cheap GitHub audit.

Avoid until measured:

1. Faster than other hook runners.
2. Replaces CI.
3. Enterprise governance.
4. Percentage cost-reduction claims.
5. Production-ready global release.

## Non-Goals

1. It is not a universal build system.
2. It is not a replacement for branch protection.
3. It does not treat local hooks as a security boundary.
4. It does not try to own every scanner category.
5. It does not normalize permissive baselines in the strict first release.
