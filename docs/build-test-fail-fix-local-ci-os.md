# Build-Test-Fail-Fix Ledger: Local CI OS

execution_id: gate-pre-git-local-ci-os-2026-05-11
started_at: 2026-05-11T11:36:35-0300
mode: persistent_e2e
state: FRAMED

## Stage Zero Packet

- decision: proceed
- task_summary: converge five advanced gate-pre-git targets through real tests.
- baseline: main has no commits; full current tree is current_task_delta.
- consumer: developers moving GitHub PR/push processing to local Git boundaries.
- hypothesis: gate-pre-git can become a vendored local CI OS with rollback,
  audit manifest, adapters, smart push, and traceable auto-stage.
- oracle: targeted tests, `bun run typecheck`, `bun test`,
  `bun src/cli.ts doctor --target .`, `bun run gate`,
  `bun src/cli.ts push --target . --no-commands`, and
  `bun src/cli.ts audit --target . --all --format json`.
- territory: `src/**`, `tests/**`, `.gate-pre-git/**`, `.github/workflows/**`, docs.
- locks: do not weaken tests; do not touch remotes; do not hide failures; do not commit/push.
- false_green_risk: green check without proving Git index, rollback, manifest, adapters, or push range semantics.
- stop_condition: CERTIFIED when all five targets have proof and broad gates pass.

## Live Events

- FRAMED: created campaign from user-approved Local CI OS plan.
- BUILT: initial Local CI OS foundation already present before this loop: Git
  index snapshots, vendored template, tool lock, audit output, doctor smoke.
- FAILURE_OBSERVED: `push` on this no-commit repository originally had a
  no-HEAD edge; classified as `oracle_gap` for pre-push range semantics.
- FIX_APPLIED: added defensive push range resolver with no-HEAD, no-remote, and merge-base fixtures.
- FIX_APPLIED: added transaction rollback with worktree/index snapshots and trace hashes.
- FIX_APPLIED: added deterministic audit manifest and SARIF manifest hash.
- FIX_APPLIED: added adapter registry and integrated adapter planning into gate reports.
- ORIGINAL_RETESTED: `bun test` passed with 22 tests and 73 assertions.
- RELATED_GATES_RUN: `bun run typecheck`,
  `bun src/cli.ts doctor --target .`, `bun run gate`,
  `bun src/cli.ts push --target . --no-commands`, and SARIF parse/hash smoke
  all passed.
- FOUR_D_SCANNED: adapter plan, push range, rollback, and manifest are reusable
  product patterns inside this repo; no external redistribution needed.

## Certification Summary

final_state: CERTIFIED

### Acceptance Criteria

- rollback: transaction restores worktree and index on blocked or failed fixer paths.
- manifest: audit JSON and SARIF carry deterministic manifest hash.
- adapters: locked shim commands are generated for polygot tool adapters and surfaced in gate reports.
- push: no-HEAD and no-remote repositories are handled without noisy stderr.
- traceability: successful fixes record original/fixed short content hashes.

### Evidence

- `bun run typecheck`: passed.
- `bun test`: 22 pass, 0 fail, 73 assertions.
- `bun src/cli.ts doctor --target .`: passed.
- `bun run gate`: passed.
- `bun src/cli.ts push --target . --no-commands`: passed with informational no-HEAD finding.
- `bun src/cli.ts audit --target . --all --format sarif`: parsed as SARIF 2.1.0 and emitted a 64-character manifest hash.

### 4D Scan

```yaml
four_d_scan:
  discovery: Gate convergence improved when each local-CI concern had a deterministic fixture before integration.
  axis: pipeline_improvement
  selection: apply_now
  target: tests plus gate report surfaces
  verification: bun test; bun run gate; audit SARIF hash smoke
  decay: keep the ledger short and promote only durable fixtures, not raw command logs
```

### Technical Journal

- More mature: Git transaction safety, audit integrity, pre-push edge handling, adapter discoverability.
- Still weak: adapter execution is planned but not yet running external tools as
  blocking checks; push mode is range-aware but does not yet run selective
  project tests.
- Portable promotions: transaction rollback tests, manifest hash tests, push no-HEAD/no-remote tests, adapter command registry.
- Deferred learning: real Biome/Ruff/Gitleaks execution should be the next canary wave with network/cache failure classification.
- Next loop: execute real adapter commands through a controlled runner with
  timeouts, cache behavior, and per-tool failure mapping.

## Governance Runtime Loop

started_at: 2026-05-11
state: CERTIFIED

- hypothesis: gate-pre-git can move beyond command running by enforcing a repository governance map locally.
- acceptance_criteria: map is vendored, doctor requires it, gate classifies
  files by zone/risk/owner/evidence, and
  sensitive/generated/unowned/expired-exception cases fail.
- false_green_risk: docs or config exist but no executable governance check consumes them.
- agent_plan: schema/check worker, template/doctor worker, product/docs worker, maestro integration.
- FAILURE_OBSERVED: initial integration fixture failed because
  `.gate-pre-git/governance.json` was itself unowned; classified as
  `fixture_gap` and corrected by governing the governance map.
