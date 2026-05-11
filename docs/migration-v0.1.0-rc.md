# Migration Guide v0.1.0 RC

Status: release-candidate migration guide.

Date: 2026-05-11.

## Prerequisites

1. A Git repository with a clean or intentionally reviewed worktree.
2. Bun available on the developer machine.
3. A project owner willing to fix all strict findings before first adoption.
4. No expectation of a permissive baseline in this release.

## Install

From the target repository:

```sh
gate-pre-git init --target . --profile auto --yes
gate-pre-git doctor --target .
gate-pre-git check --target . --all
```

Use an explicit profile only when auto-detection is intentionally not desired:

```sh
gate-pre-git init --target . --profile node --yes
gate-pre-git init --target . --profile nuxt --yes
gate-pre-git init --target . --profile docs --yes
```

## Installed Files

The initializer writes or updates:

1. `.gate-pre-git/config.json`
2. `.gate-pre-git/governance.json`
3. `.gate-pre-git/lock.json`
4. `.gate-pre-git/bin/gate-pre-git`
5. `.gate-pre-git/runtime/cli.js`
6. `.gate-pre-git/cache/.gitignore`
7. `biome.json` when Biome is enabled and no project Biome config exists
8. native Git `pre-commit` and `pre-push` hooks
9. `.github/workflows/gate-pre-git-audit.yml`
10. package scripts when `package.json` exists

## Required Acceptance

Do not consider a repository covered until all of these pass:

```sh
gate-pre-git doctor --target .
gate-pre-git check --target . --all
gate-pre-git staged --target .
gate-pre-git push --target . --base origin/main
gate-pre-git audit --target . --format json
```

If the repository has no `HEAD` yet, `push` may report the no-HEAD information
path. That is acceptable for bootstrapping, but public release proof should use
a committed baseline and a normal base ref.

The migration canary proves this guide in a clean temporary repository by
running only the installed `.gate-pre-git/bin/gate-pre-git` launcher after
initialization. It validates `doctor`, `check`, `staged`, `push`, JSON/SARIF
audit parity, and a real pre-commit block on invalid staged JSON.

## Governance Review

Open `.gate-pre-git/governance.json` and review:

1. zones and path ownership;
2. risk level per zone;
3. required evidence per zone;
4. sensitive paths;
5. generated paths;
6. exceptions with explicit expiry dates.

Adding local zones is allowed. Weakening base zones, base evidence, sensitive
paths, generated paths, tool locks, launcher, hooks, or workflow anchors should
make `doctor` fail.

## Branch Protection

In GitHub, require the `gate-pre-git-audit` workflow for protected branches.
The workflow should stay cheap: it emits and validates JSON/SARIF audit
artifacts instead of duplicating the full local processing graph.

## Updating Tools

Tool versions change only through the explicit lock path:

```sh
gate-pre-git update-tools --target .
gate-pre-git doctor --target .
gate-pre-git check --target . --all
gate-pre-git push --target . --base origin/main
```

Never rely on implicit `latest`.

## Rollback

Rollback should be deliberate and auditable:

1. Remove or restore native Git hooks from `.git/hooks/pre-commit` and
   `.git/hooks/pre-push`.
2. Restore prior package scripts if they existed.
3. Restore or remove `.github/workflows/gate-pre-git-audit.yml`.
4. Archive or remove `.gate-pre-git/`, including the vendored runtime.
5. Run `git status --short --branch --untracked-files=all` and review the
   resulting diff.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `doctor` reports missing shims | Run `gate-pre-git update-tools --target .` and rerun `doctor`. |
| `doctor` reports governance drift | Restore missing base zone paths, evidence, sensitive paths, or generated paths. |
| `staged` fails while worktree looks fixed | The Git index still contains the failing snapshot; run `git add` after review. |
| `fix` blocks on partial staging | Review unstaged drift and stage intentionally before retrying. |
| `push` reports no base | Pass `--base <ref>` or create/update the local base ref. |
| Secret path is blocked | Remove the file or add a narrow governance exception only when policy allows it. |
| GitHub audit fails but local gate passes | Compare JSON/SARIF manifest hash and confirm the workflow uses the vendored launcher. |

## Definition Of Migrated

A repository is migrated only when:

1. local hooks are installed and executable;
2. `doctor`, `check --all`, `staged`, `push`, and JSON audit pass;
3. GitHub branch protection requires the audit workflow;
4. developers know how to run `fix`, `update-tools`, and rollback;
5. the first post-adoption PR shows GitHub doing audit, not heavy sanitation.
