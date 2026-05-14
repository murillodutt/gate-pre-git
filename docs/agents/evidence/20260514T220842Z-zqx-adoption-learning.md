---
tes_doc: evidence
status: active
owner: project
updated: 2026-05-14
confidence: high
evidence:
  - path: docs/agents/PROJECT-CONTEXT.md
  - path: docs/governance-runtime.md
  - path: docs/product-roadmap.md
  - path: src/adapters.ts
  - path: src/adapter-runner.ts
  - path: src/installer.ts
  - path: src/push.ts
tags:
  - tes
  - evidence
  - adoption-learning
  - gate-pre-git
related:
  - "[[zqx-adoption-learning]]"
  - "[[gate-pre-git-project-boundary]]"
---

# zqx Adoption Learning

Timestamp: `2026-05-14T22:08:42Z`

Target project: `/Users/murillo/Dev/zqx`

Source project: `/Users/murillo/Dev/gate-pre-git`

Status: `RECORDED`

## Summary

Installing `gate-pre-git` into `zqx` proved the runtime can certify a real,
TES-meshed Nuxt repository, but also showed that the first adoption path is too
close to a full certification path. The product should keep strict governance,
while making the entry route assisted, scoped, reversible, and project-aware.

The senior verdict is:

```text
gate-pre-git is correct as a certifier.
gate-pre-git needs a simpler assisted adoption entrypoint.
```

## Field Evidence

| Observation | Evidence |
|-------------|----------|
| Target class | `zqx` was an existing repository with TES mesh already installed and no prior `.gate-pre-git/**`. |
| Baseline | `zqx` started clean at `5a8e928c6e00cd2bfc6a55ff95409fdabaa9a99a`. |
| Backup | Local backup existed before root/runtime overwrite at `.gate-pre-git/bk/20260514T215048Z/manifest.json`. |
| Install route | Source runtime was installed with `bun --no-install src/cli.ts init --target /Users/murillo/Dev/zqx --profile auto --yes --force --command .gate-pre-git/bin/gate-pre-git`. |
| Structural certification | `.gate-pre-git/bin/gate-pre-git doctor --target .` passed in `zqx`. |
| Changed-scope certification | `.gate-pre-git/bin/gate-pre-git check --target .` passed in `zqx`. |
| Push certification | `.gate-pre-git/bin/gate-pre-git push --target . --base private/main` passed in `zqx`. |
| Package script certification | `bun run --silent gate:push` passed in `zqx`. |
| Local project proof | `typecheck`, `test`, and `build` passed through the installed gate; the test suite reported `374 passed`, `2 skipped`. |
| No remote mutation | No push, tag, amend, publish, dependency install, or remote change was performed. |

## Learned Product Requirements

| Requirement | Learning | Candidate Oracle |
|-------------|----------|------------------|
| Assisted adoption mode | First install should run Step Zero, classify the target, create a manifest-backed backup, apply the runtime, and finish with a certification report. | Fixture installs into clean, dirty, existing, and meshed repos; no root overwrite before backup manifest exists. |
| Certifier mode remains strict | `check --all` is useful as a full audit/certification gate, but too expensive and noisy as the first install success criterion. | Install acceptance uses `doctor`, changed-scope `check`, `staged`, and upstream-aware `push`; `check --all` is reported as optional audit debt. |
| Profile detection must ignore runtime mesh | `zqx` was auto-detected as Python because TES helper files lived under `.tes/bin/**`; the product app was Nuxt. | Detection fixture with Nuxt app plus TES Python helpers still selects Nuxt/docs/security, not Python. |
| Governance bootstrap must be project-aware | Real repos contain agent runtime context, GitHub metadata, docs assets, database artifacts, connector contracts, shared contract docs, labs repros, and container runtime files. | `doctor` can propose missing zones or install a migration scaffold without requiring broad manual JSON edits. |
| Environment templates are not live secret files | `.env.example` should not be blocked by path alone, but its contents should still be scanned. | `.env` fails by default; `.env.example` is allowed when tracked and content-clean. |
| Known JSONC files should parse as JSONC | `tsconfig.json` commonly contains comments. Making a target repo remove a valid TypeScript comment is a bad adoption cost. | `tsconfig.json` with comments passes syntax checks through JSONC parsing. |
| YAML prompt fields need block-scalar resilience | Agent prompt YAML failed until long prompt text was converted to a block scalar. | Fixture with multiline agent prompt passes YAML syntax. |
| Adapters must respect the changed file set | `gitleaks dir .` turned a changed-scope gate into a whole-repo scan, timed out at 30s, and surfaced unrelated local/generated debt. | Gitleaks check runs on governed changed files by `stdin` or a deterministic diff, satisfies evidence policy, and finishes under the adapter timeout. |
| Adapter output must be bounded | `markdownlint-cli2` hit `ENOBUFS` in a repo-wide run; Biome also hit diagnostic limits. | Adapter runner uses bounded output, larger explicit `maxBuffer`, and tool-specific diagnostic caps. |
| Full security audit must be distinct from pre-git scan | Whole-repo Gitleaks found secret-shaped material in local `.env`, generated Nuxt output, docs smoke evidence, manual specs, and tests. That is valuable audit information but should not block an unrelated first install unless the changed files introduce it. | Separate `audit --all` or security mode reports historical/generated findings without pretending they belong to the current diff. |
| Existing hooks must be composed | `zqx` already used pre-push to drain TES Field Reports. The installer overwrote first, then the hook had to be hand-composed. | Installer preserves existing hook commands in a pre/post section and tests execution order. |
| Push base must use the branch upstream | `zqx` tracks `private/main`; the default `origin/main` would have expanded push scope to 118 commits and 493 files. | `push` default resolves `@{u}` first and falls back to `origin/main`; hooks and package scripts use the same rule. |
| CLI help should accept standard flags | `gate-pre-git --help` failed while `gate-pre-git help` worked. | `--help` and `-h` route to the same help output. |
| Package patching should be minimal | Installing gate scripts reordered `package.json` scripts, producing noisy diffs. | Installer preserves existing script order and appends `gate:*` commands in a stable block. |
| Runtime patching must return to source | A local vendored runtime patch made `zqx` pass by scanning Gitleaks through `stdin`; that behavior must be implemented in source and covered by tests before the next bundle. | Source tests cover Gitleaks file-scoped execution and evidence satisfaction. |

