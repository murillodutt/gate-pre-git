import { describe, expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type PushRangeResult, resolvePushRange } from "../src/push";

function fixture(name: string): string {
  return mkdtempSync(join(tmpdir(), `gate-pre-git-${name}-`));
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();
}

function initRepository(cwd: string): void {
  git(cwd, ["init"]);
  git(cwd, ["config", "user.name", "Gate Test"]);
  git(cwd, ["config", "user.email", "gate-test@example.com"]);
}

function commitAll(cwd: string, message: string): void {
  git(cwd, ["add", "."]);
  git(cwd, ["commit", "-m", message]);
}

describe("push range helpers", () => {
  test("falls back to changed files before HEAD exists without noisy stderr", () => {
    const dir = fixture("push-no-head");
    try {
      initRepository(dir);
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "draft.ts"), "export const draft = true;\n", "utf8");

      const script = `
        import { resolvePushRange } from "./src/push.ts";
        console.log(JSON.stringify(resolvePushRange(process.argv[1])));
      `;
      const child = spawnSync(process.execPath, ["-e", script, dir], {
        cwd: process.cwd(),
        encoding: "utf8"
      });

      expect(child.status).toBe(0);
      expect(child.stderr).toBe("");

      const result = JSON.parse(child.stdout) as PushRangeResult;
      expect(result.base).toBe("origin/main");
      expect(result.mergeBase).toBeNull();
      expect(result.files).toEqual(["src/draft.ts"]);
      expect(result.warnings).toEqual(["HEAD is not available; using worktree changes"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("returns committed branch changes against origin/main", () => {
    const dir = fixture("push-range");
    const remote = fixture("push-remote");
    try {
      initRepository(dir);
      git(remote, ["init", "--bare"]);
      writeFileSync(join(dir, "README.md"), "# gate\n", "utf8");
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "app.ts"), "export const app = 1;\n", "utf8");
      commitAll(dir, "initial commit");
      git(dir, ["branch", "-M", "main"]);
      git(dir, ["remote", "add", "origin", remote]);
      git(dir, ["push", "-u", "origin", "main"]);

      git(dir, ["checkout", "-b", "feature/push-range"]);
      writeFileSync(join(dir, "src", "app.ts"), "export const app = 2;\n", "utf8");
      writeFileSync(join(dir, "src", "feature.ts"), "export const feature = true;\n", "utf8");
      commitAll(dir, "feature changes");
      writeFileSync(join(dir, "src", "draft.ts"), "export const draft = true;\n", "utf8");

      const result = resolvePushRange(dir);

      expect(result.base).toBe("origin/main");
      expect(result.mergeBase).toBe(git(dir, ["rev-parse", "origin/main"]));
      expect(result.files).toEqual(["src/app.ts", "src/feature.ts"]);
      expect(result.warnings).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(remote, { recursive: true, force: true });
    }
  });

  test("falls back to HEAD tree and worktree changes when origin/main is unavailable", () => {
    const dir = fixture("push-no-remote");
    try {
      initRepository(dir);
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "committed.ts"), "export const committed = true;\n", "utf8");
      commitAll(dir, "local commit");
      writeFileSync(join(dir, "src", "worktree.ts"), "export const worktree = true;\n", "utf8");

      const result = resolvePushRange(dir);

      expect(result.base).toBe("origin/main");
      expect(result.mergeBase).toBeNull();
      expect(result.files).toEqual(["src/committed.ts", "src/worktree.ts"]);
      expect(result.warnings).toEqual(["origin/main is not available; using HEAD tree and worktree changes"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
