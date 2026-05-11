# Incident: GitHub Audit Self-Contamination

Date: 2026-05-11.

Status: corrected by executable product rule.

## Summary

The first public GitHub audit runs for `gate-pre-git` exposed a real product
gap. The workflow executed the audit command and redirected its JSON/SARIF
artifacts into the repository workspace that was being audited. Because the
audit was running with `--all`, the partially written artifact became part of
the audit input.

This produced red GitHub Actions runs on `main`. The failures are intentionally
preserved as public evidence. They are not cosmetic noise: they proved that the
project needed a semantic rule preventing audit workflows from contaminating
their own input set.

## Observed Runs

| Commit | Run result | Meaning |
| --- | --- | --- |
| `51dafdc` | failed | First public workflow exposed the unsafe artifact location. |
| `5fddae7` | failed | A credentials hypothesis did not address the root cause. |
| `8fa478a` | failed | Added diagnostics and confirmed the audit artifact was being parsed as input. |
| `d98cbfd` | passed | Moved audit artifacts to the GitHub runner temp directory. |

## Root Cause

The unsafe workflow shape was:

```sh
.gate-pre-git/bin/gate-pre-git audit --target . --all --format json > gate-pre-git-audit.json
```

The shell creates or truncates `gate-pre-git-audit.json` before the audit process
starts. Since `--all` inspects the repository workspace, the audit saw that
empty or partial JSON file and reported objective failures such as invalid JSON
and unowned governance surface.

## Control Failure

The product checked that a GitHub audit workflow existed and contained expected
steps, but it did not enforce the stronger semantic rule: audit artifacts must
not be written inside the audited workspace.

That meant the local product could certify a workflow shape that later failed in
the remote auditor. For a tool whose purpose is to normalize repository state
before GitHub, that is a real contract failure.

## Corrective Action

The generated workflow now writes artifacts to the GitHub runner temp directory:

```sh
.gate-pre-git/bin/gate-pre-git audit --target . --all --format json > "$RUNNER_TEMP/gate-pre-git-audit.json"
.gate-pre-git/bin/gate-pre-git audit --target . --all --format sarif > "$RUNNER_TEMP/gate-pre-git-audit.sarif"
```

The product also gained an executable guard:

1. `doctor` fails when the GitHub audit workflow writes audit artifacts inside
   the workspace.
2. `gate push` fails when the same unsafe workflow is part of the pushed change.
3. Regression tests cover both commands.
4. The GitHub audit job validates JSON/SARIF manifest identity from temp
   artifacts.

## Prevention Rule

Audit output is evidence, not source input. Any workflow that audits `--target .`
and writes `gate-pre-git-audit.json` or SARIF artifacts into the repository tree
is invalid.

The remote GitHub job remains useful as the cheap final auditor, but the local
gate must reject known unsafe workflow shapes before they reach `main`.

## What This Does Not Claim

This incident does not prove that GitHub Actions can be removed, that local
hooks are a security boundary, or that future workflow mistakes are impossible.
It proves a narrower and more important product behavior: when an avoidable
GitHub failure is discovered, the cause becomes a versioned rule, a local
doctor check, and a regression test.
