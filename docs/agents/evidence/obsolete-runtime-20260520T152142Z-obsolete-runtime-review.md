# Obsolete Runtime Review

Backup: `obsolete-runtime-20260520T152142Z`
Status: `NEEDS_REVIEW`

TES preserved obsolete plugin/root skill artifacts because at least one path was ambiguous, non-TES, modified, or secret-like.

## Paths

- `.claude-plugin/marketplace.json`: manifest-sha256-mismatch
- `.claude-plugin/plugin.json`: manifest-sha256-mismatch
- `plugins/tilly-engineer-skills/.codex-plugin/plugin.json`: manifest-sha256-mismatch
- `plugins/tilly-engineer-skills/skills/tes-engineering-discipline/agents/openai.yaml`: manifest-sha256-mismatch
- `skills`: skills/.DS_Store=ambiguous-root-skill
