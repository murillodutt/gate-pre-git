# Product Roadmap

Status: target roadmap anchored to the current certified foundation.

Date: 2026-05-11.

## Roadmap Principle

The first goal is not "more checks."

The first goal is auditable trust at the local Git to GitHub boundary. Every
wave should improve one of these properties:

1. Snapshot correctness.
2. Transaction safety.
3. Governance clarity.
4. Tool hermeticity.
5. Audit stability.
6. Developer portability.

## Current Foundation

The repository has a locally fixture-certified pre-RC foundation:

1. Bun-based CLI.
2. Vendored `.gate-pre-git/` template.
3. Strict policy default.
4. Staged snapshot checks based on the Git index.
5. Transactional built-in fixes with auto-stage.
6. Push range resolver with no-HEAD and no-remote handling.
7. Tool lock and local shims.
8. Governance map runtime.
9. JSON and SARIF audit output with manifest hash.
10. Doctor checks for hooks, launcher, tools, workflow, and smoke behavior.
11. Real locked adapter execution for Biome, markdownlint, actionlint,
    Gitleaks, Ruff, and shellcheck where matching files exist.
12. Evidence policy and impact planning attached to governed files.
13. GitHub audit workflow anchoring JSON/SARIF artifacts and manifest hash.
14. Fleet drift checks for governance weakening and tool lock drift.
15. Auto-profile detection for Nuxt, Node, Python, Go, Rust, docs, security,
    shell scripts, and GitHub Actions surfaces.
16. Synthetic multi-repository fixture pack with a full Node adapter/command
    canary and no-command governance canaries for additional ecosystems.
17. First versioned replay workspace (`node-basic`) with committed baseline,
    local `origin/main`, before audit manifest, failing push mutation, and
    portable launcher/workflow checks.
18. Replay fixture family for Node, Nuxt, Python, Go, Rust, docs, security, and
    GitHub Actions, with clean baselines and failing push mutations.
19. Release-candidate SLO/noise criteria and versioned migration guide.
20. Version governance runtime for SemVer plan, bump, audit, and doctor
    `version_sync` enforcement.
21. Release governance runtime for Git-history changelog classification,
    deterministic `CHANGELOG.md`/release-note generation, and artifact audit.
22. Vendored runtime bundle and clean external migration canary proving a
    repository can run from only `.gate-pre-git/bin/gate-pre-git`.
23. Committed local baseline `62d3fe3` with tag
    `foundation/pre-rc-2026-05-11` and post-baseline evidence.
24. Release artifacts for `v0.1.0` generated and audited from the local Git
    interval, with release commits excluded from changelog classification.

## Wave 1: Structured Governance Evidence

Status: certified on 2026-05-11.

Goal: make governance first-class report data.

Acceptance:

1. Every governed file has `zone`, `owners`, `risk`, `requiredEvidence`, and
   optional `exception` fields in JSON output.
2. SARIF carries equivalent governance properties per result or run.
3. The manifest hash includes deterministic governance evidence.
4. Tests prove governed, unowned, sensitive, generated, and expired-exception
   cases.
5. `doctor` fails if the default map cannot classify the vendored install.

## Wave 2: Real Adapter Execution

Status: certified on 2026-05-11.

Goal: move from adapter planning to controlled adapter execution.

Acceptance:

1. Biome, markdownlint, actionlint, gitleaks, and ruff can run from lockfile
   resolved shims.
2. Tool absence installs or reports the exact missing lock entry.
3. Tool failures map to stable findings.
4. Timeout and execution errors are distinguishable from policy failures.
5. Tests cover successful runs, failing runs, missing tools, and cache drift.

## Wave 3: Evidence Policy Engine

Status: certified on 2026-05-11.

Goal: connect governance zones to required proof.

Acceptance:

1. Governance map can declare required evidence by zone.
2. Checks and adapter results satisfy named evidence.
3. Missing evidence blocks with an objective finding.
4. Exceptions are scoped, dated, and visible in audit output.
5. Evidence results are included in the audit manifest.

## Wave 4: Local Impact Planner

Status: certified on 2026-05-11.

Goal: reduce unnecessary local and remote cost without hiding risk.

Acceptance:

1. Docs-only changes run cheap docs evidence.
2. Source changes run source evidence.
3. Workflow and config changes run high-risk evidence.
4. Unknown files fail as unowned or route to strict default evidence.
5. Reports explain why each check did or did not run.

## Wave 5: GitHub Audit Anchor

Status: certified on 2026-05-11.

Goal: make GitHub a cheap verifier of the local contract.

Acceptance:

1. Workflow runs `gate-pre-git audit`.
2. Branch protection can require the audit job.
3. SARIF upload is supported when requested.
4. The audit report names local tool versions and governance evidence.
5. Documentation explains what GitHub audits and what remains local.

## Wave 6: Fleet Governance

Status: drift detection foundation implemented on 2026-05-11.

Goal: make the runtime useful across many repositories.

Current acceptance:

1. Drift between template, lockfile, launcher, hooks, and workflow is detected.
2. Local repos can extend policy without silently weakening the base contract.

Planned acceptance:

1. Repositories can update policy templates through explicit commands.
2. Organizations can define standard zones and evidence names.
3. Fleet reports can compare adoption and risk without uploading source code.

## Next Product Checkpoints

The next maturity layer is moving from pre-RC local proof to release-candidate
packaging and real pinned external canaries:

1. Add full command canaries for Go and Rust when local toolchains are
   present, with degraded classification when they are not.
2. Add public package channel, license, security policy, and support matrix.
3. Add optional SARIF upload path in GitHub audit.
4. Add fleet report format for adoption and drift without source upload.
5. Add pinned external canaries after local replay proof stays stable.

## V1 Definition Of Done

The first serious release is ready when:

1. `init`, `doctor`, `staged`, `fix`, `check`, `push`, `audit`, and
   `update-tools` are stable.
2. Strict mode has no permissive baseline path.
3. Tool execution is lockfile-driven.
4. Trusted autofix is transactional and traceable.
5. Governance output is structured.
6. GitHub audit is minimal and documented.
7. Fixtures cover Node/Nuxt, Python, Go, Rust, docs, security, and GitHub
   Actions surfaces.
8. Documentation includes a versioned migration guide and public release
   checkup.

## Go/No-Go Gate

Do not call a wave complete unless all are true:

1. A failing fixture existed before the fix.
2. The fix changed runtime behavior or product documentation intentionally.
3. `bun run typecheck` passes.
4. `bun test` passes.
5. `bun src/cli.ts doctor --target .` passes.
6. `bun src/cli.ts check --target . --all` passes.
7. The Build-Test-Fail-Fix ledger records the durable learning.
