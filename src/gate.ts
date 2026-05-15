import { resolve } from "node:path";
import { runAdapterChecks } from "./adapter-runner";
import { buildAdapterCommands } from "./adapters";
import {
  checkConfiguredCommands,
  checkGitDiffWhitespace,
  checkJsonSyntax,
  checkMarkdownStructure,
  checkStagedSafety,
  checkTextHygiene,
  checkYamlSyntax
} from "./checks";
import { checkCommandParityWithCI } from "./ci";
import { loadConfig } from "./config";
import { checkEvidencePolicy, collectEvidenceRecords } from "./evidence";
import { runTransactionalFixes } from "./fixes";
import { evaluateGovernance } from "./governance";
import { buildImpactPlan, checkImpactPlan } from "./impact";
import { resolvePushRange } from "./push";
import { collectGateFiles } from "./snapshot";
import { inspectTools } from "./tools";
import {
  type AdviceSignal,
  GATE_PRE_GIT_VERSION,
  type GateCheck,
  type GateFinding,
  type GateFix,
  type GateOptions,
  type GateReport
} from "./types";
import { checkGitHubAuditWorkflow, shouldCheckGitHubAuditWorkflow } from "./workflow";

export function runGate(options: GateOptions): GateReport {
  const started = Date.now();
  const target = resolve(options.target);
  const config = loadConfig(target, options.configPath);
  let fileSnapshots = collectGateFiles(target, options.mode, options.all, config.ignoreDirs, options.base);
  let files = fileSnapshots.map((file) => file.path);
  const advice = computeAdvice(files);
  const tools = inspectTools(target);
  let fixesApplied: GateFix[] = [];
  let filesStaged: string[] = [];
  let precheckFindings: GateFinding[] = [];
  if ((options.mode === "push" || options.mode === "audit") && !options.all) {
    const pushRange = resolvePushRange(target, { base: options.base });
    precheckFindings = pushRange.warnings.map((warning) => ({
      severity: "info",
      code: "push_range",
      message: warning,
      source: "push_range"
    }));
  }

  if (options.mode === "advice") {
    return {
      ok: true,
      version: GATE_PRE_GIT_VERSION,
      mode: options.mode,
      target,
      files,
      findings: [],
      fixesApplied: [],
      filesStaged: [],
      governance: [],
      evidence: [],
      impact: [],
      tools,
      checks: [],
      advice,
      durationMs: Date.now() - started
    };
  }

  if (options.mode === "staged" || options.mode === "fix") {
    const result = runTransactionalFixes(target, fileSnapshots, config);
    fixesApplied = result.fixesApplied;
    filesStaged = result.filesStaged;
    precheckFindings = result.findings;
    fileSnapshots = collectGateFiles(target, options.mode, options.all, config.ignoreDirs, options.base);
    files = fileSnapshots.map((file) => file.path);
  }

  const governance = evaluateGovernance(target, fileSnapshots);
  const impact = buildImpactPlan(target, files, governance.records, config, options.mode);
  const baseChecks = [
    checkStagedSafety(target, fileSnapshots, config),
    checkTextHygiene(target, fileSnapshots, config),
    checkJsonSyntax(target, fileSnapshots),
    checkYamlSyntax(target, fileSnapshots),
    checkMarkdownStructure(target, fileSnapshots, config),
    governance.check,
    checkImpactPlan(impact),
    ...(options.mode === "push" ? [checkCommandParityWithCI(target, config)] : []),
    ...(shouldCheckGitHubAuditWorkflow(files) ? [checkGitHubAuditWorkflow(target)] : []),
    checkAdapterPlan(target, files, config.tools),
    ...(options.runCommands ? runAdapterChecks(target, files, { enabledTools: config.tools }) : []),
    checkGitDiffWhitespace(target, options.mode),
    ...(options.runCommands ? checkConfiguredCommands(target, options.mode, config) : [])
  ];
  const evidence = collectEvidenceRecords(baseChecks, governance.records, files, options.mode);
  const checks = [
    ...baseChecks,
    ...(options.runCommands && shouldEnforceEvidence(options.mode)
      ? [checkEvidencePolicy(governance.records, evidence)]
      : [])
  ];
  const findings = [...precheckFindings, ...findingsFromChecks(checks)];

  return {
    ok: findings.every((finding) => finding.severity !== "error") && checks.every((check) => check.status !== "failed"),
    version: GATE_PRE_GIT_VERSION,
    mode: options.mode,
    target,
    files,
    findings,
    fixesApplied,
    filesStaged,
    governance: governance.records,
    evidence,
    impact,
    tools,
    checks,
    advice,
    durationMs: Date.now() - started
  };
}

function shouldEnforceEvidence(mode: GateOptions["mode"]): boolean {
  return mode === "check" || mode === "push";
}

function checkAdapterPlan(target: string, files: string[], enabledTools: readonly string[]): GateCheck {
  const started = Date.now();
  const enabled = new Set(enabledTools);
  const commands = buildAdapterCommands(files, "check", target).filter((command) => enabled.has(command.adapter));
  return {
    name: "adapter_plan",
    status: "passed",
    failures: [],
    warnings: [],
    details: commands.map((command) => `${command.adapter}:${command.risk}:${command.shell}`),
    durationMs: Date.now() - started
  };
}

function computeAdvice(files: string[]): AdviceSignal[] {
  const signals = new Set<AdviceSignal>();

  if (files.length === 0) signals.add("no_changed_files");
  if (files.length > 0 && files.every((file) => file.endsWith(".md") || file.startsWith("docs/"))) {
    signals.add("doc_only_change_detected");
  }
  if (files.some((file) => file.startsWith("src/")) && !files.some((file) => file.startsWith("tests/"))) {
    signals.add("source_without_test_change");
  }
  if (
    files.some(
      (file) =>
        file.startsWith("server/api/") || file.startsWith("app/") || file.includes("secret") || file.includes(".env")
    )
  ) {
    signals.add("surface_sensitive_change_detected");
  }
  if (
    files.some(
      (file) =>
        file === "package.json" ||
        file === "tsconfig.json" ||
        file.startsWith("tools/") ||
        file.startsWith(".github/workflows/") ||
        file.includes("gate-pre-git")
    )
  ) {
    signals.add("tooling_or_gate_changed");
  }

  return [...signals].sort();
}

function findingsFromChecks(checks: GateCheck[]): GateFinding[] {
  return checks.flatMap((check) => [
    ...check.failures.map((message) => ({
      severity: "error" as const,
      code: check.name,
      message,
      file: fileFromMessage(message),
      source: check.name
    })),
    ...check.warnings.map((message) => ({
      severity: "warning" as const,
      code: check.name,
      message,
      file: fileFromMessage(message),
      source: check.name
    }))
  ]);
}

function fileFromMessage(message: string): string | undefined {
  const evidenceMatch = message.match(/^missing required evidence: ([^ ]+) requires /);
  if (evidenceMatch?.[1] !== undefined) return evidenceMatch[1];

  const [prefix] = message.split(":");
  if (prefix !== undefined && /\.[a-z0-9]+$/i.test(prefix) && !prefix.includes(" ")) return prefix;
  return undefined;
}
