# Certified Installation Runtime

Status: target product design.

Date: 2026-05-11.

## Senior Verdict

The installer should become a certifier, not a copier.

The useful lesson from Tilly Engineer Skills is not its context mesh, MCP,
agent adapters, or multi-IDE surface. Those belong to TES. The reusable product
pattern is the assisted installation shape:

```text
inspect -> classify -> plan -> backup -> apply -> certify -> report rollback
```

For `gate-pre-git`, that pattern must stay boring and Git-native. The product
installs a local Git governance boundary, not an agent memory layer.

## Product Fit

`gate-pre-git` already has the right certification primitives:

1. `init` materializes the vendored runtime, launcher, hooks, workflow, config,
   governance map, lockfile, package scripts, and tool shims.
2. `doctor` proves the installed runtime, launcher, hooks, workflow, tools,
   smoke behavior, governance drift, lock drift, and version sync.
3. `check`, `staged`, `push`, and `audit` prove the governed repository state.
4. Replay fixtures and the migration canary prove clean external adoption.

The missing product layer is the installer transaction around those primitives.
Today, `init --yes` applies files directly. The next installer should make the
same writes through an explicit certification envelope.

## Installation States

The installer should classify the target before writes:

| State | Meaning | Default behavior |
| --- | --- | --- |
| `new` | Git repository without `.gate-pre-git/**`. | Plan a first vendored install. |
| `existing` | Project has source, docs, hooks, workflows, or package scripts, but no gate runtime. | Plan adoption with conflict detection and backup. |
| `gated` | `.gate-pre-git/**` exists and `doctor` passes. | Report current, or plan profile/tool updates only. |
| `drifted` | Gate runtime exists but `doctor` fails. | Plan repair with before/after certification. |
| `blocked` | Target is not a usable Git repository or has unsafe conflicts. | Stop before writes with precise blockers. |

Do not use `meshed` for this product. That word belongs to context systems.
The gate state is about repository governance coverage.

## Certified Flow

### 1. Step Zero

Before installation writes:

```sh
git status --short --branch --untracked-files=all
git rev-parse HEAD
```

If dirty, report the risk and offer a local baseline commit route before
installing. Do not create the commit automatically in non-interactive mode.

### 2. Preflight

Read the target shape:

1. Git repository status and `HEAD`.
2. Existing `.gate-pre-git/**` runtime.
3. Existing `pre-commit` and `pre-push` hooks.
4. Existing package scripts that would be patched.
5. Existing GitHub workflow path.
6. Detected profile and command checks.
7. Existing governance map and lockfile drift.

Preflight is read-only.

### 3. Plan

Emit a plan with three classes of writes:

| Class | Examples | Rule |
| --- | --- | --- |
| `gate-owned` | `.gate-pre-git/**`, generated audit workflow. | May overwrite only after backup. |
| `merge-owned` | `package.json` scripts, existing hooks. | Preserve local intent or stop with conflict. |
| `project-owned` | Existing configs such as `biome.json`. | Create only when absent unless `--force`, except for narrow compatibility merges such as missing `json.formatter.expand=auto`. |

The plan should include exact files, action, reason, and rollback source.

### 4. Backup

Before any overwrite, create:

```text
.gate-pre-git/bk/<timestamp>/manifest.json
```

The manifest should record:

1. baseline `HEAD`;
2. Git status before writes;
3. installer version;
4. detected state and profile;
5. every backed-up file with SHA-256;
6. every planned write and owner class.

This backup is local state. It should be ignored unless the user intentionally
archives it.

### 5. Apply

Apply the current `initProject` outputs through the plan:

1. write `.gate-pre-git/config.json`;
2. write `.gate-pre-git/governance.json`;
3. write `.gate-pre-git/lock.json` and tool shims;
4. write `.gate-pre-git/bin/gate-pre-git`;
5. write `.gate-pre-git/runtime/cli.js`;
6. install or wrap hooks;
7. write `.github/workflows/gate-pre-git-audit.yml`;
8. patch package scripts only when safe.

Existing hooks should not be blindly overwritten. If they contain local logic,
the installer should either wrap them with a managed gate call or stop with a
conflict plan.

### 6. Certify

A successful certified install must run:

```sh
gate-pre-git doctor --target .
gate-pre-git check --target . --all --no-commands
```

Full certification may additionally run:

```sh
gate-pre-git check --target . --all
gate-pre-git staged --target .
gate-pre-git audit --target . --format json
```

`--no-commands` should be the default first-install certification because it
proves installation integrity without unexpectedly running project builds.

### 7. Report

The report should be compact:

1. state before and after;
2. profile and detected tools;
3. backup id;
4. writes applied;
5. certification commands and status;
6. blockers, if any;
7. Git rollback commands.

## CLI Shape

Keep `init` as the low-level materializer for compatibility.

Add a higher-level command:

```sh
gate-pre-git install --target . --profile auto
gate-pre-git install --target . --profile auto --yes
gate-pre-git install --target . --profile auto --certify full --yes
gate-pre-git install --target . --repair --yes
```

Suggested output shape:

```text
gate_pre_git_install=planned
state=existing
profile=auto
backup=not_created
writes=10
conflicts=0
rerun_with=--yes
```

After `--yes`:

```text
gate_pre_git_install=certified
state_before=existing
state_after=gated
backup=.gate-pre-git/bk/20260511T000000Z/manifest.json
doctor=passed
check_structural=passed
rollback=see_report
```

## Explicit Non-Goals

1. Do not install TES, Cortex, MCP, agent skills, or `docs/agents/**`.
2. Do not copy multi-IDE context routing.
3. Do not make installation depend on an LLM.
4. Do not install dependencies during adoption.
5. Do not silently overwrite existing hooks, package scripts, workflows, or
   project formatter configs; narrow compatibility merges must be named in the
   install report.
6. Do not call a repo covered until `doctor` and the structural gate pass.

## Implementation Wave

The right next wave is small:

1. Add an installer plan model and tests for `new`, `existing`, `gated`,
   `drifted`, and hook-conflict targets.
2. Add `.gate-pre-git/bk/<timestamp>/manifest.json` backup before overwrite.
3. Add `gate-pre-git install` as the certified wrapper around `initProject`.
4. Teach `doctor` to surface the latest install certification when present.
5. Update the migration guide to prefer `install` over direct `init`.
6. Add a replay fixture that installs into a repo with an existing hook and
   proves no blind overwrite happens.

## Product Principle

TES proves that a complex installer can be a certification protocol.

`gate-pre-git` should make that protocol boring enough for teams to adopt:

```text
one command, clear backup, no blind overwrite, local proof, easy rollback
```
