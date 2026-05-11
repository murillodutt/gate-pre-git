import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGate } from "../src/gate";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-transaction-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  return dir;
}

function stagedContent(dir: string, file: string): string {
  return execFileSync("git", ["show", `:${file}`], { cwd: dir, encoding: "utf8" });
}

describe("fix transactions", () => {
  test("partial staging blocks a fixer without modifying worktree or index", () => {
    const dir = fixture("partial-block");
    try {
      writeFileSync(join(dir, "note.txt"), "staged   \n", "utf8");
      execFileSync("git", ["add", "note.txt"], { cwd: dir, stdio: "ignore" });
      writeFileSync(join(dir, "note.txt"), "unstaged   \n", "utf8");

      const report = runGate({
        target: dir,
        mode: "staged",
        all: false,
        json: false,
        runCommands: false
      });

      expect(report.ok).toBe(false);
      expect(report.findings.map((finding) => finding.code)).toContain("partial_staging_fix_blocked");
      expect(report.fixesApplied).toEqual([]);
      expect(report.filesStaged).toEqual([]);
      expect(readFileSync(join(dir, "note.txt"), "utf8")).toBe("unstaged   \n");
      expect(stagedContent(dir, "note.txt")).toBe("staged   \n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("post-fix validation failure restores worktree and index", () => {
    const dir = fixture("validation-rollback");
    try {
      const originalJson = '{"b":2,"a":1}';
      writeFileSync(join(dir, "data.json"), originalJson, "utf8");
      writeFileSync(join(dir, "blocker.txt"), "[STAGE_BLOCK:OPEN]\n", "utf8");
      execFileSync("git", ["add", "data.json", "blocker.txt"], { cwd: dir, stdio: "ignore" });

      const report = runGate({
        target: dir,
        mode: "staged",
        all: false,
        json: false,
        runCommands: false
      });

      expect(report.ok).toBe(false);
      expect(report.findings.map((finding) => finding.code)).toContain("post_fix_validation_failed");
      expect(report.fixesApplied).toEqual([]);
      expect(report.filesStaged).toEqual([]);
      expect(readFileSync(join(dir, "data.json"), "utf8")).toBe(originalJson);
      expect(stagedContent(dir, "data.json")).toBe(originalJson);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("successful staged fixes include source and fixed content trace hashes", () => {
    const dir = fixture("trace");
    try {
      writeFileSync(join(dir, "data.json"), '{"b":2,"a":1}', "utf8");
      execFileSync("git", ["add", "data.json"], { cwd: dir, stdio: "ignore" });

      const report = runGate({
        target: dir,
        mode: "staged",
        all: false,
        json: false,
        runCommands: false
      });

      expect(report.ok).toBe(true);
      expect(report.fixesApplied).toHaveLength(1);
      expect(report.fixesApplied[0]?.action).toMatch(/trace original=[a-f0-9]{12} fixed=[a-f0-9]{12}/);
      expect(report.filesStaged).toEqual(["data.json"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
