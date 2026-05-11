# Governance Map Runtime

`gate-pre-git` is becoming a local governance boundary, not only a command
runner. Command runners answer "did these commands exit 0?" A Governance Map
also answers "was this change allowed in this part of the repo, with the right
owner, risk class, exception, and evidence?"

## Why Commands Miss Governance

Plain command checks are useful but incomplete:

- a formatter can pass while generated output is hand-edited
- tests can pass while a sensitive path enters the diff
- docs can be valid Markdown but lack required release evidence
- a repo can have green CI while ownership and exception rules are invisible
- GitHub can audit a result but should not discover basic local policy late

The runtime goal is to classify the change before expensive work runs. Commands
remain important evidence, but they are not the whole policy surface.

## Map Concepts

A Governance Map is a versioned local contract consumed by the gate.

- **zone**: a named repo area selected by path rules.
- **owner**: the person, team, or process accountable for that zone.
- **risk**: the default risk level for changes in the zone.
- **evidence**: required proof before a change may pass.
- **exception**: a scoped waiver with reason and expiry.
- **generated**: files that must be produced by tools, not hand-edited.
- **sensitive**: files that need stricter blocking or review evidence.

The map should be boring to read and hard to bypass. If the map exists but no
runtime check consumes it, the product is still only documented intent.

When more than one zone matches a file, the runtime selects the most specific
matching path rule. This prevents broad ecosystem rules like `**/*.go` or
`**/*.py` from stealing ownership from narrower product surfaces such as
`fixtures/**`.

## Default Zones

The default product map should be small enough for any repository to adopt:

| Zone | Paths | Default Risk | Runtime Policy |
| --- | --- | --- | --- |
| `source_js` | JS, TS, Vue under `src/**`, `app/**`, `lib/**`, `server/**` | high | Biome, Gitleaks, typecheck, tests, gate evidence |
| `source_python` | `**/*.py`, `**/*.pyi` | high | Ruff, Gitleaks, gate evidence |
| `source_go` | `**/*.go` | high | `go test`, Gitleaks, gate evidence |
| `source_rust` | `**/*.rs` | high | `cargo check`, Gitleaks, gate evidence |
| `tests_*` | ecosystem-specific test paths | medium | matching ecosystem evidence |
| `docs` | `README.md`, `docs/**`, `*.md` | low | Markdown structure and required evidence links |
| `github_workflow` | `.github/workflows/**` | high | YAML syntax and actionlint |
| `package_tooling` | package manifests, lockfiles, root configs | high | text hygiene and gate evidence |
| `shell_scripts` | shell automation scripts | medium | text hygiene and shellcheck |
| `fixture_workspaces` | `fixtures/**` | medium | text hygiene and replay provenance |
| `secrets` | `.env*`, `*.pem`, `*.key`, `*.p12`, `*.pfx` | critical | block by default |
| `generated` | lockfiles, build outputs, generated clients | medium | provenance or regeneration evidence |

Projects can add zones, but the core install should not require a large policy
language before it provides value.

## Evidence Policy

Evidence is a local proof attached to a zone rule. It can be a built-in check, a
configured command, a manifest field, or a documented human approval when the
repo chooses to allow that.

Acceptance examples:

- A `docs/**` change passes with Markdown structure checks and a linked evidence
  note when the zone requires release evidence.
- A `src/**` change passes only after the configured project command succeeds.
- A `.github/workflows/**` change fails without the configured owner or audit
  evidence.
- A generated file fails when changed without matching provenance evidence.
- An exception fails after its expiry date even if the underlying command passes.

Evidence must be deterministic where possible. Human approvals should be narrow,
named, dated, and visible in audit output.

## GitHub Audit Role

GitHub is the verifier of the local contract, not the first place governance is
discovered. The audit workflow should stay cheap:

- run `gate-pre-git audit --all`
- emit JSON or SARIF with the manifest hash
- expose zones, findings, evidence, and expired exceptions
- let branch protection require the audit result

The heavy work belongs near the developer at the Git boundary. GitHub confirms
that the same contract was present and that the report is machine-readable.

## Runtime Status

The first executable Governance Map wave is certified:

1. `init` vendors `.gate-pre-git/governance.json`.
2. `init --profile auto` detects Nuxt, Node, Python, Go, Rust, docs, security,
   shell scripts, and GitHub Actions surfaces.
3. `doctor` requires the map for vendored installs and detects weakening drift.
4. The gate classifies files by zone, owner, risk, exception, generated state,
   and sensitive state.
5. Unowned, sensitive, generated, and expired-exception risks produce objective
   failures.
6. Text, JSON, SARIF, and audit manifests expose governance, evidence, and
   impact data.
7. Project commands remain evidence providers instead of being replaced by a
   monolithic core.
8. Versioned replay fixture workspaces are governed as product evidence instead
   of unowned test data.
9. Zone selection is specificity-based, so fixture and template surfaces can
   carry their own evidence policy even when they contain real ecosystem code.

## Next Global Product Path

The next wave should move from local replay proof to release proof:

1. Repeat SLO/noise measurements from a committed repository baseline.
2. Exercise the versioned migration guide in at least one clean target repo.
3. Add Go and Rust command lanes when the toolchains are available.
4. Add fleet reports that compare policy drift without uploading source code.
5. Add pinned external canaries after local replay proof stays stable.