- FIX_APPLIED: added executable governance core, default vendored map, doctor
  requirement, gate integration, and governance runtime docs.
- ORIGINAL_RETESTED: `bun test tests/governance.test.ts
  tests/governance-integration.test.ts tests/gate.test.ts` passed after fixture
  correction.
- RELATED_GATES_RUN: `bun run typecheck`, `bun test`, `bun run gate`,
  `bun src/cli.ts doctor --target .`,
  `bun src/cli.ts push --target . --no-commands`, and audit JSON/SARIF manifest
  smokes passed.
- CERTIFIED_EVIDENCE: full suite passed with 31 tests, 0 failures, 107
  assertions; gate reports 40 governed files with zone, owner, risk, and
  evidence details.
- FOUR_D_SCANNED:
  discovery: governance must govern its own map or it becomes an unowned policy island.
  axis: risk_redistribution
  selection: apply_now
  target: default governance map and integration fixture
  verification: governance integration test plus `bun run gate`
  decay: keep default map small; add zones only when files become product surface.
- NEXT_LOOP: convert governance details into first-class structured report fields
  instead of detail strings, then map them into audit manifest/SARIF properties.

## Product Documentation Package

started_at: 2026-05-11
state: MATERIALIZED

- hypothesis: gate-pre-git needs product-grade documentation that defines the
  category, market lessons, roadmap, and governance target before additional
  runtime expansion.
- artifacts:
  - `docs/README.md`
  - `docs/product-strategy.md`
  - `docs/landscape-and-lessons.md`
  - `docs/product-roadmap.md`
- intent: preserve the product thesis that gate-pre-git is a local repository
  governance runtime for GitHub-bound repositories, not another hook runner.
- prior_art_verified: pre-commit, Trunk Check, Lefthook, lint-staged, Husky,
  MegaLinter, Super-Linter, Nx affected, GitHub CODEOWNERS, OpenSSF Scorecard,
  OpenSSF Allstar, Semgrep, Conftest, reviewdog, Danger JS, pre-commit.ci, and
  autofix.ci.
- next_product_cut: Structured Governance Evidence as first-class JSON, SARIF,
  and manifest data.

## Persistent Convergence Campaign

execution_id: gate-pre-git-global-convergence-2026-05-11
started_at: 2026-05-11T12:38:01-0300
mode: persistent_e2e
state: CERTIFIED

### Stage Zero Packet

- decision: proceed
- task_summary: converge the roadmap waves through systematic
  Build-Test-Fail-Fix loops until the local GitHub governance runtime is
  materially stronger.
- baseline: main has no commits; the full untracked tree is the current product
  package.
- branch: main
- top_commit: none yet; `git log -8 --oneline` fails because the branch has no
  commits.
- worktree_class: current_task_delta
- consumer: developers and teams that want local, cheap, deterministic
  governance before push or PR.
- hypothesis: gate-pre-git can converge from local CI OS toward a global local
  repository governance runtime by sequencing structured governance evidence,
  adapter execution, evidence policy, impact planning, GitHub audit anchor, and
  fleet governance.
- oracle: failing targeted tests first, then `bun run typecheck`, `bun test`,
  `bun src/cli.ts doctor --target .`, `bun run gate`, `bun src/cli.ts push
  --target . --no-commands`, and JSON/SARIF audit smokes.
- territory: `src/**`, `tests/**`, `.gate-pre-git/**`,
  `.github/workflows/**`, `docs/**`, and root package/config files.
- authorities: user challenge, product roadmap docs, governance runtime docs,
  and existing local test suite.
- locks: no remote mutation, no weakened oracle, no permissive baseline, no
  hidden debt, no commit or push during the canary campaign.
- searched_repo: status, log, `package.json`, `src/**`, `tests/**`, `docs/**`,
  `.gate-pre-git/**`.
- searched_external: prior landscape package already recorded in
  `docs/landscape-and-lessons.md`.
- missing_pieces: `bun run agent:mokh-resume` is not defined in this repo.
- selected_path: sequential product waves with bounded failing tests and live
  ledger updates.
- agent_plan: governance evidence explorer, adapter/evidence explorer, and
  audit/fleet explorer in parallel; maestro integrates and owns closure.
- false_green_risk: green aggregate tests without proving structured evidence,
  adapter execution, evidence satisfaction, impact planning, audit anchoring,
  and fleet drift detection.
- stop_condition: CERTIFIED when all material waves have acceptance evidence, or
  DEGRADED/BLOCKED/DEFERRED/NEEDS_REVIEW with named limits.

### Live Events

- FRAMED: accepted the user's convergence challenge and selected persistent E2E
  mode under maestro sequencing.
- BASELINE_CAPTURED: repo has no commits yet; all untracked files are treated
  as the current product package.
- INFRA_GAP_CLASSIFIED: `agent:mokh-resume` script is absent; classified as
  local Tilly infrastructure gap, not product blocker.
- WAVE_1_BUILT: added failing structured governance evidence tests for
  `GateReport`, audit manifest, and SARIF run properties.
