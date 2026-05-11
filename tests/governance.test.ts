import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { GovernanceMap } from "../src/governance";
import { checkGovernance, matchesGovernancePath } from "../src/governance";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-governance-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(dir, ".gate-pre-git"), { recursive: true });
  return dir;
}

function writeMap(target: string, map: GovernanceMap): void {
  writeFileSync(join(target, ".gate-pre-git", "governance.json"), `${JSON.stringify(map, null, 2)}\n`, "utf8");
}

const baseMap: GovernanceMap = {
  version: 1,
  zones: [
    {
      name: "source",
      owners: ["platform"],
      risk: "medium",
      paths: ["src/**"],
      requiredEvidence: ["bun test", "bun run typecheck"]
    }
  ],
  sensitivePaths: [".env", "secrets/**"],
  generatedPaths: ["src/generated/**"],
  exceptions: []
};

describe("governance map", () => {
  test("matches path literals, single stars, and double stars", () => {
    expect(matchesGovernancePath("package.json", "package.json")).toBe(true);
    expect(matchesGovernancePath("src/*.ts", "src/governance.ts")).toBe(true);
    expect(matchesGovernancePath("src/*.ts", "src/nested/governance.ts")).toBe(false);
    expect(matchesGovernancePath("src/**", "src/nested/governance.ts")).toBe(true);
  });

  test("sensitive path fails", () => {
    const dir = fixture("sensitive");
    writeMap(dir, baseMap);

    const check = checkGovernance(dir, [".env"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("failed");
    expect(check.failures.join("\n")).toContain("sensitive path");
    rmSync(dir, { recursive: true, force: true });
  });

  test("generated path fails", () => {
    const dir = fixture("generated");
    writeMap(dir, baseMap);

    const check = checkGovernance(dir, ["src/generated/schema.ts"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("failed");
    expect(check.failures.join("\n")).toContain("generated path");
    rmSync(dir, { recursive: true, force: true });
  });

  test("unowned zone fails", () => {
    const dir = fixture("unowned");
    writeMap(dir, baseMap);

    const check = checkGovernance(dir, ["docs/notes.md"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("failed");
    expect(check.failures.join("\n")).toContain("unowned governance zone");
    rmSync(dir, { recursive: true, force: true });
  });

  test("expired exception fails", () => {
    const dir = fixture("expired-exception");
    writeMap(dir, {
      ...baseMap,
      exceptions: [{ path: ".env", reason: "temporary migration", expiresOn: "2026-05-10" }]
    });

    const check = checkGovernance(dir, [".env"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("failed");
    expect(check.failures.join("\n")).toContain("expired governance exception");
    rmSync(dir, { recursive: true, force: true });
  });

  test("known zone details include owner risk and evidence", () => {
    const dir = fixture("known-zone");
    writeMap(dir, baseMap);

    const check = checkGovernance(dir, ["src/governance.ts"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("passed");
    expect(check.details.join("\n")).toContain("owners=platform");
    expect(check.details.join("\n")).toContain("risk=medium");
    expect(check.details.join("\n")).toContain("evidence=bun test,bun run typecheck");
    rmSync(dir, { recursive: true, force: true });
  });

  test("prefers a more specific path zone over a broad extension zone", () => {
    const dir = fixture("specific-zone");
    writeMap(dir, {
      version: 1,
      zones: [
        {
          name: "source_python",
          owners: ["platform"],
          risk: "high",
          paths: ["**/*.py"],
          requiredEvidence: ["ruff"]
        },
        {
          name: "fixture_workspaces",
          owners: ["quality"],
          risk: "medium",
          paths: ["fixtures/**"],
          requiredEvidence: ["text_hygiene"]
        }
      ],
      sensitivePaths: [],
      generatedPaths: [],
      exceptions: []
    });

    const check = checkGovernance(
      dir,
      ["fixtures/workspaces/python-basic/baseline/pkg/app.py"],
      new Date("2026-05-11T12:00:00Z")
    );

    expect(check.status).toBe("passed");
    expect(check.details.join("\n")).toContain("zone=fixture_workspaces");
    expect(check.details.join("\n")).not.toContain("zone=source_python");
    rmSync(dir, { recursive: true, force: true });
  });

  test("missing map is skipped not failed", () => {
    const dir = join(tmpdir(), `gate-pre-git-governance-missing-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(dir, { recursive: true });

    const check = checkGovernance(dir, ["src/governance.ts"], new Date("2026-05-11T12:00:00Z"));

    expect(check.status).toBe("skipped");
    expect(check.failures).toEqual([]);
    expect(check.details).toContain("missing_map=.gate-pre-git/governance.json");
    rmSync(dir, { recursive: true, force: true });
  });
});
