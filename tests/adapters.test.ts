import { describe, expect, test } from "bun:test";
import { buildAdapterCommand, buildAdapterCommands, selectAdaptersForFiles } from "../src/adapters";

describe("tool adapters", () => {
  test("selects adapters from changed files", () => {
    const adapters = selectAdaptersForFiles([
      "src/main.ts",
      "scripts/release.sh",
      ".github/workflows/ci.yml",
      "docs/README.md",
      "pkg/module.py",
      "notes/plain.txt"
    ]);

    expect(adapters.map((adapter) => adapter.name)).toEqual([
      "biome",
      "ruff",
      "gitleaks",
      "actionlint",
      "shellcheck",
      "markdownlint"
    ]);
  });

  test("filters adapters by fix capability", () => {
    const adapters = selectAdaptersForFiles(["src/main.ts", "script.sh", "README.md"], "fix");

    expect(adapters.map((adapter) => adapter.name)).toEqual(["biome", "markdownlint"]);
  });

  test("keeps vendored skill markdown out of markdownlint", () => {
    const commands = buildAdapterCommands([
      ".agents/skills/tes-init/SKILL.md",
      ".claude/skills/tes-init/SKILL.md",
      "plugins/tilly-engineer-skills/skills/tes-init/SKILL.md",
      "skills/tes-init/SKILL.md",
      "docs/README.md"
    ]);

    expect(commands.find((command) => command.adapter === "markdownlint")?.args).toEqual(["docs/README.md"]);
  });

  test("generates locked shim commands for check adapters", () => {
    const commands = buildAdapterCommands(["src/main.ts", "README.md"]);

    expect(commands).toEqual([
      {
        adapter: "biome",
        capability: "check",
        command: "./.gate-pre-git/cache/bin/biome",
        args: ["check", "src/main.ts"],
        shell: "./.gate-pre-git/cache/bin/biome check src/main.ts",
        risk: "low"
      },
      {
        adapter: "gitleaks",
        capability: "check",
        command: "./.gate-pre-git/cache/bin/gitleaks",
        args: ["dir", ".", "--redact", "--no-banner", "--exit-code", "1"],
        shell: "./.gate-pre-git/cache/bin/gitleaks dir . --redact --no-banner --exit-code 1",
        risk: "high"
      },
      {
        adapter: "markdownlint",
        capability: "check",
        command: "./.gate-pre-git/cache/bin/markdownlint-cli2",
        args: ["README.md"],
        shell: "./.gate-pre-git/cache/bin/markdownlint-cli2 README.md",
        risk: "low"
      }
    ]);
  });

  test("generates locked shim commands for fix adapters", () => {
    expect(buildAdapterCommand("ruff", "fix", ["pkg/a.py", "README.md"], "/repo")).toEqual({
      adapter: "ruff",
      capability: "fix",
      command: "/repo/.gate-pre-git/cache/bin/ruff",
      args: ["check", "--fix", "pkg/a.py"],
      shell: "/repo/.gate-pre-git/cache/bin/ruff check --fix pkg/a.py",
      risk: "medium"
    });
  });
});
