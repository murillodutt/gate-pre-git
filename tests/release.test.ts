import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditReleaseArtifacts, buildReleasePlan, writeReleaseArtifacts } from "../src/release";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-release-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "dev@example.com"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Dev"], { cwd: dir, stdio: "ignore" });
  return dir;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function commit(dir: string, subject: string): string {
  execFileSync("git", ["add", "."], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", subject], { cwd: dir, stdio: "ignore" });
  return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
}

function writeReleaseProject(dir: string): { feat: string; fix: string; docs: string } {
  writeJson(join(dir, "package.json"), { name: "release-target", version: "0.1.0" });
  writeFileSync(join(dir, "README.md"), "# Release Target\n", "utf8");
  commit(dir, "chore: initial baseline");
  execFileSync("git", ["tag", "v0.1.0"], { cwd: dir, stdio: "ignore" });

  writeJson(join(dir, "package.json"), { name: "release-target", version: "0.2.0" });
  writeFileSync(join(dir, "feature.ts"), "export const feature = true;\n", "utf8");
  const feat = commit(dir, "feat(core): add governed release planner");

  writeFileSync(join(dir, "cli.ts"), "export const cli = true;\n", "utf8");
  const fix = commit(dir, "fix(cli): handle release artifact audit");

  writeFileSync(join(dir, "README.md"), "# Release Target\n\nUpdated.\n", "utf8");
  const docs = commit(dir, "docs: document release governance");

  writeFileSync(join(dir, "bun.lock"), "lock\n", "utf8");
  commit(dir, "chore: update bun.lock");

  writeFileSync(join(dir, "VERSION_NOTE.txt"), "bump\n", "utf8");
  commit(dir, "chore(scripts): bump version to 0.2.0");

  return { feat, fix, docs };
}

describe("release governance", () => {
  test("plans a release from Git history and classifies changelog entries", () => {
    const dir = fixture("plan");
    try {
      const commits = writeReleaseProject(dir);

      const plan = buildReleasePlan({ target: dir });

      expect(plan.ok).toBe(true);
      expect(plan.project).toBe("release-target");
      expect(plan.version).toBe("v0.2.0");
      expect(plan.previousRef).toBe("v0.1.0");
      expect(plan.entries).toEqual([
        {
          commitHash: commits.docs,
          category: "changed",
          title: "document release governance"
        },
        {
          commitHash: commits.fix,
          category: "fixed",
          title: "handle release artifact audit",
          component: "cli"
        },
        {
          commitHash: commits.feat,
          category: "added",
          title: "add governed release planner",
          component: "core"
        }
      ]);
      expect(plan.excludedCommits.map((entry) => entry.reason)).toEqual(["bump_commit", "lock_change"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("writes and audits release artifacts", () => {
    const dir = fixture("write");
    try {
      writeReleaseProject(dir);

      const write = writeReleaseArtifacts({ target: dir });
      expect(write.ok).toBe(true);
      expect(write.updated).toEqual(["CHANGELOG.md", "docs/releases/v0.2.0.md"]);
      expect(existsSync(join(dir, "docs", "releases", "v0.2.0.md"))).toBe(true);
      const changelog = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
      const releaseNotes = readFileSync(join(dir, "docs", "releases", "v0.2.0.md"), "utf8");
      expect(changelog).toContain("## v0.2.0");
      expect(releaseNotes).toContain("## Added\n\n-");
      expect(releaseNotes).toContain("## Fixed\n\n-");
      expect(releaseNotes).toContain("## Changed\n\n-");

      const audit = auditReleaseArtifacts({ target: dir });
      expect(audit.ok).toBe(true);
      expect(audit.failures).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("audit fails when release notes drift from the generated plan", () => {
    const dir = fixture("drift");
    try {
      writeReleaseProject(dir);
      writeReleaseArtifacts({ target: dir });
      writeFileSync(join(dir, "docs", "releases", "v0.2.0.md"), "# tampered\n", "utf8");

      const audit = auditReleaseArtifacts({ target: dir });

      expect(audit.ok).toBe(false);
      expect(audit.failures.join("\n")).toContain("docs/releases/v0.2.0.md");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("plan fails when no Git baseline exists", () => {
    const dir = fixture("no-history");
    try {
      writeJson(join(dir, "package.json"), { name: "release-target", version: "0.1.0" });

      const plan = buildReleasePlan({ target: dir });

      expect(plan.ok).toBe(false);
      expect(plan.failures.join("\n")).toContain("release baseline ref not found");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("CLI writes release artifacts as JSON", () => {
    const dir = fixture("cli");
    try {
      writeReleaseProject(dir);

      const output = execFileSync("bun", ["src/cli.ts", "release", "write", "--target", dir, "--format", "json"], {
        cwd: process.cwd(),
        encoding: "utf8"
      });
      const result = JSON.parse(output) as { ok: boolean; version: string; updated: string[] };

      expect(result.ok).toBe(true);
      expect(result.version).toBe("v0.2.0");
      expect(result.updated).toContain("docs/releases/v0.2.0.md");
      expect(auditReleaseArtifacts({ target: dir }).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
