# gate-pre-git

Local repository governance runtime for GitHub-bound repositories.

The goal is not to make GitHub Actions do more work. The goal is to make the
local Git boundary honest, deterministic, sanitized, and cheap before GitHub
receives the change.

## What Was Missing In The Tilly Gate

The Tilly gate is strong, but too project-shaped to drop into other repos as-is.
The reusable product needs:

1. A small CLI with no Tilly-specific assumptions.
2. A config file per project.
3. Real staged-file checks before commit.
4. JSON and YAML syntax checks.
5. Modern text coverage for `md`, `json`, `yaml`, `txt`, `ts`, `tsx`, `vue`,
   `js`, `jsx`, `css`, and `html`.
6. Non-blocking advice signals for risk classification.
7. Hook installation that does not self-stage or auto-fix.
8. Machine-readable output for CI and agents.
9. Adversarial fixtures that prove the gate fails when it should.
10. A vendored `.gate-pre-git/` template with explicit tool locking.
11. Minimal GitHub audit instead of expensive remote processing.

## Hard Install Recipe

Do not hand-copy snippets into projects. Run the initializer, then run the
doctor. If the doctor fails, the gate is not installed.

From any target Git repository:

```sh
gate-pre-git init --target . --profile auto --yes
gate-pre-git doctor --target .
gate-pre-git check --target . --all
```

For a Nuxt project:

```sh
gate-pre-git init --target . --profile nuxt --yes
gate-pre-git doctor --target .
```

For documentation-heavy repositories:

```sh
gate-pre-git init --target . --profile docs --yes
gate-pre-git doctor --target .
```

`--profile auto` detects Nuxt, Node, Python, Go, Rust, docs, shell scripts,
security, and GitHub Actions surfaces before writing `.gate-pre-git/config.json`.

Default installation writes:

- `.gate-pre-git/config.json`
- `.gate-pre-git/governance.json`
- `.gate-pre-git/lock.json`
- `.gate-pre-git/bin/gate-pre-git`
- `.gate-pre-git/runtime/cli.js`
- `.gate-pre-git/cache/.gitignore`
- `biome.json` when Biome is enabled and no project Biome config exists
- a portable `.gate-pre-git/bin/gate-pre-git` launcher that resolves the repo
  root before choosing a vendored runtime, source checkout, or PATH runtime
- native Git hooks at the repository's actual `hooks/pre-commit` and
  `hooks/pre-push` paths
- `.github/workflows/gate-pre-git-audit.yml`
- package scripts when `package.json` exists:
  - `gate`
  - `gate:staged`
  - `gate:doctor`
  - `gate:push`
  - `gate:audit`
  - `gate:version-audit`
  - `gate:release-plan`

The native Git hook is default because it is the hardest path to forget. Husky
is supported with `--hook husky`, but it is not required.

The product test suite includes versioned replay workspaces under
`fixtures/workspaces/**`. These fixtures are materialized into temporary
Git repositories with committed baselines and local `origin/main` refs, then
mutated and replayed through the push gate. That keeps portability proof tied to
Git behavior instead of inline temporary files.

The migration canary creates a clean external repository, installs the gate,
then uses only the installed launcher to run `doctor`, `check`, `staged`,
`push`, and `audit`. It also attempts a real bad commit and expects the native
pre-commit hook to block it.

## Pass/Fail Contract

An installation is trusted only when this passes:

```sh
gate-pre-git doctor
```

`doctor` fails when:

- `.gate-pre-git/config.json` is missing
- `.gate-pre-git/governance.json` is missing from a vendored install
- `.gate-pre-git/lock.json` is missing
- `.gate-pre-git/bin/gate-pre-git` is missing
- `.gate-pre-git/runtime/cli.js` is missing or the launcher cannot execute it
- no pre-commit hook calls `gate-pre-git staged`
- no pre-push hook calls `gate-pre-git push`
- `package.json` exists but lacks the expected `gate` scripts
- the local tool shims are missing
- the GitHub audit workflow is missing
- the staged snapshot smoke test does not fail on bad index content
- the self-check fails on objective repository risks

