# gate-pre-git Cursor Bootloader

Source of truth: `docs/agents/**`.

Cursor should load `.cursor/rules/tes-guidelines.mdc` and
`.cursor/rules/tes-runtime-capabilities.mdc`. This file exists as a thin
human-readable route for the same TES mesh.

## Read First

- `docs/agents/PROJECT-CONTEXT.md`
- `docs/agents/EXECUTION-LINE.md`
- `docs/agents/QUALITY-GATES.md`
- `docs/agents/BOUNDARIES-AND-CONSTRAINTS.md`
- `docs/agents/cortex/**`
- `docs/agents/adapters/cursor.md`

## Local Oracles

- `bun run typecheck`
- `bun test`
- `bun src/cli.ts doctor --target .`
- `bun src/cli.ts check --target . --all`
- `python3 .tes/bin/project_context_oracle.py --target .`
- `python3 .tes/bin/project_alignment_oracle.py --target .`

## TES Intent Shortcuts

Use these as intents: `/tes-init`, `/tes-update`, `/tes-align`,
`/tes-open-obsidian`, `/tes-cortex`, `/tes-curate`, `/tes-mcp`,
`/tes-field-reports`, `/tes-doctor`, `/tes-adapter`, `/tes-bench`, `/tes:init`,
`/tes:update`, `/tes:align`, `/tes:open-obsidian`, `/tes:cortex`, `/tes:mcp`,
`/tes:field-reports`, `/tes:doctor`, `/tes:adapter`, `/tes:bench`,
`/tes:check`, `/tes:certify`, `/tes:recall`, `/tes:learn`, `/tes:reflect`,
and `/tes:curate`.

Natural intents include `tes init`, `tes update`, `tes align`,
`tes open obsidian`, `align TES`, `align this project`, `open Obsidian`,
`open this project in Obsidian`, `Atualizar TES`, `atualizar TES`,
`alinhar TES`, `alinhar projeto`, `abrir Obsidian`, `abrir no Obsidian`,
`initialize TES`, `install TES`, `recertify TES`, `inicializar TES`,
`instalar TES`, and `recertificar TES`.

## Locks

- Cursor rules are runtime routes; durable project rules go in `docs/agents/**`.
- Read-only Cortex MCP is project-scoped in `.cursor/mcp.json`.
- Do not push, tag, publish, amend, change remotes, install dependencies, or
  touch secrets without explicit user approval.