- WAVE_1_FAILURE_OBSERVED: targeted tests failed because `report.governance`
  and `manifest.governance` were undefined.
- WAVE_1_CAUSE_CLASSIFIED: `oracle_gap`; governance existed only as text
  details, so audit consumers could not consume it as structured evidence.
- WAVE_1_FIX_APPLIED: added `GateGovernanceRecord`, structured governance
  evaluation, report-level governance data, manifest schema version 2, and SARIF
  governance properties while preserving text details.
- WAVE_1_ORIGINAL_RETESTED: `bun test tests/governance-integration.test.ts
  tests/audit-manifest.test.ts` passed with 8 tests and 24 assertions.
- WAVE_1_RELATED_GATES_RUN: `bun run typecheck` passed.
- WAVE_1_FOUR_D_SCANNED:
  discovery: governance details must have one machine-readable source of truth
    and text output should become a compatibility surface.
  axis: product_opportunity
  selection: apply_now
  target: `GateReport.governance`, audit manifest, and SARIF run properties.
  verification: targeted governance and audit manifest tests.
  decay: keep `checks[].details` until CLI text consumers have a replacement.
- WAVE_2_BUILT: added a real adapter runner with no-shell execution, timeouts,
  cache drift classification, and adapter findings mapped into gate reports.
- WAVE_2_FAILURE_OBSERVED: exact lock entries for `actionlint` and `gitleaks`
  were not installable as written; Biome and markdownlint also exposed local
  formatting and documentation drift.
- WAVE_2_CAUSE_CLASSIFIED: `product_bug` for invalid tool lock packages and
  `evidence_gap` for adapters that were only planned, not executed.
- WAVE_2_FIX_APPLIED: corrected lock packages, regenerated shims, added Biome
  and markdownlint configs, and routed adapter execution through the gate.
- WAVE_2_ORIGINAL_RETESTED: adapter runner tests passed and real adapter checks
  executed through `bun run gate`.
- WAVE_3_BUILT: added an evidence policy engine that turns governance-required
  evidence into first-class `GateReport.evidence` records.
- WAVE_3_FAILURE_OBSERVED: governed source could pass without a provable local
  provider for required evidence.
- WAVE_3_CAUSE_CLASSIFIED: `oracle_gap`; governance had requirements but no
  executable satisfaction policy.
- WAVE_3_FIX_APPLIED: collected builtin, adapter, command, mode, and governance
  evidence, then blocked `check` and `push` when required evidence is missing.
- WAVE_3_ORIGINAL_RETESTED: evidence policy tests passed for missing and
  satisfied command evidence.
- WAVE_4_BUILT: added an impact planner that explains which evidence must run
  and which checks can be skipped for the current governed files.
- WAVE_4_FAILURE_OBSERVED: docs-only changes still looked like broad source
  changes because the gate lacked a governed impact surface.
- WAVE_4_CAUSE_CLASSIFIED: `false_green`; a passing full gate did not explain
  why cheap local processing was correct for the changed surface.
- WAVE_4_FIX_APPLIED: `GateReport.impact` now records run/skip decisions by
  evidence id, provider, zone, and governed files.
- WAVE_4_ORIGINAL_RETESTED: impact planner tests passed with a committed
  baseline fixture for docs-only changes.
- WAVE_5_BUILT: anchored the GitHub workflow to the local audit contract.
- WAVE_5_FAILURE_OBSERVED: a workflow could drift to a trivial green command
  while `doctor` only checked for basic workflow existence.
- WAVE_5_CAUSE_CLASSIFIED: `governance_risk`; remote audit could become a
  false assurance layer instead of a minimal independent verifier.
- WAVE_5_FIX_APPLIED: workflow now emits JSON and SARIF audit artifacts and
  validates manifest hash, governance, evidence, impact, and artifact upload.
- WAVE_5_ORIGINAL_RETESTED: doctor drift test fails on `echo ok`; actionlint
  passes on the vendored workflow.
- WAVE_6_BUILT: added fleet drift detection for vendored governance and tool
  locks.
- WAVE_6_FAILURE_OBSERVED: a repository could locally weaken required evidence
  or change tool versions while keeping syntactically valid config.
- WAVE_6_CAUSE_CLASSIFIED: `governance_risk`; valid JSON is not enough when the
  policy surface loses risk or evidence strength.
- WAVE_6_FIX_APPLIED: `doctor` compares vendored governance and tool lock
  entries against strict defaults while allowing additive local zones.
- WAVE_6_ORIGINAL_RETESTED: doctor fails when `gate_runtime_source` evidence is
  weakened below the default base.
- WAVE_7_BUILT: added a deterministic audit canary comparing JSON and SARIF
  hashes generated by separate CLI invocations.
- WAVE_7_FAILURE_OBSERVED: JSON and SARIF audit hashes differed on the same
  repository state because evidence duration telemetry entered the manifest.
- WAVE_7_CAUSE_CLASSIFIED: `product_bug`; an audit hash must represent semantic
  evidence, not wall-clock timing.
