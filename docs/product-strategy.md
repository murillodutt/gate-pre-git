# Product Strategy

Status: target strategy with current implementation anchors.

Date: 2026-05-11.

## Category

`gate-pre-git` should not be positioned as another hook manager, formatter
wrapper, or CI shortcut.

The category is:

> Local repository governance runtime for GitHub-bound repositories.

The runtime governs the transition from local code to GitHub. It sits at the
Git boundary, understands staged snapshots and push ranges, applies trusted
fixes transactionally, validates evidence, and emits audit reports that GitHub
can verify cheaply.

## Problem

Most repositories split responsibility across weak local hooks, expensive
GitHub Actions, scattered linter scripts, and governance that lives only in
human process.

That creates repeated failure modes:

1. GitHub becomes the first expensive processor for basic quality issues.
2. Local hooks run against the wrong surface, usually the working tree instead
   of the staged index.
3. Autofix behavior is either too timid or too surprising.
4. Tool versions drift across developers and CI.
5. Ownership, risk, generated files, exceptions, and evidence are not first
   class runtime data.
6. The PR sees policy too late, after compute, review time, and context have
   already been spent.

## Thesis

The local Git boundary is the earliest practical place to sanitize a change
with full repository context and developer feedback.

GitHub should receive a repository state that is already formatted, validated,
classified, and explained. Remote CI should verify the audit surface, branch
protection, and any intentionally remote checks, not rediscover every
preventable defect by default.

## North Star

Before a change reaches GitHub, the runtime can produce a deterministic answer:

```json
{
  "ok": true,
  "mode": "push",
  "files": ["src/gate.ts"],
  "governance": [
    {
      "file": "src/gate.ts",
      "zone": "source_js",
      "owners": ["platform"],
      "risk": "high",
      "requiredEvidence": ["biome", "gitleaks", "typecheck", "test", "gate"],
      "exception": null
    }
  ],
  "tools": [
    {
      "name": "biome",
      "version": "2.4.15",
      "status": "installed"
    }
  ],
  "fixesApplied": [],
  "filesStaged": [],
  "manifestHash": "sha256..."
}
```

The exact schema will evolve, but the product promise is stable: the report
must be useful to humans, agents, GitHub, and future automation.

## Product Pillars

### Git-Native Truth

The runtime must trust Git data, not assumptions.

`staged` reads the real index. `push` resolves the range from merge-base. The
gate detects partial staging, unstaged drift, renames, deletions, conflicts, and
untracked files where those states affect correctness.

### Transactional Fixes

Trusted adapters may fix files, but fixes are not casual side effects.

The runtime captures state, applies the fix, computes the diff, stages the
trusted result, reloads the index, validates again, and blocks with objective
diagnostics if any step fails.

### Hermetic Local Tools

Tools are vendored by repository policy.

The lockfile is explicit. Local cache is local. `latest` is never implicit.
`update-tools` is the only normal path for changing tool versions.

### Executable Governance

Governance must be runtime behavior.

Zones, owners, risk, evidence, generated paths, sensitive paths, and exceptions
belong in the local gate output and audit manifest. If policy only lives in
documentation, it is not enforced.

### Cheap GitHub Audit

GitHub remains important, but it is not the heavy worker.

The remote workflow should rerun and validate the audit surface for the
repository state that reached GitHub: JSON report, manifest, SARIF, and branch
protection signals. It should not claim that a local hook was executed, and it
should not duplicate the full local processing graph by default.

### Portable Adoption

The project must work as a vendored template in any repository.

The first install should be boring: initialize, doctor, check, and commit only
after the repository is clean.

## Non-Goals

1. Replacing every CI workflow.
2. Becoming a universal build system.
3. Hiding project-specific commands behind vague magic.
4. Allowing permissive baselines in the first strict version.
5. Mutating PRs remotely as the primary autofix path.
6. Treating hooks as secure by themselves.

## Success Criteria

The product is ready for serious adoption when a clean repository can prove:

1. Staged checks observe the real index.
2. Push checks observe the intended upstream range.
3. Trusted fixes are staged only through the transaction engine.
4. Every file is governed by a zone or blocked as unowned.
5. Tool versions are resolved from lockfile data.
6. The GitHub audit is cheap, stable, and machine-readable.
7. `doctor` can prove the install, hooks, tools, workflow, and smoke behavior.

## Strategic Risk

The largest product risk is not missing one more linter.

The largest risk is becoming a loose command aggregator. The moat is governance
at the Git boundary: exact snapshots, transaction safety, evidence structure,
tool locks, and audit integrity.
