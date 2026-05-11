# Release SLO And Noise Criteria

Status: release-candidate criteria for `gate-pre-git@0.1.0`.

Date: 2026-05-11.

## Purpose

`gate-pre-git` is valuable only if it moves expensive quality work to the local
Git boundary without replacing remote cost with local noise. These criteria
define the release-candidate latency, determinism, and noise bars.

The SLO is measured on warm local runs against this repository and every
versioned replay workspace under `fixtures/workspaces/**`.

## Latency SLO

| Surface | RC Target | Hard Stop |
| --- | --- | --- |
| `doctor` | P95 <= 5s warm | 15s cold |
| `staged` docs/text-only | P95 <= 5s | 20s |
| `staged` source with adapters | P95 <= 15s | 60s |
| `check --all` on gate repo and replay fixtures | P95 <= 45s | 120s |
| `push --base origin/main` with commands | P95 <= 90s | 180s |
| `push --base origin/main --no-commands` | P95 <= 15s | 45s |
| `audit --all --format json` | P95 <= 20s | 60s |
| `audit --all --format sarif` | P95 <= 25s | 60s |
| GitHub audit job after dependency setup | <= 2m | 5m |

The GitHub audit job should validate artifacts and branch protection signals. It
must not become the default expensive duplicate of local checks.

## Noise Criteria

A release candidate fails when any clean baseline produces avoidable noise:

1. Clean replay baselines must have zero findings.
2. Replay mutations must emit only expected finding codes.
3. Versioned replay fixtures must not report `push_range`.
4. JSON and SARIF audit manifest hashes must match.
5. SARIF evidence properties must not include volatile `durationMs`.
6. The vendored launcher must not include user-local absolute paths.
7. `doctor` must report no governance drift, tool lock drift, hook drift,
   launcher drift, workflow drift, or smoke-test drift.
8. No evidence-enforced `check` or `push` run may have
   `no_provider_for_required_evidence`.
9. No generated, sensitive, or unowned path may pass without an active scoped
   exception.
10. Missing optional toolchains may degrade only the command lane for that
    fixture; the structural lane still has to pass.

## Current Measured Baseline

Latest local evidence after commit `62d3fe3` and tag
`foundation/pre-rc-2026-05-11`:

| Command | Result |
| --- | --- |
| `bun src/cli.ts doctor --target .` | passed over 95 files with `vendored_runtime`, launcher execution, workflow, hooks, tools, smoke, and version sync |
| `bun run typecheck` | passed |
| `bun test` | 70 tests passed, 480 assertions |
| `bun run gate` | passed over 95 governed files in about 41s |
| `bun src/cli.ts push --target . --base origin/main` | passed with `files=0`, no `push_range`, and command evidence |
| JSON/SARIF audit canary | passed with equal manifest hash `40b62633867f518ab66ab5f0b3a28d594c279703ab1b04281cf1597d4ee19037` |
| `bun src/cli.ts version audit --target .` | passed for `package.json`, `.gate-pre-git/governance.json`, `.gate-pre-git/lock.json`, and `src/types.ts` at `0.1.0` |
| `bun src/cli.ts release audit --target . --from foundation/pre-rc-2026-05-11 --to HEAD` | passed with 3 classified entries, 1 excluded release commit, and artifact hash `da1a7acd01da78f2ed8f1e6cd0088b2617f34ab2546eb08c8f0fc1ab6380f1b0` |

These are lower-bound local measurements, not public benchmark claims. Public
release wording must wait for support policy, distribution channel, pinned
external canaries, branch protection validation, and repeated RC runs.

## RC Evidence Commands

```sh
bun run typecheck
bun test
bun test tests/replay-fixtures.test.ts
bun src/cli.ts doctor --target .
bun run gate
bun src/cli.ts push --target .
bun src/cli.ts audit --target . --format json
bun src/cli.ts audit --target . --format sarif
```

The JSON/SARIF identity canary must compare the JSON `manifestHash` with
`runs[0].properties.gatePreGitManifestHash` from SARIF and reject any evidence
payload that contains `durationMs`.

## Release Decision

The current local state is a technical RC foundation, not a public global
release. The committed baseline and release artifact audit requirements are now
satisfied. Public release remains blocked until:

1. the full RC evidence command set is repeated after the final release-artifact
   commit;
2. a public install channel, security policy, and support matrix exist;
3. a pinned external canary validates adoption outside this checkout;
4. branch protection is configured on the real GitHub repository.