- WAVE_7_FIX_APPLIED: audit manifests now project evidence without volatile
  `durationMs`, sort evidence file and zone sets, and SARIF exposes the stable
  manifest evidence view.
- WAVE_7_ORIGINAL_RETESTED: audit manifest tests passed and CLI JSON/SARIF
  hashes converged to the same 64-character digest.
- WAVE_7_FALSE_GREEN_REMOVED: SARIF evidence properties no longer carry
  duration telemetry, so the remote audit artifact is quieter and hash-aligned.
- WAVE_8_BUILT: promoted the final checkup from `push --no-commands` smoke to
  full `push` execution with adapter, command, impact, and evidence policy.
- WAVE_8_FAILURE_OBSERVED: full `push` failed because `gate_runtime_source`
  required `gate` evidence while push mode only produced `push` mode evidence.
- WAVE_8_CAUSE_CLASSIFIED: `product_bug`; pre-push is a Git boundary gate and
  must satisfy the semantic `gate` evidence while also reporting `push`.
- WAVE_8_FIX_APPLIED: check and push modes now both provide `gate` evidence;
  push additionally provides `push` evidence, and the impact planner marks
  `gate` as a mode-backed run in push mode.
- WAVE_8_ORIGINAL_RETESTED: targeted evidence test passed and
  `bun src/cli.ts push --target .` passed with full commands enabled.
- WAVE_9_BUILT: opened the multi-repository portability loop with auto-profile
  detection and fixture-pack tests for Nuxt, Node, Python, Go, Rust, docs,
  GitHub Actions, shell scripts, and secret-path blocking.
- WAVE_9_FAILURE_OBSERVED: `auto` was a static profile, the default governance
  map was too gate-repo-shaped, user workflows and shell scripts were unowned,
  and generated package files could fail Biome under target defaults.
- WAVE_9_CAUSE_CLASSIFIED: `non_portable_learning` plus `product_bug`; the core
  was certified locally but not yet portable enough for global repository
  shapes.
- WAVE_9_FIX_APPLIED: auto init now detects repo surfaces, writes a Biome config
  when Biome is enabled, uses generic polygot governance zones, keeps vendored
  gate artifacts out of project formatter adapters, and always includes the
  security/audit tools needed by the vendored workflow.
- WAVE_9_ORIGINAL_RETESTED: `bun test tests/profile-fixtures.test.ts` passed
  with 4 fixture canaries and real adapter/command execution for the Node case.
- WAVE_10_BUILT: repeated the panoramic cutover-style checkup across docs,
  governance, lint, typecheck, tests, doctor, full gate, full push, and
  JSON/SARIF audit identity.
- WAVE_10_FAILURE_OBSERVED: Biome rejected `.gate-pre-git/governance.json`
  formatting after the generic polygot governance expansion.
- WAVE_10_CAUSE_CLASSIFIED: `release_hygiene`; the policy was semantically
  correct, but vendored governance artifacts must also be formatter-clean
  because they are part of the distributed template contract.
- WAVE_10_FIX_APPLIED: normalized `.gate-pre-git/governance.json` with the
  locked Biome formatter and reran the full local gate chain.
- WAVE_10_ORIGINAL_RETESTED: markdownlint, Biome, typecheck, full test suite,
  doctor, full gate, full push, and JSON/SARIF audit hash canary all passed.
- WAVE_10_FINAL_CHECKUP: core runtime is a technical GO for the next
  development wave; public/global release remains NO_GO until versioned fixture
  workspaces, before/after replay reports, SLO/noise criteria, and a versioned
  migration guide are complete.
- WAVE_11_BUILT: added the first versioned replay workspace
  `fixtures/workspaces/node-basic`, materialized it into a temporary Git
  repo, committed a clean gate-installed baseline, created a local
  `origin/main` ref, captured before audit evidence, committed a secret-path
  mutation, and replayed the push gate against the baseline.
- WAVE_11_FAILURE_OBSERVED: release audit found the vendored launcher was tied
  to a user-local source path and fixture workspace files would be unowned by
  the governance map.
- WAVE_11_CAUSE_CLASSIFIED: `certification_gap` plus `governance_risk`; the
  core worked locally, but the distributed template and future fixture evidence
  were not portable enough for a global product claim.
- WAVE_11_FIX_APPLIED: launcher now resolves repository root and chooses a
  vendored runtime, source checkout, or PATH runtime without `/Users/...`;
  GitHub audit installs dependencies only for source checkouts; doctor checks
  launcher portability; governance includes `fixture_workspaces`.
- WAVE_11_ORIGINAL_RETESTED: `bun test tests/replay-fixtures.test.ts`,
  `bun test tests/gate.test.ts`, and
  `bun test tests/profile-fixtures.test.ts tests/push.test.ts` passed.
- WAVE_11_FALSE_GREEN_REMOVED: replay workspaces live under `fixtures/**`
  instead of `tests/fixtures/**`, so fixture-internal tests are not discovered
  as first-class product tests by `bun test`.
