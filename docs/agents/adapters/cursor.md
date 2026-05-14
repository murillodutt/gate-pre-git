---
tes_doc: adapter-cursor
status: active
owner: project
updated: 2026-05-11
confidence: medium
evidence:
  - path: CURSOR.md
  - path: .cursor/rules/tes-guidelines.mdc
  - path: .cursor/mcp.json
tags:
  - tes
  - adapter
---

# Cursor Adapter

Cursor routes through `CURSOR.md`, `.cursor/rules/tes-guidelines.mdc`,
`.cursor/rules/tes-runtime-capabilities.mdc`, and the project-scoped
`.cursor/mcp.json` MCP entry.

Cursor rules are active runtime routes. Durable project semantics belong in
`docs/agents/**`, especially `PROJECT-CONTEXT.md`, `EXECUTION-LINE.md`, and
`QUALITY-GATES.md`.

Use `docs/agents/cortex/**` for continuity; do not write `.obsidian/**` unless
the user explicitly asks.
