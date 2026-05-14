# TES Cortex Contract

Cortex is the Tilly filesystem memory layer for this project.

Operating contract:

```text
Memory lives in versioned Cortex artifacts. SQLite is only derived recall.
```

## Core Layers

| Layer | Path | Contract |
|-------|------|----------|
| Sources | `sources/**` | Immutable user-curated evidence |
| Cells | `cells/**` | Compiled and evolving knowledge |
| Map | `MAP.md` | Navigable catalog |
| Trail | `TRAIL.md` | Append-only evolution timeline |
| Links | `LINKS.md` | Durable relationship map |
| Recall index | `.tes/cortex/recall.sqlite` | Derived cache, rebuilt from files |
| Semantic index | `.tes/cortex/semantic.sqlite` | Derived curation cache, rebuilt from cells |

SQLite is never memory and never source of truth. Both recall and semantic
indexes may be deleted and rebuilt from `sources/**`, `cells/**`, `MAP.md`,
`TRAIL.md`, `LINKS.md`, and this contract.

## Cell Convention

Each cell must include one H1, a `## Claim` section, a `## Evidence` section,
explicit evidence refs, links to related Cortex cells when known, and
unresolved contradictions when present.

Use Obsidian wikilinks when useful, but keep source citations as explicit paths.

## Operations

| Operation | Contract |
|-----------|----------|
| `absorb` | Compile source evidence into cells, MAP, LINKS, and TRAIL |
| `recall` | Search Cortex artifacts through FTS5 or `rg` fallback |
| `audit` | Detect drift, orphans, broken links, and missing catalog entries |
| `curate-plan` | Classify semantic curation needs without writing memory |
| `learn` | Propose durable promotion; do not write automatically |
| `apply` | Write only with authorization and audit evidence |

## Privacy Lock

Do not absorb secrets, credentials, private keys, `.env` contents, or regulated
personal data unless a local privacy contract explicitly allows it.

## Obsidian Boundary

Obsidian may be used as a viewer/editor, but Cortex does not require it. Agents
must not edit `.obsidian/**` during Cortex operations unless explicitly asked.

## PR Cut Contract

```yaml
cortex_cut:
  consumer:
  camada: contrato|estrutura|cli|obsidian|adapter|mcp
  escreve_em:
  nao_toca:
  oracle:
  rollback:
```