- WAVE_11_SECOND_FAILURE_OBSERVED: after removing test-discovery noise, the
  replay baseline failed because Node profile used raw `bun test` and
  `spec/value-check.ts` had no governance zone.
- WAVE_11_SECOND_FIX_APPLIED: Node/Nuxt profiles now respect
  `package.json#scripts.test` when present, and `tests_js` covers common
  `tests/**`, `test/**`, `spec/**`, and `__tests__/**` support paths while
  preserving Biome and test evidence.
- WAVE_12_BUILT: generalized replay fixtures from `node-basic` to a discovered
  replay family covering Node, Nuxt, Python, Go, Rust, docs, security, and
  GitHub Actions.
- WAVE_12_FAILURE_OBSERVED: replay mutation proof initially tested only one
  mutation per fixture, GitHub Actions expected adapter evidence while commands
  were intentionally disabled in mutation replay, and Python used a Ruff-only
  mutation that could not fail structurally.
- WAVE_12_CAUSE_CLASSIFIED: `false_green` plus `fixture_gap`; the suite could
  appear broad while hiding ignored mutations or command-environment coupling.
- WAVE_12_FIX_APPLIED: replay fixtures are discovered from
  `fixtures/workspaces/*/fixture.json`, every mutation runs in a clean cloned
  baseline, structural lanes always run, command lanes run only when declared
  prerequisites are available, and mutation failures use deterministic
  structural findings.
- WAVE_12_ORIGINAL_RETESTED: `bun test tests/replay-fixtures.test.ts` passed
  with 8 fixtures and 238 assertions.
- WAVE_13_BUILT: added release-candidate SLO/noise criteria, a versioned
  migration guide, and a `gate:replay` script.
- WAVE_13_CAUSE_CLASSIFIED: `evidence_gap`; public release criteria existed in
  conversation and roadmap intent, but not yet as versioned artifacts.
- WAVE_13_FIX_APPLIED: `docs/release-slo-and-noise.md` defines latency,
  determinism, and noise gates; `docs/migration-v0.1.0-rc.md` defines install,
  governance review, branch protection, update, rollback, and troubleshooting.
- WAVE_14_FAILURE_OBSERVED: `bun run gate` failed after the replay fixture
  expansion because broad ecosystem zones such as `**/*.go`, `**/*.py`, and
  `**/*.rs` captured fixture workspace files before the narrower
  `fixtures/**` zone could apply.
- WAVE_14_CAUSE_CLASSIFIED: `product_bug` plus `governance_risk`; governance
  zone matching was order-sensitive and could assign the wrong evidence policy
  to intentionally versioned canary files.
- WAVE_14_FIX_APPLIED: governance zone selection now chooses the most specific
  matching path rule, with a regression test proving `fixtures/**` beats broad
  extension rules.
- WAVE_14_ORIGINAL_RETESTED: `bun test tests/governance.test.ts`,
  `bun run typecheck`, and `bun run gate` passed after the specificity fix.
- WAVE_15_BUILT: added a Version Governance Runtime with `version plan`,
  `version bump`, and `version audit` actions.
- WAVE_15_FAILURE_OBSERVED: the first targeted test failed because no
  `src/versioning.ts` product surface existed; after implementation, bump
  reports incorrectly treated the post-bump value as `currentVersion`.
- WAVE_15_CAUSE_CLASSIFIED: `oracle_gap` followed by `product_bug`; version
  governance needed both a real product core and precise before/after release
  semantics.
- WAVE_15_FIX_APPLIED: added SemVer parsing, source-of-truth detection,
  workspace package discovery, project/runtime target sync, preflight drift
  blocking, JSON/text CLI reports, and `doctor` `version_sync` enforcement.
- WAVE_15_SECOND_FAILURE_OBSERVED: `doctor` initially failed on initialized
  consumer repositories because target project versions were compared against
  `.gate-pre-git/*#generatedBy`, which represents the vendored gate version.
- WAVE_15_SECOND_FIX_APPLIED: vendored gate metadata and `src/types.ts` are
  synchronized only for the `gate-pre-git` runtime project; consumer repos keep
  their own package version boundary.
- WAVE_15_ORIGINAL_RETESTED: `bun test tests/versioning.test.ts
  tests/gate.test.ts`, `bun run typecheck`, `bun src/cli.ts version plan
  patch --target . --format json`, `bun src/cli.ts version audit --target .
  --format json`, and `bun src/cli.ts doctor --target .` passed.
- WAVE_16_BUILT: added Release Governance Runtime with `release plan`,
  `release write`, and `release audit`.
- WAVE_16_FAILURE_OBSERVED: the first release E2E failed because no
  `src/release.ts` product surface existed.
- WAVE_16_CAUSE_CLASSIFIED: `oracle_gap`; version sync existed, but release
  interval closure, changelog classification, and artifact drift were not
  executable product behavior.
- WAVE_16_FIX_APPLIED: added Git-history release planning, conventional commit
  classification, exclusion of bump/lock/merge/bot commits, deterministic
  `CHANGELOG.md` and `docs/releases/vX.Y.Z.md` generation, artifact audit, and
  CLI JSON/text output.
