import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGate } from "../src/gate";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-impact-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(dir, ".gate-pre-git"), { recursive: true });
  return dir;
}

function writeConfig(target: string): void {
  writeFileSync(
    join(target, ".gate-pre-git", "config.json"),
    `${JSON.stringify(
      {
        tools: ["biome", "markdownlint"],
        commandChecks: [
          {
            name: "typecheck",
            run: 'bun -e "process.exit(0)"',
            modes: ["check"]
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function writeMap(target: string): void {
  writeFileSync(
    join(target, ".gate-pre-git", "governance.json"),
    `${JSON.stringify(
      {
        version: 1,
        zones: [
          {
            name: "governance",
            owners: ["platform"],
            risk: "critical",
            paths: [".gate-pre-git/**"],
            requiredEvidence: ["text_hygiene"]
          },
          {
            name: "docs",
            owners: ["maintainers"],
            risk: "low",
            paths: ["docs/**"],
            requiredEvidence: ["markdown_structure", "markdownlint"]
          },
          {
            name: "source",
            owners: ["platform"],
            risk: "high",
            paths: ["src/**"],
            requiredEvidence: ["biome", "typecheck"]
          }
        ],
        sensitivePaths: [],
        generatedPaths: [],
        exceptions: []
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function git(target: string, args: string[]): void {
  execFileSync("git", args, { cwd: target, stdio: "ignore" });
}

describe("impact planner", () => {
  test("plans cheap docs evidence and skips source-only tools for docs-only changes", () => {
    const dir = fixture("docs-only");
    try {
      writeConfig(dir);
      writeMap(dir);
      git(dir, ["init"]);
      git(dir, ["add", ".gate-pre-git"]);
      git(dir, ["-c", "user.email=gate@example.com", "-c", "user.name=Gate", "commit", "-m", "baseline"]);
      mkdirSync(join(dir, "docs"), { recursive: true });
      writeFileSync(join(dir, "docs", "notes.md"), "# Notes\n", "utf8");

      const report = runGate({ target: dir, mode: "check", all: false, json: false, runCommands: false });
      const impact = report.impact.map(
        (record) => `${record.action}:${record.evidence}:${record.reason}:${record.zones.join(",")}`
      );

      expect(impact).toContain("run:markdownlint:required_by_governance:docs");
      expect(impact).toContain("skip:biome:no_matching_governed_files:");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
