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
8. No governed file may have `no_provider_for_required_evidence`.
9. No generated, sensitive, or unowned path may pass without an active scoped
   exception.
10. Missing optional toolchains may degrade only the command lane for that
    fixture; the structural lane still has to pass.

## Current Measured Baseline

Latest local evidence after the WAVE_17 migration canary:

| Command | Result |
| --- | --- |
| `bun test tests/migration-canary.test.ts` | clean external repository migration passed with launcher-only `doctor`, `check`, `staged`, `push`, JSON/SARIF audit parity, and pre-commit block |
| `bun test tests/replay-fixtures.test.ts` | 8 replay fixtures passed, 238 assertions, about 24s after integration timeout correction |
| `bun test` | 70 tests passed, 480 assertions after vendored runtime and migration canary |
| `bun src/cli.ts doctor --target .` | passed over 95 files after vendored runtime and launcher execution checks |
| `bun run gate` | passed over 95 governed files after vendored runtime promotion |
| `bun src/cli.ts push --target .` | passed over 92 governed files, with no-HEAD info on this uncommitted repo |
| JSON/SARIF audit canary | passed, equal manifest hash |

These are lower-bound local measurements, not public benchmark claims. Public
release wording must wait for an initial repository commit and repeated RC runs.

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
release. Public release remains blocked until:

1. The repository has a committed baseline.
2. The full RC evidence command set is rerun from that baseline.
3. Replay fixture results are recorded after the baseline commit.
4. The migrated clean-target canary remains green from the committed baseline.
