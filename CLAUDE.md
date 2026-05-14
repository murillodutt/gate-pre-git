# gate-pre-git Claude Bootloader

Source of truth: `docs/agents/**`.

This file is the Claude Code runtime entrypoint for `gate-pre-git`. Keep durable
project governance in `docs/agents/**`; keep `.claude/skills/**` and
`skills/**` TES-owned.

## Read First

- `docs/agents/PROJECT-CONTEXT.md`
- `docs/agents/EXECUTION-LINE.md`
- `docs/agents/QUALITY-GATES.md`
- `docs/agents/BOUNDARIES-AND-CONSTRAINTS.md`
- `docs/agents/cortex/**`
- `docs/agents/adapters/claude.md`

## Local Oracles

- `bun run typecheck`
- `bun test`
- `bun test tests/replay-fixtures.test.ts`
- `bun src/cli.ts doctor --target .`
- `bun src/cli.ts check --target . --all`
- `python3 .tes/bin/project_context_oracle.py --target .`
- `python3 .tes/bin/project_alignment_oracle.py --target .`

## TES Intent Shortcuts

Treat these as TES intents, not raw shell commands: `/tes-init`, `/tes-update`,
`/tes-align`, `/tes-open-obsidian`, `/tes-cortex`, `/tes-curate`, `/tes-mcp`,
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

If Claude reports a `/tes:*` form as an invalid slash command, continue as TES
intent text through the matching local skill. Do not ask the user to reselect a
route when the intent is clear.

## Runtime Capabilities

- Claude project skills live in `.claude/skills/tes-*/**`.
- Plugin testing copies live in `skills/tes-*/**`.
- Read-only Cortex MCP is project-scoped in `.mcp.json`.

## Locks

- Do not push, tag, publish, amend, change remotes, install dependencies, or
  touch secrets without explicit user approval.
- Do not place project-specific rules inside TES-owned skills.
- Do not claim deep project context until cited anchors have been opened.
