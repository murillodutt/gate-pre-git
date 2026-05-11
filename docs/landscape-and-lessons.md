# Landscape And Lessons

Status: market and prior-art analysis for product direction.

Date verified: 2026-05-11.

## Summary

There are many strong projects near this space, but they solve different slices
of the problem.

`gate-pre-git` should learn from them without copying their category. The
product opportunity is to unify local Git truth, transactional autofix,
vendored tool locking, executable governance, and cheap GitHub audit.

## Prior Art Map

| Project | Strong Lesson | Boundary |
| --- | --- | --- |
| [pre-commit](https://pre-commit.com/) | Polyglot hook ecosystem, isolated tooling, stage-aware hooks. | Not a repository governance runtime or GitHub audit model. |
| [Trunk Check](https://docs.trunk.io/code-quality/overview/getting-started/caching) | Hermetic tools, local cache, consistent lint and format workflow. | Primarily a tool runner and developer workflow platform. |
| [Lefthook](https://lefthook.dev/) | Fast hook orchestration and simple local DX. | Delegates policy semantics to user commands. |
| [lint-staged](https://github.com/lint-staged/lint-staged) | Sharp staged-file workflow for JavaScript projects. | Narrow ecosystem and limited governance model. |
| [Husky](https://typicode.github.io/husky/get-started.html) | Lightweight Git hook installation for Node projects. | Hook plumbing, not policy or audit. |
| [MegaLinter](https://megalinter.io/) | Broad linter catalog and multi-language coverage. | Heavy CI/container orientation. |
| [Super-Linter](https://github.com/super-linter/super-linter) | Simple GitHub-oriented linter coverage. | Remote-first and less Git-index aware. |
| [Nx affected](https://nx.dev/ci/features/affected) | Changed-impact calculation through graph knowledge. | Strong inside its ecosystem, not universal governance. |
| [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) | Ownership can be encoded directly in the repository. | Review routing is not local validation or evidence execution. |
| [OpenSSF Scorecard](https://scorecard.dev/) | Repository security posture as auditable checks. | Repository posture, not local commit/push sanitation. |
| [OpenSSF Allstar](https://github.com/ossf/allstar) | Organization policy enforcement for GitHub repos. | GitHub/org control plane, not local boundary runtime. |
| [Semgrep](https://semgrep.dev/docs/) | Local and CI code scanning can produce actionable findings and SARIF. | Scanner, not a full Git boundary governance layer. |
| [Conftest](https://www.conftest.dev/) | Policy-as-code can validate structured config and infrastructure. | Policy engine, not repository-wide Git workflow runtime. |
| [reviewdog](https://github.com/reviewdog/reviewdog) | Converts tool output into code review feedback. | PR feedback surface, not local pre-push enforcement. |
| [Danger JS](https://danger.systems/js/) | Pull request rules can be automated with project code. | PR-stage automation, not local-first sanitation. |
| [pre-commit.ci](https://pre-commit.ci/) | Shows the value of automated fixes in PR workflows. | Remote PR mutation is the main autofix loop. |
| [autofix.ci](https://autofix.ci/) | Validates formatter and linter autofix as a product surface. | Fixes happen after the code has already reached GitHub. |

## What To Borrow

### From Pre-Commit

Borrow the idea that polyglot tools need explicit installation, isolated
execution, and stage-specific behavior.

Do not inherit a model where governance is mostly an emergent property of hook
configuration.

### From Trunk

Borrow hermetic tool management, lock discipline, and a fast local cache.

Do not reduce the product to a catalog of linters. The runtime must know what a
file means inside the repository.

### From Lint-Staged

Borrow the staged-file focus and developer ergonomics.

Go further by reading the real index, detecting partial staging, and proving the
post-fix staged snapshot.

### From Nx And Graph-Based Systems

Borrow the idea that not every change should run every expensive task.

Adapt it through governance zones and evidence requirements before building a
full project graph.

### From OpenSSF

Borrow the posture mindset: policy should be explicit, repeatable, and
auditable.

Bring that posture earlier into the developer loop instead of discovering it
only at repository or organization level.

### From CODEOWNERS And PR Automation

Borrow the principle that ownership must live near the code.

Move ownership from review routing into local classification, so a risky path is
known before the PR exists.

### From Policy Engines And Scanners

Borrow dedicated engines when they are stronger than custom logic.

Semgrep, Conftest, Gitleaks, actionlint, ShellCheck, and language-native tools
should be adapters. The differentiator is not reimplementing them; it is
deciding when they must run, how their result satisfies evidence, and how their
output becomes part of the GitHub audit contract.

### From Autofix Products

Borrow confidence that automatic correction is valuable.

Move the primary autofix loop local, transactional, and visible before push.

## What To Avoid

1. Becoming a wrapper around arbitrary scripts with a strong brand.
2. Treating Git hooks as security boundaries.
3. Treating GitHub Actions minutes as the default compute budget.
4. Allowing tool versions to drift through implicit latest installs.
5. Fixing files without recording what changed and why.
6. Passing a repository that has unowned files.
7. Reporting governance as prose when machines need structured evidence.

## Category Gap

The gap is not "run more checks before commit."

The gap is:

1. Read the exact Git surface.
2. Classify every changed file by policy.
3. Apply only trusted fixes transactionally.
4. Revalidate the final snapshot.
5. Emit a stable audit manifest.
6. Let GitHub verify the contract cheaply.

That combined surface is the product.

## Positioning Statement

For teams that want GitHub to stop being the expensive first line of quality
processing, `gate-pre-git` is a vendored local governance runtime that
sanitizes, fixes, validates, classifies, and audits the Git boundary before push
or PR.

Unlike hook managers or CI linters, it treats repository governance as runtime
data: zones, owners, risk, evidence, tool versions, fixes, and manifest hashes.

## Learning Backlog

These lessons should feed future implementation waves:

1. Make governance evidence structured, not hidden inside text details.
2. Execute real adapters with timeout, cache, and failure classification.
3. Add an impact planner so docs-only and source changes have different costs.
4. Preserve developer trust by making every auto-stage traceable.
5. Keep the default policy small, strict, and explainable.
6. Make fleet governance possible without making single-repo adoption heavy.
