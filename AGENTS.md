# gate-pre-git Agent Bootloader

Source of truth: `docs/agents/**`.

This file is the Codex runtime entrypoint for `gate-pre-git`. Keep it thin:
durable project governance belongs in `docs/agents/**`; TES-owned skills and
helpers provide runtime capability only.

## Read First

- Project map: `docs/agents/PROJECT-CONTEXT.md`
- Register: `docs/agents/PROJECT-REGISTER.md`
- Execution line: `docs/agents/EXECUTION-LINE.md`
- Quality gates: `docs/agents/QUALITY-GATES.md`
- Boundaries: `docs/agents/BOUNDARIES-AND-CONSTRAINTS.md`
- Cortex: `docs/agents/cortex/**`
- Codex adapter notes: `docs/agents/adapters/codex.md`

## Local Project Oracles

- `bun run typecheck`
- `bun test`
- `bun test tests/replay-fixtures.test.ts`
- `bun src/cli.ts doctor --target .`
- `bun src/cli.ts check --target . --all`
- `python3 .tes/bin/project_context_oracle.py --target .`
- `python3 .tes/bin/project_alignment_oracle.py --target .`

## TES Gates

Use these four gates before material work:

1. Context gate: read `docs/agents/PROJECT-CONTEXT.md` and the strongest cited anchors.
2. Boundary gate: check `docs/agents/BOUNDARIES-AND-CONSTRAINTS.md`.
3. Oracle gate: run the smallest relevant local command.
4. Closure gate: update evidence or report blockers honestly.

## TES Intent Shortcuts

Treat these as intents, not shell commands: `/tes-init`, `/tes-update`,
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

## Runtime Capabilities

- Codex skills live in `.agents/skills/tes-*/**`.
- `/tes-align` routes through `.agents/skills/tes-align/SKILL.md`.
- `/tes-open-obsidian` routes through `.agents/skills/tes-open-obsidian/SKILL.md`.
- Read-only Cortex MCP is project-scoped in `.codex/config.toml` and backed by `.tes/bin/cortex_mcp.py`.

## Locks

- Do not push, tag, publish, amend, change remotes, install dependencies, or
  touch secrets without explicit user approval.
- Do not move target-project rules into TES-owned skill files.
- Do not claim product or architecture facts without cited project anchors.
