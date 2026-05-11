import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGate } from "../src/gate";

function fixture(name: string): string {
  const dir = join(
    tmpdir(),
    `gate-pre-git-governance-integration-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  mkdirSync(join(dir, ".gate-pre-git"), { recursive: true });
  return dir;
}

function writeGovernanceMap(target: string): void {
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
            paths: [".gate-pre-git/governance.json"],
            requiredEvidence: ["doctor"]
          },
          {
            name: "source",
            owners: ["platform"],
            risk: "high",
            paths: ["src/**"],
            requiredEvidence: ["test"]
          }
        ],
        sensitivePaths: [".env"],
        generatedPaths: ["src/generated/**"],
        exceptions: []
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

describe("governance integration", () => {
  test("gate fails unowned files when governance map is present", () => {
    const dir = fixture("unowned");
    try {
      writeGovernanceMap(dir);
      writeFileSync(join(dir, "notes.md"), "# Notes\n", "utf8");

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });

      expect(report.ok).toBe(false);
      expect(report.checks.find((check) => check.name === "governance")?.status).toBe("failed");
      expect(report.findings.map((finding) => finding.code)).toContain("governance");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("gate emits zone owner risk and evidence details for governed files", () => {
    const dir = fixture("owned");
    try {
      writeGovernanceMap(dir);
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "index.ts"), "export const value = 1;\n", "utf8");

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });
      const governance = report.checks.find((check) => check.name === "governance");

      expect(report.ok).toBe(true);
      expect(governance?.status).toBe("passed");
      expect(governance?.details.join("\n")).toContain("zone=source");
      expect(governance?.details.join("\n")).toContain("owners=platform");
      expect(governance?.details.join("\n")).toContain("risk=high");
      expect(governance?.details.join("\n")).toContain("evidence=test");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("gate emits first-class governance records for audit consumers", () => {
    const dir = fixture("structured");
    try {
      writeGovernanceMap(dir);
      mkdirSync(join(dir, "src"), { recursive: true });
      writeFileSync(join(dir, "src", "index.ts"), "export const value = 1;\n", "utf8");

      const report = runGate({ target: dir, mode: "audit", all: true, json: false, runCommands: false });
      const structured = report as unknown as {
        governance?: Array<{
          file: string;
          zone: string | null;
          owners: string[];
          risk: string | null;
          requiredEvidence: string[];
          status: string;
          exception: null | { expiresOn: string };
        }>;
      };

      expect(structured.governance).toEqual([
        {
          file: ".gate-pre-git/governance.json",
          zone: "governance",
          owners: ["platform"],
          risk: "critical",
          requiredEvidence: ["doctor"],
          status: "passed",
          exception: null
        },
        {
          file: "src/index.ts",
          zone: "source",
          owners: ["platform"],
          risk: "high",
          requiredEvidence: ["test"],
          status: "passed",
          exception: null
        }
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("gate emits structured governance failures for unowned and sensitive files", () => {
    const dir = fixture("structured-failures");
    try {
      writeGovernanceMap(dir);
      writeFileSync(join(dir, "notes.md"), "# Notes\n", "utf8");
      writeFileSync(join(dir, ".env"), "TOKEN=value\n", "utf8");

      const report = runGate({ target: dir, mode: "audit", all: true, json: false, runCommands: false });
      const records = new Map(report.governance.map((record) => [record.file, record]));

      expect(report.ok).toBe(false);
      expect(records.get("notes.md")).toMatchObject({
        file: "notes.md",
        zone: null,
        owners: [],
        risk: null,
        requiredEvidence: [],
        status: "failed",
        exception: null,
        failureReasons: ["unowned governance zone for notes.md"]
      });
      expect(records.get(".env")).toMatchObject({
        file: ".env",
        zone: null,
        sensitivePattern: ".env",
        status: "failed"
      });
      expect(records.get(".env")?.failureReasons?.join("\n")).toContain("sensitive path");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
