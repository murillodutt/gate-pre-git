import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGate } from "../src/gate";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-evidence-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(dir, ".gate-pre-git"), { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "src", "index.ts"), "export const value = 1;\n", "utf8");
  writeGovernanceMap(dir);
  return dir;
}

function writeGovernanceMap(target: string, sourceEvidence: string[] = ["typecheck"]): void {
  writeFileSync(
    join(target, ".gate-pre-git", "governance.json"),
    `${JSON.stringify(
      {
        version: 1,
        zones: [
          {
            name: "gate",
            owners: ["platform"],
            risk: "high",
            paths: [".gate-pre-git/**"],
            requiredEvidence: ["text_hygiene"]
          },
          {
            name: "source",
            owners: ["platform"],
            risk: "high",
            paths: ["src/**"],
            requiredEvidence: sourceEvidence
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

function writeConfig(target: string, commandChecks: unknown[]): void {
  writeFileSync(
    join(target, ".gate-pre-git", "config.json"),
    `${JSON.stringify(
      {
        tools: [],
        commandChecks
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

describe("evidence policy", () => {
  test("blocks governed files when required evidence is missing", () => {
    const dir = fixture("missing");
    try {
      writeConfig(dir, []);

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: true });

      expect(report.ok).toBe(false);
      expect(report.findings.map((finding) => finding.code)).toContain("evidence_policy");
      expect(report.findings.map((finding) => finding.file)).toContain("src/index.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("passes governed files when command evidence is produced", () => {
    const dir = fixture("satisfied");
    try {
      writeConfig(dir, [
        {
          name: "typecheck",
          run: 'bun -e "process.exit(0)"',
          modes: ["check"]
        }
      ]);

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: true });

      expect(report.ok).toBe(true);
      expect(report.evidence.find((record) => record.id === "typecheck")).toMatchObject({
        id: "typecheck",
        provider: "command",
        status: "satisfied"
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("push mode satisfies gate evidence for governed source files", () => {
    const dir = fixture("push-gate");
    try {
      writeGovernanceMap(dir, ["gate"]);
      writeConfig(dir, []);

      const report = runGate({ target: dir, mode: "push", all: true, json: false, runCommands: true });

      expect(report.ok).toBe(true);
      expect(report.evidence.find((record) => record.id === "gate")).toMatchObject({
        id: "gate",
        provider: "mode",
        status: "satisfied"
      });
      expect(report.evidence.find((record) => record.id === "push")).toMatchObject({
        id: "push",
        provider: "mode",
        status: "satisfied"
      });
      expect(report.impact.find((record) => record.evidence === "gate")).toMatchObject({
        evidence: "gate",
        action: "run",
        provider: "mode"
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
