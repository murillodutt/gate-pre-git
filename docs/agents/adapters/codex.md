---
tes_doc: adapter-codex
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: AGENTS.md
  - path: .agents/skills/tes-engineering-discipline/SKILL.md
  - path: docs/agents/PROJECT-CONTEXT.md
tags:
  - tes
  - adapter
---

# Codex Adapter

Codex routes through `AGENTS.md`, `.agents/skills/tes-*/**`, and the
project-scoped `.codex/config.toml` MCP entry.

`AGENTS.md` must stay a thin bootloader. Put durable project rules in
`docs/agents/**` and runtime-specific TES behavior in `.agents/skills/**`.

Before closing material work, prefer:

- `python3 .tes/bin/project_context_oracle.py --target .`
- `python3 .tes/bin/project_alignment_oracle.py --target .`
- the smallest project gate from `docs/agents/QUALITY-GATES.md`