- WAVE_16_ORIGINAL_RETESTED: `bun test tests/release.test.ts` passed against a
  real temporary Git repo with a SemVer tag, release commits, excluded commits,
  generated artifacts, drift audit, and CLI JSON write.
- WAVE_16_SECOND_FAILURE_OBSERVED: root `release plan --target .` blocks before
  the first repository commit because no Git release baseline can exist yet.
- WAVE_16_SECOND_FIX_APPLIED: the failure was kept as a product guardrail and
  covered by E2E; release planning requires a tag, commit baseline, or explicit
  `--from` ref instead of inventing history.
- WAVE_16_FINAL_RETESTED: `bun test`, `bun run typecheck`, `bun run gate`,
  `bun src/cli.ts doctor --target .`, `bun src/cli.ts push --target .`, and
  JSON/SARIF audit hash canary passed after the release governance runtime.
- WAVE_17_BUILT: added vendored runtime bundling, executable launcher doctor
  proof, workflow shim restoration through `update-tools`, external migration
  canary, and public positioning doc.
- WAVE_17_FAILURE_OBSERVED: a clean client repository could pass text-oriented
  install checks while still depending on a global `gate-pre-git` binary or
  source checkout; a clean GitHub clone could also lack ignored cache shims.
- WAVE_17_SECOND_FAILURE_OBSERVED: the full replay suite exposed a false
  integration timeout on `python-basic` when tool execution crossed Bun's
  default 5s per-test limit.
- WAVE_17_CAUSE_CLASSIFIED: `product_bug` plus `false_green` plus
  `certification_gap`; portability had to be proved by the installed launcher,
  not by internal APIs, and replay fixtures needed an integration-test timeout.
- WAVE_17_FIX_APPLIED: `init` now writes `.gate-pre-git/runtime/cli.js`, the
  launcher prefers that runtime, `doctor` checks `vendored_runtime` and executes
  the launcher, the workflow restores shims from lockfile before audit, and the
  migration canary deletes cache shims and regenerates them through the launcher.
- WAVE_17_ORIGINAL_RETESTED: `bun test tests/migration-canary.test.ts
  tests/gate.test.ts` passed with 13 tests and 69 assertions; `bun test
  tests/replay-fixtures.test.ts` passed with 8 replay fixtures and 238
  assertions after the timeout correction.
- WAVE_17_SUITE_RETESTED: `bun test` passed with 70 tests and 480 assertions.

### Current 4D Scan

```yaml
four_d_scan:
  discovery: Audit integrity fails when semantic evidence and runtime telemetry share one hash surface; pre-push fails when boundary mode evidence is named too literally; global adoption fails when auto profile, launcher, runtime bundling, workflow shim restoration, governance defaults, fixture evidence, zone precedence, version ownership, or release interval closure are repo-shaped.
  axis: reusable_pattern
  selection: apply_now
  target: audit manifest projection, SARIF run properties, evidence mode semantics, auto profile detection, default governance map, portable launcher, vendored runtime, workflow shim restoration, replay fixture harness, migration canary, specificity-based zone selection, version governance runtime, release governance runtime, RC SLO/noise docs, migration guide
  verification: audit manifest unit test, JSON/SARIF CLI hash canary, full push command, profile fixture pack, replay workspace push mutation, clean external migration canary, governance specificity test, version bump E2E test, release artifact E2E test, markdown governance
  decay: keep human timing in reports, but exclude it from audit identity; keep mode-specific evidence without breaking semantic gate evidence; replace synthetic fixture claims as versioned replay workspaces land; do not claim public RC until a committed baseline reruns the RC evidence chain
```

### Certification Evidence

- `bun run typecheck`: passed.
- `bun test`: 44 tests passed, 0 failed, 143 assertions.
- `bun test` after fixture-pack wave: 49 tests passed, 0 failed, 166
  assertions.
- `bun src/cli.ts doctor --target .`: passed with config, lock, launcher,
  hooks, workflow, cache, smoke, self-check, governance drift, and lock drift
  checks green.
- `bun run gate`: passed over 52 governed files with real Biome, Gitleaks,
  actionlint, markdownlint, typecheck, tests, impact plan, and evidence policy.
- Repeated panoramic checkup after the fixture-pack wave: `bun run gate` passed
  over 53 governed files; `bun src/cli.ts push --target .` passed with full
  adapter, command, impact, and evidence policy execution.
- `bun src/cli.ts push --target . --no-commands`: passed with one
  informational `push_range` finding because this repository has no `HEAD` yet.
- `bun src/cli.ts push --target .`: passed with full adapter, command, impact,
  and evidence policy execution.
- JSON/SARIF audit hash canary: passed with equal manifest hashes, 52
  governance records before the fixture-pack wave; 53 governance records after
  the fixture-pack wave; 16 audit evidence records, 12 impact records, and no
  `durationMs` telemetry in SARIF evidence properties.
