import type { GateCheck, GateEvidenceRecord, GateGovernanceRecord, GateMode } from "./types";

const BUILTIN_EVIDENCE = new Set([
  "staged_safety",
  "text_hygiene",
  "json_syntax",
  "yaml_syntax",
  "markdown_structure",
  "git_diff_whitespace",
  "governance"
]);

export function collectEvidenceRecords(
  checks: readonly GateCheck[],
  governance: readonly GateGovernanceRecord[],
  files: readonly string[],
  mode: GateMode
): GateEvidenceRecord[] {
  const records: GateEvidenceRecord[] = modeEvidenceIds(mode).map((id) => ({
    provider: "mode",
    id,
    status: "satisfied",
    files: [...files].sort(),
    zones: zonesForEvidence(id, governance),
    source: `mode:${mode}`
  }));

  for (const check of checks) {
    const status = evidenceStatus(check);
    if (check.name.startsWith("adapter:")) {
      const adapter = check.name.slice("adapter:".length);
      records.push(evidenceRecord(adapter, "adapter", status, files, governance, check));
      records.push(evidenceRecord(check.name, "adapter", status, files, governance, check));
      continue;
    }
    if (check.name.startsWith("command:")) {
      const command = check.name.slice("command:".length);
      records.push(evidenceRecord(command, "command", status, files, governance, check));
      records.push(evidenceRecord(check.name, "command", status, files, governance, check));
      continue;
    }
    if (BUILTIN_EVIDENCE.has(check.name)) {
      records.push(
        evidenceRecord(
          check.name,
          check.name === "governance" ? "governance" : "builtin",
          status,
          files,
          governance,
          check
        )
      );
    }
  }

  return sortEvidence(dedupeEvidence(records));
}

function modeEvidenceIds(mode: GateMode): string[] {
  if (mode === "check") return ["gate"];
  if (mode === "push") return ["gate", "push"];
  return [mode];
}

export function checkEvidencePolicy(
  governance: readonly GateGovernanceRecord[],
  evidence: readonly GateEvidenceRecord[]
): GateCheck {
  const satisfied = new Set(evidence.filter((record) => record.status === "satisfied").map((record) => record.id));
  const failures: string[] = [];
  const details: string[] = [];

  for (const record of governance) {
    if (record.status === "excepted") {
      details.push(`waived=${record.file}`);
      continue;
    }
    for (const required of record.requiredEvidence) {
      if (!satisfied.has(required)) {
        failures.push(
          `missing required evidence: ${record.file} requires ${required} zone=${record.zone ?? "unowned"}`
        );
      }
    }
  }

  return {
    name: "evidence_policy",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [`records=${evidence.length}`, ...details],
    durationMs: 0
  };
}

function evidenceRecord(
  id: string,
  provider: GateEvidenceRecord["provider"],
  status: GateEvidenceRecord["status"],
  files: readonly string[],
  governance: readonly GateGovernanceRecord[],
  check: GateCheck
): GateEvidenceRecord {
  return {
    id,
    provider,
    status,
    files: [...files].sort(),
    zones: zonesForEvidence(id, governance),
    source: check.name,
    durationMs: check.durationMs,
    reason: status === "satisfied" ? undefined : [...check.failures, ...check.warnings].join("\n") || undefined
  };
}

function evidenceStatus(check: GateCheck): GateEvidenceRecord["status"] {
  if (check.status === "passed") return "satisfied";
  if (check.status === "skipped") return "skipped";
  return "failed";
}

function zonesForEvidence(id: string, governance: readonly GateGovernanceRecord[]): string[] {
  return [
    ...new Set(
      governance
        .filter((record) => record.zone !== null && record.requiredEvidence.includes(id))
        .map((record) => record.zone as string)
    )
  ].sort();
}

function dedupeEvidence(records: GateEvidenceRecord[]): GateEvidenceRecord[] {
  const deduped = new Map<string, GateEvidenceRecord>();
  for (const record of records) {
    deduped.set(`${record.provider}:${record.id}:${record.source}`, record);
  }
  return [...deduped.values()];
}

function sortEvidence(records: GateEvidenceRecord[]): GateEvidenceRecord[] {
  return records.sort((left, right) =>
    `${left.provider}:${left.id}:${left.source}`.localeCompare(`${right.provider}:${right.id}:${right.source}`)
  );
}
