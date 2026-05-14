---
tes_doc: project-register
status: active
owner: project
updated: 2026-05-14
confidence: medium
evidence:
  - path: docs/agents/evidence/20260514T221551Z-tes-project-manifest.json
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - project-register
related:
  - "[[PROJECT-CONTEXT]]"
  - "[[PROJECT-STATE]]"
  - "[[PROJECT-ROADMAP]]"
---

# Tilly Project Register

Generated: `2026-05-14T22:15:51Z`

This register is a deterministic project inventory for Tilly agents. It records
the project shape; it is not compiled Cortex knowledge and it is not a
replacement for Git history.

## Identity

| Field | Value |
|-------|-------|
| Target | `/Users/murillo/Dev/gate-pre-git` |
| Git HEAD | `2ef45d6da46a42fa6d6014ab4b97f0b20f93d4af` |
| File count | `153` |
| Total bytes | `839026` |
| Manifest | `docs/agents/evidence/20260514T221551Z-tes-project-manifest.json` |
| Project context | `docs/agents/PROJECT-CONTEXT.md` |

## Tilly Surfaces

| Surface | Status |
|---------|--------|
| `claude_mcp` | present |
| `claude_md` | present |
| `claude_plugin` | present |
| `claude_plugin_skill` | present |
| `claude_project_skill` | present |
| `codex_agents` | present |
| `codex_mcp` | present |
| `codex_skill` | present |
| `cortex_contract` | present |
| `cursor_bootloader` | present |
| `cursor_mcp` | present |
| `cursor_rules` | present |
| `docs_agents` | present |
| `tes_field_reports_disabled` | missing |
| `tes_field_reports_helper` | present |
| `tes_field_reports_outbox` | present |
| `tes_field_reports_pre_push` | present |
| `tes_legacy_retirement_helper` | present |
| `tes_mcp_embed_helper` | present |
| `tes_mcp_server` | present |
| `tes_root_context_helper` | present |
| `tes_update_helper` | present |

## File Types

| Suffix | Count |
|--------|-------|
| `.bak-20260514T221540Z` | 1 |
| `.go` | 1 |
| `.js` | 1 |
| `.json` | 24 |
| `.jsonc` | 1 |
| `.lock` | 1 |
| `.md` | 60 |
| `.mdc` | 1 |
| `.mod` | 1 |
| `.py` | 2 |
| `.rs` | 1 |
| `.toml` | 3 |
| `.ts` | 42 |
| `.vue` | 1 |
| `.yaml` | 6 |
| `.yml` | 2 |
| `[none]` | 5 |

## Recertification Gates

| Command | Result |
|---------|--------|
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_context_oracle.py --self-test` | `PASS` |
| `git diff --check` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/root_context.py analyze --target /Users/murillo/Dev/gate-pre-git` | `RECOVERED` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/field_reports.py status --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_context_oracle.py --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/project_alignment_oracle.py --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py verify --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py audit --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py rebuild --target /Users/murillo/Dev/gate-pre-git` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex.py curate-plan --target /Users/murillo/Dev/gate-pre-git --backend lexical` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.tes/bin/cortex_mcp.py --self-test` | `PASS` |
| `/opt/homebrew/opt/python@3.14/bin/python3.14 /Users/murillo/Dev/gate-pre-git/.agents/skills/tes-engineering-discipline/scripts/discipline_oracle.py --self-test` | `PASS` |

## Governance

- Re-run `python3 scripts/tes_init.py --target <project> --yes` after major
  project reshapes.
- Treat `docs/agents/PROJECT-CONTEXT.md` as the initial project map for agents:
  update it when major architecture, product, or operational meaning changes.
- Do not treat this inventory as memory. Promote durable knowledge through
  Cortex `learn` and authorized `apply`.
- Keep generated manifests in `docs/agents/evidence/**` so Git preserves the
  lineage.
- TES Field Reports are operational transport only; Git and local governed
  artifacts remain project truth.
- Root context result `RECOVERED` means project-owned bootloader context was
  detected and should be recovered from `.tes/bk/**` after the clean runtime
  is active.