## Selected Maturation Backlog

| Priority | Cut | Scope | Proof |
|----------|-----|-------|-------|
| P0 | File-scoped secret adapter | Implement source-level Gitleaks changed-file scanning, not ad hoc vendored runtime patching. | `bun test tests/adapters.test.ts tests/adapter-runner.test.ts tests/evidence.test.ts`; replay fixture with unrelated repo secret passes changed clean file. |
| P0 | Upstream-aware push default | Resolve `@{u}` before `origin/main` in `src/push.ts`, generated hooks, and package scripts. | Fixture with `private/main` upstream reports zero push files when HEAD equals upstream. |
| P0 | Hook composition | Preserve existing pre-push/pre-commit bodies with deterministic gate ordering. | Fixture with existing hook proves both gate and prior hook run. |
| P0 | Adoption classifier | Add explicit target states: `new`, `existing`, `meshed`, `dirty`, and `already-installed`. | Installer dry-run emits state and planned writes for each fixture. |
| P1 | Product-aware profile detection | Exclude `.tes/**`, `.agents/**`, `.claude/**`, `.cursor/**`, and other runtime helper surfaces from language/profile detection unless they are the product. | Nuxt plus TES helper fixture selects Nuxt/docs/security. |
| P1 | JSONC syntax support | Parse known JSONC config files as JSONC while keeping strict JSON for package manifests and lockfiles. | `tsconfig.json` comment fixture passes; invalid `package.json` still fails. |
| P1 | Governance adoption assistant | Convert unowned-file failure into suggested zones during install/doctor, while keeping strict gate behavior after adoption. | Doctor report lists proposed zone patches with risk/evidence without auto-waiving. |
| P1 | Adapter output limits | Add explicit `maxBuffer`, output truncation, and tool diagnostic caps. | Large markdown/Biome fixture fails with stable bounded finding, not `ENOBUFS`. |
| P1 | Standard help flags | Support `--help` and `-h`. | CLI tests assert all help forms pass. |
| P2 | Minimal package patcher | Preserve `package.json` script order and append only gate scripts. | Snapshot test with existing scripts produces minimal diff. |
| P2 | Audit/install documentation | Document the difference between adoption checks, push checks, and `check --all` certification. | Docs link from roadmap and migration guide; install report names optional repo-wide debt. |

## Rejected Or Deferred

| Candidate | Decision | Reason |
|-----------|----------|--------|
| Require `check --all` to install into every existing repo | Reject | It turns adoption into historical cleanup and hides the faster trust path. |
| Ask consuming repos to rewrite valid JSONC configs | Reject | The gate should understand common config formats. |
| Waive all historical Gitleaks findings | Reject | Historical findings are real audit information; they belong in a separate full-audit lane. |
| Disable secret scanning for runtime installs | Reject | Vendored runtime and agent context still need content scanning. |
| Keep local vendored runtime patch only in `zqx` | Defer as temporary | The behavior must move into source before release or the next install will regress. |

## 4D Transfer

| Axis | Discovery | Selection | Redistribution |
|------|-----------|-----------|----------------|
| `pipeline_improvement` | Adoption needs a smaller first gate than certification. | `apply_now` as documented backlog. | Installer, docs, replay fixtures. |
| `risk_redistribution` | Whole-repo secret scans mix current diff risk with historical/generated debt. | `apply_now` for adapter scope design. | Adapter runner, audit docs, security fixtures. |
| `reusable_pattern` | Existing hook composition is a general install requirement. | `apply_now` for installer fixture. | Installer and hook templates. |
| `product_opportunity` | Assisted install can be a first-class product route. | `apply_now` for roadmap maturity. | Certified installation runtime and migration guide. |
| `obsolete_piece` | `origin/main` as universal push base is stale. | `apply_now` for upstream-aware default. | Push resolver and generated hooks. |

## Non-Claims

- This evidence does not certify a source-code fix in `gate-pre-git`.
- This evidence does not certify a public release.
- This evidence does not approve pushing or publishing `zqx`.
- This evidence does not waive secret-shaped findings observed in full-repo
  scans; it only separates changed-scope pre-git checks from full audit work.