The staged hook reads the real Git index, not the working tree. Trusted built-in
fixers may rewrite and auto-stage sanitized output. Partial staging or unstaged
drift blocks the fix rather than staging unrelated work.

## Commands

```sh
bun install
bun run gate
```

Run against changed files:

```sh
bun src/cli.ts check
```

Run against all files:

```sh
bun src/cli.ts check --all
```

Run at the commit boundary:

```sh
bun src/cli.ts staged
```

Apply trusted local fixes:

```sh
bun src/cli.ts fix --all
```

Run local pre-push checks:

```sh
bun src/cli.ts push --base origin/main
```

Emit the GitHub audit report:

```sh
bun src/cli.ts audit --all --format json
bun src/cli.ts audit --all --format sarif
```

Plan, apply, or audit a governed version bump:

```sh
bun src/cli.ts version plan --target .
bun src/cli.ts version bump patch --target .
bun src/cli.ts version audit --target .
```

Plan, write, or audit release artifacts from Git history:

```sh
bun src/cli.ts release plan --target .
bun src/cli.ts release write --target .
bun src/cli.ts release audit --target .
```

Initialize a target repository:

```sh
bun src/cli.ts init --target /path/to/repo --profile auto --yes
```

Run the installation doctor:

```sh
bun src/cli.ts doctor --target /path/to/repo
```

Print or install a hook:

```sh
bun src/cli.ts install-hook
bun src/cli.ts install-hook --target /path/to/repo --yes
```

Refresh the explicit tool lock and shims:

```sh
bun src/cli.ts update-tools --target /path/to/repo
```

## Built-In Checks

- blocks local junk such as `.DS_Store`
- blocks obvious secret paths such as `.env`, `.pem`, `.key`, `.p12`, `.pfx`
- blocks configured markers such as `[STAGE_BLOCK:OPEN]`
- blocks merge conflict markers
- parses `.json`
- parses `.yml` and `.yaml`
- checks Markdown heading depth and unbalanced code fences
- runs `git diff --check` and `git diff --cached --check` inside Git repos
- applies built-in text and JSON fixes in `staged` and `fix`
- auto-stages trusted fixer output after revalidation
- blocks partial-staged fixer drift
- runs configured project commands
- emits JSON/SARIF audit output

## Config

Prefer `init`. Manual config is allowed only when a project needs a custom
profile. The active config lives at `.gate-pre-git/config.json`; the legacy
`gate-pre-git.config.json` path is still read as a fallback.

Example:

```json
{
  "commandChecks": [
    {
      "name": "typecheck",
      "run": "bun run typecheck",
      "modes": ["check"]
    },
    {
      "name": "test",
      "run": "bun test",
      "modes": ["check"]
    }
  ]
}
```

## Opinionated Boundary

This tool should block objective risks and leave style wars to project config.
Markdown governance, TDS indexes, release certification, Nuxt builds, and
contract drift checks belong as configured commands or profiles, not as mandatory
core behavior for every repo.

GitHub should not be the expensive quality processor. GitHub should run the
small audit workflow and branch protection check that confirms the local
contract was followed.

## Governance Map

The Governance Map is now part of the runtime contract: a local, versioned
policy that classifies files by zone, owner, risk, exception, generated state,
and required evidence before commands run. Reports, audit manifests, and SARIF
carry governance, evidence, and impact data so local checks and GitHub audit
share the same semantic proof. See [docs/governance-runtime.md](docs/governance-runtime.md)
for the default zones, evidence policy, GitHub audit role, and acceptance
examples.

## Minimum Efficient Rollout

Use this order for every repo:

1. `git status --short --branch`
2. `gate-pre-git init --profile auto --yes`
3. `gate-pre-git doctor`
4. `gate-pre-git check --all`
5. try a harmless staged file and run `gate-pre-git staged`
6. run `gate-pre-git push --base origin/main`
7. commit/push only after the hook blocks and passes exactly as expected

No repo is considered covered until `doctor`, `check --all`, `staged`, `push`,
and `audit --format json` are green.
