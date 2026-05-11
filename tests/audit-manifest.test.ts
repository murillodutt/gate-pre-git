import { describe, expect, test } from "bun:test";
import { toAuditJson, toSarif, withAuditManifest } from "../src/audit";
import { buildAuditManifest } from "../src/manifest";
import type { GateReport } from "../src/types";

describe("audit manifest", () => {
  test("hash is stable for equivalent reports", () => {
    const left = buildAuditManifest(reportFixture());
    const right = buildAuditManifest(
      reportFixture({
        files: ["src/b.ts", "src/a.ts"],
        filesStaged: ["src/b.ts", "src/a.ts"],
        findings: [
          {
            severity: "warning",
            code: "text_hygiene",
            message: "src/b.ts: trailing whitespace",
            file: "src/b.ts",
            source: "text_hygiene"
          },
          {
            severity: "error",
            code: "json_syntax",
            message: "src/a.ts: invalid JSON",
            file: "src/a.ts",
            source: "json_syntax"
          }
        ],
        fixesApplied: [
          {
            tool: "builtin:json-format",
            file: "src/b.ts",
            action: "format JSON and normalize text",
            staged: true
          },
          {
            tool: "builtin:text-normalize",
            file: "src/a.ts",
            action: "normalize text",
            staged: true
          }
        ],
        tools: [
          {
            name: "markdownlint",
            version: "0.22.1",
            status: "locked",
            command: "markdownlint-cli2"
          },
          {
            name: "biome",
            version: "2.4.15",
            status: "installed",
            command: "biome"
          }
        ]
      })
    );

    expect(right.manifest).toEqual(left.manifest);
    expect(right.hash).toBe(left.hash);
  });

  test("hash changes when findings change", () => {
    const baseline = buildAuditManifest(reportFixture());
    const changed = buildAuditManifest(
      reportFixture({
        findings: [
          ...reportFixture().findings,
          {
            severity: "error",
            code: "yaml_syntax",
            message: "config.yaml: invalid YAML",
            file: "config.yaml",
            source: "yaml_syntax"
          }
        ]
      })
    );

    expect(changed.hash).not.toBe(baseline.hash);
  });

  test("manifest hash ignores volatile evidence durations", () => {
    const [evidence] = reportFixture().evidence;
    const baseline = buildAuditManifest(
      reportFixture({
        evidence: [
          {
            ...evidence,
            files: ["src/b.ts", "src/a.ts"],
            zones: ["tests", "source"],
            durationMs: 1
          }
        ]
      })
    );
    const changed = buildAuditManifest(
      reportFixture({
        evidence: [
          {
            ...evidence,
            files: ["src/a.ts", "src/b.ts"],
            zones: ["source", "tests"],
            durationMs: 999
          }
        ]
      })
    );

    expect(changed.manifest.evidence).toEqual(baseline.manifest.evidence);
    expect(changed.hash).toBe(baseline.hash);
    expect((baseline.manifest.evidence[0] as { durationMs?: number } | undefined)?.durationMs).toBeUndefined();
  });

  test("audit report and SARIF carry the same manifest hash", () => {
    const report = reportFixture();
    const auditReport = withAuditManifest(report);
    const auditJson = JSON.parse(toAuditJson(report)) as {
      manifest?: unknown;
      manifestHash?: string;
    };
    const sarif = JSON.parse(toSarif(report)) as {
      runs: Array<{ properties?: { gatePreGitManifestHash?: string } }>;
    };

    expect(auditReport.manifestHash).toBe(buildAuditManifest(report).hash);
    expect(auditReport.manifest).toEqual(buildAuditManifest(report).manifest);
    expect(auditJson.manifest).toEqual(auditReport.manifest);
    expect(auditJson.manifestHash).toBe(auditReport.manifestHash);
    expect(sarif.runs[0]?.properties?.gatePreGitManifestHash).toBe(auditReport.manifestHash);
  });

  test("audit manifest and SARIF carry structured governance evidence", () => {
    const report = {
      ...reportFixture(),
      evidence: [
        {
          id: "typecheck",
          provider: "command",
          status: "satisfied",
          files: ["src/a.ts"],
          zones: ["source"],
          source: "command:typecheck",
          durationMs: 123
        }
      ],
      governance: [
        {
          file: "src/a.ts",
          zone: "source",
          owners: ["platform"],
          risk: "high",
          requiredEvidence: ["typecheck", "test"],
          status: "passed",
          exception: null
        }
      ]
    } as GateReport & {
      governance: Array<{
        file: string;
        zone: string | null;
        owners: string[];
        risk: string | null;
        requiredEvidence: string[];
        status: string;
        exception: null | { expiresOn: string };
      }>;
    };

    const auditReport = withAuditManifest(report);
    const sarif = JSON.parse(toSarif(report)) as {
      runs: Array<{ properties?: { gatePreGitGovernance?: unknown; gatePreGitEvidence?: unknown } }>;
    };

    expect((auditReport.manifest as { governance?: unknown }).governance).toEqual(report.governance);
    expect(sarif.runs[0]?.properties?.gatePreGitGovernance).toEqual(report.governance);
    expect(sarif.runs[0]?.properties?.gatePreGitEvidence).toEqual(auditReport.manifest.evidence);
    expect(
      (sarif.runs[0]?.properties?.gatePreGitEvidence as Array<{ durationMs?: number }> | undefined)?.[0]?.durationMs
    ).toBeUndefined();
  });
});

function reportFixture(overrides: Partial<GateReport> = {}): GateReport {
  return {
    ok: false,
    version: "gate-pre-git@0.1.0",
    mode: "audit",
    target: "/tmp/repo",
    files: ["src/a.ts", "src/b.ts"],
    findings: [
      {
        severity: "error",
        code: "json_syntax",
        message: "src/a.ts: invalid JSON",
        file: "src/a.ts",
        source: "json_syntax"
      },
      {
        severity: "warning",
        code: "text_hygiene",
        message: "src/b.ts: trailing whitespace",
        file: "src/b.ts",
        source: "text_hygiene"
      }
    ],
    fixesApplied: [
      {
        tool: "builtin:text-normalize",
        file: "src/a.ts",
        action: "normalize text",
        staged: true
      },
      {
        tool: "builtin:json-format",
        file: "src/b.ts",
        action: "format JSON and normalize text",
        staged: true
      }
    ],
    filesStaged: ["src/a.ts", "src/b.ts"],
    tools: [
      {
        name: "biome",
        version: "2.4.15",
        status: "installed",
        command: "biome"
      },
      {
        name: "markdownlint",
        version: "0.22.1",
        status: "locked",
        command: "markdownlint-cli2"
      }
    ],
    governance: [
      {
        file: "src/a.ts",
        zone: "source",
        owners: ["platform"],
        risk: "high",
        requiredEvidence: ["typecheck", "test"],
        status: "passed",
        exception: null
      }
    ],
    evidence: [
      {
        id: "typecheck",
        provider: "command",
        status: "satisfied",
        files: ["src/a.ts", "src/b.ts"],
        zones: ["source"],
        source: "command:typecheck"
      }
    ],
    impact: [
      {
        evidence: "typecheck",
        action: "run",
        reason: "required_by_governance",
        files: ["src/a.ts"],
        zones: ["source"],
        provider: "command"
      }
    ],
    checks: [],
    advice: [],
    durationMs: 12,
    ...overrides
  };
}
