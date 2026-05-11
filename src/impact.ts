import { buildAdapterCommands } from "./adapters";
import type {
  CommandCheckConfig,
  GateCheck,
  GateConfig,
  GateEvidenceProvider,
  GateGovernanceRecord,
  GateImpactRecord,
  GateMode
} from "./types";

const BUILTIN_PROVIDERS = new Map<string, GateEvidenceProvider>([
  ["staged_safety", "builtin"],
  ["text_hygiene", "builtin"],
  ["json_syntax", "builtin"],
  ["yaml_syntax", "builtin"],
  ["markdown_structure", "builtin"],
  ["git_diff_whitespace", "builtin"],
  ["governance", "governance"]
]);

export function buildImpactPlan(
  target: string,
  files: readonly string[],
  governance: readonly GateGovernanceRecord[],
  config: GateConfig,
  mode: GateMode
): GateImpactRecord[] {
  const planned = plannedEvidence(target, files, config, mode);
  const required = requiredEvidence(governance);
  const records: GateImpactRecord[] = [];

  for (const [evidence, governed] of required) {
    const plan = planned.get(evidence);
    records.push({
      evidence,
      action: plan === undefined ? "skip" : "run",
      reason: plan === undefined ? "no_provider_for_required_evidence" : "required_by_governance",
      files: governed.files,
      zones: governed.zones,
      provider: plan?.provider ?? "unknown"
    });
  }

  const requiredIds = new Set(required.keys());
  for (const tool of config.tools) {
    if (!requiredIds.has(tool) && !planned.has(tool)) {
      records.push({
        evidence: tool,
        action: "skip",
        reason: "no_matching_governed_files",
        files: [],
        zones: [],
        provider: "adapter"
      });
    }
  }

  return records.sort((left, right) =>
    `${left.action}:${left.evidence}:${left.reason}`.localeCompare(`${right.action}:${right.evidence}:${right.reason}`)
  );
}

export function checkImpactPlan(impact: readonly GateImpactRecord[]): GateCheck {
  return {
    name: "impact_plan",
    status: "passed",
    failures: [],
    warnings: [],
    details: impact.map(
      (record) =>
        `${record.action} evidence=${record.evidence} provider=${record.provider} zones=${record.zones.join(",") || "none"} files=${record.files.length} reason=${record.reason}`
    ),
    durationMs: 0
  };
}

function plannedEvidence(
  target: string,
  files: readonly string[],
  config: GateConfig,
  mode: GateMode
): Map<string, { provider: GateEvidenceProvider }> {
  const planned = new Map<string, { provider: GateEvidenceProvider }>();
  for (const evidence of modeEvidenceIds(mode)) planned.set(evidence, { provider: "mode" });
  for (const [id, provider] of BUILTIN_PROVIDERS) planned.set(id, { provider });

  const enabled = new Set(config.tools);
  for (const command of buildAdapterCommands(files, "check", target).filter((candidate) =>
    enabled.has(candidate.adapter)
  )) {
    planned.set(command.adapter, { provider: "adapter" });
    planned.set(`adapter:${command.adapter}`, { provider: "adapter" });
  }

  for (const command of commandEvidence(config.commandChecks, mode)) {
    planned.set(command.name, { provider: "command" });
    planned.set(`command:${command.name}`, { provider: "command" });
  }

  return planned;
}

function modeEvidenceIds(mode: GateMode): string[] {
  if (mode === "check") return ["gate"];
  if (mode === "push") return ["gate", "push"];
  return [mode];
}

function commandEvidence(commands: readonly CommandCheckConfig[], mode: GateMode): CommandCheckConfig[] {
  return commands.filter((command) => command.modes === undefined || command.modes.includes(mode));
}

function requiredEvidence(
  governance: readonly GateGovernanceRecord[]
): Map<string, { files: string[]; zones: string[] }> {
  const required = new Map<string, { files: Set<string>; zones: Set<string> }>();
  for (const record of governance) {
    if (record.status !== "passed") continue;
    for (const evidence of record.requiredEvidence) {
      const entry = required.get(evidence) ?? { files: new Set<string>(), zones: new Set<string>() };
      entry.files.add(record.file);
      if (record.zone !== null) entry.zones.add(record.zone);
      required.set(evidence, entry);
    }
  }

  return new Map(
    [...required.entries()].map(([evidence, entry]) => [
      evidence,
      {
        files: [...entry.files].sort(),
        zones: [...entry.zones].sort()
      }
    ])
  );
}