- Repeated JSON/SARIF audit hash canary: passed with manifest hash
  `a9722a49e133681d3659d005a3c64cb564988fd45901cdb158f3723489ec6355`, 53
  files, 53 governance records, 16 evidence records, and 12 impact records.
- `bun test tests/replay-fixtures.test.ts`: passed with a versioned Node
  workspace, committed baseline, local `origin/main`, before audit manifest,
  failing `.env` mutation, and no `push_range` fallback.
- Final WAVE_11 suite: `bun test` passed with 50 tests and 188 assertions;
  `bun src/cli.ts doctor --target .` passed over 59 files including
  `launcher_portability`; `bun run gate` and `bun src/cli.ts push --target .`
  passed over 59 governed files.
- Final WAVE_11 JSON/SARIF audit hash canary passed with manifest hash
  `43ca330d2f9fbfae4c86246685b85ec344e1f260d2cdcaeee81acf5403132f8e`, 59
  files, 59 governance records, 16 evidence records, and 10 impact records.
- `bun test tests/replay-fixtures.test.ts` after WAVE_12: passed with 8
  replay fixtures and 238 assertions.
- `bun test tests/governance.test.ts` after WAVE_14: passed with 8 tests and
  22 assertions, including specificity-based zone selection.
- `bun run gate` after WAVE_14: passed over 87 governed files with fixtures
  owned by `fixture_workspaces` instead of broad ecosystem source zones.
- Final WAVE_14 suite: `bun test` passed with 59 tests and 412 assertions;
  `bun src/cli.ts doctor --target .` passed over 87 files including
  `launcher_portability`, smoke, self-check, governance drift, and lock drift.
- Final WAVE_14 push/audit canary: `bun src/cli.ts push --target .` passed
  over 87 files with only the expected no-HEAD `push_range` info finding; the
  JSON/SARIF hash canary passed with equal manifest hashes, 87 files, 87
  governance records, 16 evidence records, 10 impact records, and no
  `durationMs` telemetry in SARIF evidence properties.
- `bun test tests/versioning.test.ts`: passed with 4 tests and 24 assertions,
  covering plan, bump, drift audit, and CLI JSON bump E2E.
- `bun test tests/versioning.test.ts tests/gate.test.ts`: passed with 16 tests
  and 72 assertions after the consumer/runtime version-boundary fix and
  `doctor` version drift regression.
- `bun test` after WAVE_15: passed with 64 tests and 439 assertions.
- `bun src/cli.ts version audit --target .`: passed with package, governance,
  lock, and runtime constant all on `0.1.0`.
- `bun src/cli.ts doctor --target .`: passed over 90 files with
  `version_sync=passed`.
- `bun run gate` after WAVE_15: passed over 90 files after rerunning the heavy
  certification gates sequentially.
- `bun src/cli.ts push --target .`: passed over 90 files with only the expected
  no-HEAD `push_range` info finding.
- Final WAVE_15 JSON/SARIF audit hash canary passed with equal manifest hashes,
  90 files, 90 governance records, 16 evidence records, 10 impact records, and
  no `durationMs` telemetry in SARIF evidence properties.
- `bun test tests/release.test.ts`: passed with 4 tests and 18 assertions,
  covering release plan, write, audit drift, and CLI JSON write against real
  Git history.
- `bun test tests/release.test.ts tests/versioning.test.ts tests/gate.test.ts`:
  passed with 21 tests and 92 assertions after release governance was added to
  the installer and `doctor` package-script contract.
- `bun test` after WAVE_16: passed with 69 tests and 459 assertions.
- `bun src/cli.ts release plan --target .`: intentionally failed on the root
  repository because no initial commit or tag exists; the product now reports
  the missing release baseline instead of guessing.
- `bun run gate` after WAVE_16: passed over 92 files with release governance
  included in source, tests, docs, and package scripts.
- `bun src/cli.ts push --target .` after WAVE_16: passed over 92 files with
  only the expected no-HEAD `push_range` info finding.
- Final WAVE_16 JSON/SARIF audit hash canary passed with equal manifest hashes,
  92 files, 92 governance records, 16 evidence records, 10 impact records, and
  no `durationMs` telemetry in SARIF evidence properties.
- `bun test tests/migration-canary.test.ts tests/gate.test.ts`: passed with 13
  tests and 69 assertions after vendored runtime, launcher execution, and
  workflow `update-tools` enforcement.
- `bun test tests/replay-fixtures.test.ts`: passed with 8 replay fixtures and
  238 assertions after giving integration replay tests a 20s per-test timeout.
- `bun test` after WAVE_17: passed with 70 tests and 480 assertions.
- `bun src/cli.ts doctor --target .` after WAVE_17: passed over 95 files with
  `vendored_runtime`, `launcher_execution`, workflow shim restoration,
  package scripts, hooks, tool cache, version sync, smoke, and self-check green.
- `bun run gate` after WAVE_17: first failed on locked Biome formatting, then
  passed over 95 files after reformatting with the vendored Biome shim and
  regenerating the vendored runtime.
