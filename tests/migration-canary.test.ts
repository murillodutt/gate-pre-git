import { describe, expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..");

function run(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function git(cwd: string, args: string[]): string {
  return run("git", args, cwd);
}

function initRepository(cwd: string): void {
  git(cwd, ["init"]);
  git(cwd, ["config", "user.name", "Gate Migration Test"]);
  git(cwd, ["config", "user.email", "gate-migration@example.com"]);
}

function commitAll(cwd: string, message: string): string {
  git(cwd, ["add", "."]);
  git(cwd, ["commit", "--no-verify", "-m", message]);
  return git(cwd, ["rev-parse", "HEAD"]);
}

describe("migration canary", () => {
  test("migrates a clean external repository using only the vendored launcher", () => {
    const dir = mkdtempSync(join(tmpdir(), "gate-pre-git-migration-"));
    try {
      writeFileSync(join(dir, "README.md"), "# Client Project\n\nA clean migration target.\n", "utf8");
      writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify({ name: "client-project", version: "0.0.0", scripts: {} }, null, 2)}\n`,
        "utf8"
      );
      initRepository(dir);
      commitAll(dir, "chore: source baseline");

      run("bun", ["src/cli.ts", "init", "--target", dir, "--profile", "auto", "--yes"], REPO_ROOT);

      const launcher = join(dir, ".gate-pre-git", "bin", "gate-pre-git");
      const runtime = join(dir, ".gate-pre-git", "runtime", "cli.js");
      expect(existsSync(launcher)).toBe(true);
      expect(existsSync(runtime)).toBe(true);
      expect(readFileSync(launcher, "utf8")).toContain(".gate-pre-git/runtime/cli.js");

      expect(run(launcher, ["doctor", "--target", dir], dir)).toContain("gate_pre_git=passed");

      const baselineHead = commitAll(dir, "chore: install gate-pre-git baseline");
      git(dir, ["update-ref", "refs/remotes/origin/main", baselineHead]);

      expect(run(launcher, ["check", "--target", dir, "--all", "--no-commands"], dir)).toContain("gate_pre_git=passed");
      expect(run(launcher, ["staged", "--target", dir, "--no-commands"], dir)).toContain("gate_pre_git=passed");
      const pushOutput = run(launcher, ["push", "--target", dir, "--base", "origin/main", "--no-commands"], dir);
      expect(pushOutput).toContain("gate_pre_git=passed");
      expect(pushOutput).not.toContain("finding.info.push_range");

      const auditJson = JSON.parse(
        run(launcher, ["audit", "--target", dir, "--all", "--format", "json", "--no-commands"], dir)
      ) as { ok: boolean; manifestHash: string; governance: unknown[] };
      const auditSarif = JSON.parse(
        run(launcher, ["audit", "--target", dir, "--all", "--format", "sarif", "--no-commands"], dir)
      ) as { runs: Array<{ properties: { gatePreGitManifestHash: string } }> };
      expect(auditJson.ok).toBe(true);
      expect(auditJson.manifestHash).toHaveLength(64);
      expect(auditJson.governance.length).toBeGreaterThan(0);
      expect(auditSarif.runs[0]?.properties.gatePreGitManifestHash).toBe(auditJson.manifestHash);

      rmSync(join(dir, ".gate-pre-git", "cache", "bin"), { recursive: true, force: true });
      expect(run(launcher, ["update-tools", "--target", dir], dir)).toContain("gate_pre_git=passed");
      expect(existsSync(join(dir, ".gate-pre-git", "cache", "bin", "biome"))).toBe(true);

      writeFileSync(join(dir, "bad.json"), "{", "utf8");
      git(dir, ["add", "bad.json"]);
      const blockedCommit = spawnSync("git", ["commit", "-m", "test: invalid json"], {
        cwd: dir,
        encoding: "utf8"
      });
      expect(blockedCommit.status).not.toBe(0);
      expect(`${blockedCommit.stdout}\n${blockedCommit.stderr}`).toContain("json_syntax");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
