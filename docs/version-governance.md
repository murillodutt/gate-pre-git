# Version Governance Runtime

`gate-pre-git` treats versioning as a release governance action, not as a
manual package edit. A version bump must identify the current source of truth,
compute the next SemVer value, synchronize every discovered target, and prove
that no version target drift remains.

## Commands

Plan the next version without writing files:

```sh
gate-pre-git version plan --target .
gate-pre-git version plan minor --target .
gate-pre-git version plan 0.1.0-rc.1 --target .
```

Apply a bump:

```sh
gate-pre-git version bump patch --target .
gate-pre-git version bump 0.1.0-rc.1 --target .
```

Audit version sync:

```sh
gate-pre-git version audit --target .
```

## Source Of Truth

Version detection is deterministic:

1. root `VERSION`, when it exists;
2. root `package.json#version`.

If neither exists, version governance fails. If the detected value is not
SemVer, version governance fails.

## Synchronized Targets

The runtime currently discovers and synchronizes:

1. root `VERSION`, only when it already exists;
2. root `package.json#version`;
3. package workspace `package.json#version` entries;
4. direct child `package.json#version` entries when the root package has no
   workspace declaration;
5. `.gate-pre-git/governance.json#generatedBy`;
6. `.gate-pre-git/lock.json#generatedBy`;
7. `src/types.ts#GATE_PRE_GIT_VERSION`.

The bump path refuses to mask existing drift. If any discovered target is
already out of sync with the source version, `version bump` fails before
writing.

## Doctor Contract

`doctor` runs `version audit` through the `version_sync` check. A vendored repo
is not healthy when package, runtime, governance metadata, or lock metadata
describe different gate versions.

## Release Boundary

The version runtime does not commit, tag, push, publish, or create releases.
Those are Git/release actions performed after local evidence is green. The
release runtime closes the next layer by reading Git history, classifying
commits, and writing deterministic changelog artifacts.

Plan release contents:

```sh
gate-pre-git release plan --target .
gate-pre-git release plan --target . --from v0.1.0 --to HEAD
```

Write release artifacts:

```sh
gate-pre-git release write --target .
```

This writes:

1. `CHANGELOG.md`;
2. `docs/releases/vX.Y.Z.md`.

Audit release artifacts:

```sh
gate-pre-git release audit --target .
```

The release runtime excludes merge commits, bump commits, lock-only subjects,
and bot-authored commits from changelog entries. Conventional commits are
classified as `added`, `fixed`, or `changed`, and conventional scopes become
components.

The minimum release evidence after a bump is:

```sh
gate-pre-git version audit --target .
gate-pre-git release plan --target .
gate-pre-git release audit --target .
gate-pre-git doctor --target .
gate-pre-git check --target . --all
gate-pre-git audit --target . --all --format json
gate-pre-git audit --target . --all --format sarif
```