- WAVE_18_BASELINE: committed the pre-RC foundation as `62d3fe3`
  (`chore: establish pre-rc foundation`), created the local tag
  `foundation/pre-rc-2026-05-11`, and pointed local `origin/main` at that
  baseline without configuring or pushing any remote.
- WAVE_18_PRODUCT_AUDIT: external product review found that the technical
  foundation was stronger than the public narrative. The fix moved README and
  docs from internal history to external product language, added an explicit
  trust model, and corrected competitive positioning against mature hook,
  linter, and CI tools.
- WAVE_18_GOVERNANCE_FIX: `CHANGELOG.md` became part of the docs governance
  zone so generated release artifacts are owned, linted, and auditable.
- WAVE_18_RETESTED: `bun test tests/gate.test.ts
  tests/migration-canary.test.ts tests/versioning.test.ts` passed with 17 tests
  and 93 assertions; `bun run typecheck`, `bun src/cli.ts doctor --target .`,
  targeted markdownlint, and `bun run gate` all passed over 96 files.

### Final Decision

```yaml
build_test_fail_fix:
  mode: persistent_e2e
  final_state: CERTIFIED
  target: gate-pre-git local GitHub governance runtime
  baseline: commit 62d3fe3 with local tag foundation/pre-rc-2026-05-11 and local origin/main range anchor
  hypothesis: local gate can sanitize, govern, validate, audit, and anchor GitHub-bound code before push or PR
  acceptance_criteria:
    - structured governance evidence exists in reports, manifest, and SARIF
    - real adapter execution blocks policy failures with locked local tools
    - evidence policy prevents governed files from passing without required proof
    - impact plan explains cheap local processing decisions by zone and provider
    - GitHub workflow validates audit artifacts instead of duplicating local CI
    - doctor detects governance, version, and tool lock weakening across vendored repos
    - release governance derives changelog entries from real Git intervals and audits generated artifacts
    - clean external repositories can run from only the vendored launcher and runtime
    - audit manifest identity excludes volatile timing telemetry
  first_failure_or_falsifiability:
    - governance missing from report manifest surface
    - adapter lock drift and planned-only adapters
    - JSON and SARIF manifest hash mismatch under repeated real audit commands
    - vendored launcher tied to a user-local absolute path
    - vendored launcher not actually self-contained in a clean client repository
    - generated GitHub workflow could audit before restoring ignored local cache shims
    - replay fixtures either unversioned, ungoverned, or discovered as product tests
  classification: product_bug plus oracle_gap plus governance_risk plus false_green plus certification_gap, all corrected in this campaign
  fix: structured governance, adapter runner, evidence policy, impact planner, audit anchor, drift checks, stable manifest projection, specificity-based governance zone selection, version governance runtime, release governance runtime, vendored runtime bundle, workflow shim restoration, clean external migration canary
  exact_retest: bun test; bun run gate; JSON/SARIF audit hash canary
  related_gates: typecheck, doctor, push smoke, markdownlint, Biome, actionlint, Gitleaks
  canary_integrity: local commits/tags/refs were used only for repository proof; no remote was configured or pushed, and no secrets or global config were mutated
  portable_promotions:
    - semantic audit projection must exclude runtime telemetry
    - vendored governance must be drift-checked against strict defaults
    - remote audit should validate local evidence artifacts, not repeat expensive processing
    - pre-push must satisfy semantic `gate` evidence while retaining push-specific traceability
    - auto profile detection must be proved against multiple repository families, not inferred from the gate repo
    - replay fixtures must be versioned outside default test discovery, materialized into committed temporary repos, and replayed through a normal base ref
    - Node/Nuxt profiles should respect `package.json#scripts.test` when present instead of forcing raw `bun test`
    - release criteria must exist as versioned SLO/noise and migration artifacts before public RC claims
    - governance zone selection must prefer the most specific matching path rule so broad ecosystem globs do not steal fixture or template ownership
    - version governance must separate project package versions from vendored gate metadata versions in consumer repositories
    - certification commands that invoke the full replay suite should run
      sequentially; parallel gate and push certification can create noisy nested
      `bun test` contention and should not be treated as product failure
    - release governance should derive changelog from actual Git intervals, not
      from hand-written release prose
    - release planning must fail closed when a repository has no commit/tag
      baseline instead of manufacturing a release interval
    - migration proof must execute the installed launcher inside a clean target
      repository and should not use internal product APIs after install
    - GitHub audit workflows must restore ignored local shims from lockfile
      before running audit in a clean clone
  deferred_learning:
    - `agent:mokh-resume` remains absent from this repository
    - public branch protection still needs validation on the real GitHub repository
    - Go and Rust replay fixtures run structural lanes locally because Go and
      Cargo are not available in this environment
    - migration guide is exercised by a clean external target canary, but public
      release wording still needs release artifacts, license, support policy,
      and pinned external canaries
  limits:
    - no remote push was performed during this convergence campaign
    - local pre-RC is certified, but public RC remains blocked until release artifact audit and public distribution governance are closed
  next_loop: generate release artifacts from the post-baseline Git interval, commit them with an excluded release commit, rerun release audit, then repeat full RC evidence
```
