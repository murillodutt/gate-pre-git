import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyVersionBump, auditVersion, planVersionChange } from "../src/versioning";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-versioning-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(dir, ".gate-pre-git"), { recursive: true });
  mkdirSync(join(dir, "packages", "adapter"), { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  return dir;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeVersionedProject(dir: string, version = "0.1.0"): void {
  writeJson(join(dir, "package.json"), {
    name: "version-target",
    version,
    workspaces: ["packages/*"]
  });
  writeJson(join(dir, "packages", "adapter", "package.json"), {
    name: "@gate-pre-git/adapter",
    version
  });
  writeFileSync(
    join(dir, "src", "types.ts"),
    `export const GATE_PRE_GIT_VERSION = "gate-pre-git@${version}";\n`,
    "utf8"
  );
  writeJson(join(dir, ".gate-pre-git", "governance.json"), {
    version: 1,
    generatedBy: `gate-pre-git@${version}`,
    zones: []
  });
  writeJson(join(dir, ".gate-pre-git", "lock.json"), {
    version: 1,
    generatedBy: `gate-pre-git@${version}`,
    tools: {}
  });
}

describe("version governance", () => {
  test("plans and audits version targets across package, runtime, and vendored metadata", () => {
    const dir = fixture("plan");
    try {
      writeVersionedProject(dir);

      const plan = planVersionChange({ target: dir, bump: "minor" });
      expect(plan.ok).toBe(true);
      expect(plan.currentVersion).toBe("0.1.0");
      expect(plan.nextVersion).toBe("0.2.0");
      expect(plan.targets.map((target) => target.path)).toEqual([
        "package.json",
        "packages/adapter/package.json",
        ".gate-pre-git/governance.json",
        ".gate-pre-git/lock.json",
        "src/types.ts"
      ]);

      const audit = auditVersion({ target: dir });
      expect(audit.ok).toBe(true);
      expect(audit.currentVersion).toBe("0.1.0");
      expect(audit.failures).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("bumps every discovered version target and validates sync", () => {
    const dir = fixture("bump");
    try {
      writeVersionedProject(dir);

      const result = applyVersionBump({ target: dir, bump: "0.1.0-rc.1" });

      expect(result.ok).toBe(true);
      expect(result.currentVersion).toBe("0.1.0");
      expect(result.nextVersion).toBe("0.1.0-rc.1");
      expect(result.updated).toEqual([
        "package.json",
        "packages/adapter/package.json",
        ".gate-pre-git/governance.json",
        ".gate-pre-git/lock.json",
        "src/types.ts"
      ]);
      expect(readJson<{ version: string }>(join(dir, "package.json")).version).toBe("0.1.0-rc.1");
      expect(readJson<{ version: string }>(join(dir, "packages", "adapter", "package.json")).version).toBe(
        "0.1.0-rc.1"
      );
      expect(readJson<{ generatedBy: string }>(join(dir, ".gate-pre-git", "governance.json")).generatedBy).toBe(
        "gate-pre-git@0.1.0-rc.1"
      );
      expect(readJson<{ generatedBy: string }>(join(dir, ".gate-pre-git", "lock.json")).generatedBy).toBe(
        "gate-pre-git@0.1.0-rc.1"
      );
      expect(readFileSync(join(dir, "src", "types.ts"), "utf8")).toContain("gate-pre-git@0.1.0-rc.1");
      expect(auditVersion({ target: dir }).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("audit fails when a target drifts from the source version", () => {
    const dir = fixture("drift");
    try {
      writeVersionedProject(dir);
      writeFileSync(
        join(dir, "src", "types.ts"),
        'export const GATE_PRE_GIT_VERSION = "gate-pre-git@0.1.1";\n',
        "utf8"
      );

      const audit = auditVersion({ target: dir });

      expect(audit.ok).toBe(false);
      expect(audit.failures.join("\n")).toContain("src/types.ts");
      expect(audit.failures.join("\n")).toContain("expected 0.1.0");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("CLI bumps a target repo and reports JSON", () => {
    const dir = fixture("cli");
    try {
      writeVersionedProject(dir);

      const output = execFileSync(
        "bun",
        ["src/cli.ts", "version", "bump", "patch", "--target", dir, "--format", "json"],
        {
          cwd: process.cwd(),
          encoding: "utf8"
        }
      );
      const result = JSON.parse(output) as { ok: boolean; nextVersion: string; updated: string[] };

      expect(result.ok).toBe(true);
      expect(result.nextVersion).toBe("0.1.1");
      expect(result.updated).toContain("package.json");
      expect(auditVersion({ target: dir }).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
