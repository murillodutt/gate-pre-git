# Trust Model

Status: current product boundary for the pre-RC foundation.

Date: 2026-05-11.

## Core Boundary

`gate-pre-git` governs the Git transition before a change reaches GitHub. It is
designed to make the default local path deterministic, auditable, and cheap.

It is not a cryptographic security boundary. Local Git hooks can be skipped,
edited, or misconfigured by a developer with local repository access. The product
therefore treats trust as layered evidence, not as faith in a hook.

## What The Local Gate Proves

Local commands prove facts about the local repository state at execution time:

1. `staged` reads the real Git index snapshot.
2. `push` resolves the intended Git range from the configured base.
3. trusted fixes are applied only through the transaction engine.
4. governed files are classified by zone, owner, risk, and required evidence.
5. locked local tools and configured commands produce named evidence.
6. JSON and SARIF reports carry a deterministic manifest hash.
7. `doctor` can detect drift in the vendored install, hooks, tools, workflow,
   launcher, runtime, smoke behavior, and version sync.

## What GitHub Audit Proves

The GitHub workflow reruns the audit surface against the repository state that
arrived at GitHub. It validates JSON/SARIF manifest identity and publishes the
audit artifacts.

It proves:

1. the vendored launcher can run in a clean GitHub runner;
2. locked tool shims can be restored from `.gate-pre-git/lock.json`;
3. the repository state can produce a valid JSON audit report;
4. the SARIF report carries the same manifest hash as JSON;
5. branch protection can require this audit job.

It does not prove:

1. every developer ran the local hook before pushing;
2. a local hook was not bypassed with Git options;
3. every expensive project build or test was duplicated remotely;
4. the repository is secure without branch protection;
5. policy exceptions are correct without human ownership review.

## Bypass And Drift Handling

| Risk | Product Response |
| --- | --- |
| `git commit --no-verify` bypasses local hooks | GitHub audit and branch protection still run on pushed state. |
| Hooks are edited or missing | `doctor` fails hook command reference checks. |
| Vendored runtime is missing | `doctor` fails `vendored_runtime` and launcher execution checks. |
| Tool shims are missing | `update-tools` restores shims from the explicit lockfile. |
| Lockfile or governance is weakened | `doctor` fails drift checks against the base template. |
| Partial staging would make a fix unsafe | Transactional fixes block instead of staging unrelated work. |
| GitHub workflow is weakened | `doctor` requires the audit workflow and shim restoration step. |
| GitHub audit artifacts are written into the audited workspace | `gate` and `doctor` reject self-contaminating audit workflows. |

## Operator Responsibilities

Repository owners remain responsible for:

1. requiring the GitHub audit job in branch protection;
2. reviewing governance zones, owners, risks, evidence, and exceptions;
3. deciding which project commands belong in `check` and `push`;
4. reviewing files staged by trusted fixes before commit history is published;
5. choosing the public distribution and support policy before release.

## Release Language

Use precise language:

1. GitHub reruns and validates the audit surface.
2. The local gate governs staged and push boundaries.
3. Branch protection remains mandatory for shared repositories.
4. Audit artifacts are evidence and must stay outside the audited workspace.
5. Hooks are not a security boundary by themselves.

Avoid:

1. claiming the workflow proves the local hook was run;
2. claiming CI is replaced;
3. claiming cost reduction without a measured benchmark;
4. claiming production security from local hooks alone.
