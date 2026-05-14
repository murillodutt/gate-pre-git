---
tes_doc: adapter-claude
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: CLAUDE.md
  - path: .claude/skills/tes-guidelines/SKILL.md
  - path: .mcp.json
tags:
  - tes
  - adapter
---

# Claude Adapter

Claude Code routes through `CLAUDE.md`, `.claude/skills/tes-*/**`, optional
plugin test copies under `skills/**`, and the project-scoped `.mcp.json` MCP
entry.

`CLAUDE.md` must stay a thin bootloader. If Claude reports a `/tes:*` form as
an invalid slash command, continue as TES intent text through the matching
local skill.

Do not place project-specific governance inside TES-owned Claude skills.
