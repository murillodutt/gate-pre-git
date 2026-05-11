import { type AuditManifest, buildAuditManifest } from "./manifest";
import type { GateReport } from "./types";

export type AuditReport = GateReport & {
  manifest: AuditManifest;
  manifestHash: string;
};

export function withAuditManifest(report: GateReport): AuditReport {
  const { manifest, hash } = buildAuditManifest(report);
  return {
    ...report,
    manifest,
    manifestHash: hash
  };
}

export function toAuditJson(report: GateReport): string {
  return JSON.stringify(withAuditManifest(report), null, 2);
}

export function toSarif(report: GateReport): string {
  const { hash, manifest } = buildAuditManifest(report);
  const rules = new Map(report.findings.map((finding) => [finding.code, finding]));
  const governanceByFile = new Map(report.governance.map((record) => [record.file, record]));
  const sarif = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "gate-pre-git",
            version: report.version,
            informationUri: "https://github.com/local/gate-pre-git",
            rules: [...rules.values()].map((finding) => ({
              id: finding.code,
              name: finding.code,
              shortDescription: {
                text: finding.source
              },
              defaultConfiguration: {
                level: sarifLevel(finding.severity)
              }
            }))
          }
        },
        properties: {
          gatePreGitManifestHash: hash,
          gatePreGitGovernance: manifest.governance,
          gatePreGitEvidence: manifest.evidence,
          gatePreGitImpact: manifest.impact
        },
        results: report.findings.map((finding) => ({
          ruleId: finding.code,
          level: sarifLevel(finding.severity),
          message: {
            text: finding.message
          },
          locations:
            finding.file === undefined
              ? []
              : [
                  {
                    physicalLocation: {
                      artifactLocation: {
                        uri: finding.file
                      }
                    }
                  }
                ],
          properties:
            finding.file === undefined || governanceByFile.get(finding.file) === undefined
              ? undefined
              : {
                  gatePreGitGovernance: governanceByFile.get(finding.file)
                }
        }))
      }
    ]
  };

  return JSON.stringify(sarif, null, 2);
}

function sarifLevel(severity: string): "error" | "warning" | "note" {
  if (severity === "error") return "error";
  if (severity === "warning") return "warning";
  return "note";
}
