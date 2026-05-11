import { createHash } from "node:crypto";
import type { GateEvidenceRecord, GateReport } from "./types";

export type AuditEvidenceRecord = Omit<GateEvidenceRecord, "durationMs">;

export type AuditManifest = {
  schemaVersion: 2;
  version: GateReport["version"];
  mode: GateReport["mode"];
  files: GateReport["files"];
  findings: GateReport["findings"];
  fixesApplied: GateReport["fixesApplied"];
  filesStaged: GateReport["filesStaged"];
  governance: GateReport["governance"];
  evidence: AuditEvidenceRecord[];
  impact: GateReport["impact"];
  tools: GateReport["tools"];
};

export type AuditManifestResult = {
  manifest: AuditManifest;
  hash: string;
};

export function buildAuditManifest(report: GateReport): AuditManifestResult {
  const manifest: AuditManifest = {
    schemaVersion: 2,
    version: report.version,
    mode: report.mode,
    files: [...report.files].sort(),
    findings: sortCanonical(report.findings),
    fixesApplied: sortCanonical(report.fixesApplied),
    filesStaged: [...report.filesStaged].sort(),
    governance: sortCanonical(report.governance),
    evidence: sortCanonical(report.evidence.map(toAuditEvidenceRecord)),
    impact: sortCanonical(report.impact),
    tools: sortCanonical(report.tools)
  };

  return {
    manifest,
    hash: createHash("sha256").update(stableJson(manifest)).digest("hex")
  };
}

function toAuditEvidenceRecord(record: GateEvidenceRecord): AuditEvidenceRecord {
  return {
    id: record.id,
    provider: record.provider,
    status: record.status,
    files: [...record.files].sort(),
    zones: [...record.zones].sort(),
    source: record.source,
    reason: record.reason
  };
}

function sortCanonical<T>(values: T[]): T[] {
  return [...values].sort((left, right) => stableJson(left).localeCompare(stableJson(right)));
}

function stableJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => [key, canonicalize(entryValue)])
  );
}
