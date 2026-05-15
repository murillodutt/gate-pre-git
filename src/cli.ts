#!/usr/bin/env bun
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { toAuditJson, toSarif } from "./audit";
import { buildCommandParityReport, type CommandParityReport } from "./ci";
import { runDoctor } from "./doctor";
import { runGate } from "./gate";
import { initProject, installHook } from "./installer";
import { buildAuditManifest } from "./manifest";
import { isGateProfile } from "./profiles";
import { auditReleaseArtifacts, buildReleasePlan, type ReleaseReport, writeReleaseArtifacts } from "./release";
import { writeDefaultLock } from "./tools";
import {
  GATE_PRE_GIT_VERSION,
  type GateMode,
  type GateOptions,
  type GateProfile,
  type GateReport,
  type HookKind
} from "./types";
import { applyVersionBump, auditVersion, planVersionChange, type VersionReport } from "./versioning";

type ParsedArgs = GateOptions & {
  command: GateMode | "init" | "install-hook" | "help" | "version" | "release" | "sync-ci";
  versionAction?: "plan" | "bump" | "audit";
  versionBump?: string;
  releaseAction?: "plan" | "write" | "audit";
  fromRef?: string;
  toRef?: string;
  yes: boolean;
  force: boolean;
  hookCommand?: string;
  hookKind: HookKind;
  profile: GateProfile;
  format: "text" | "json" | "sarif";
};

const args = parseArgs(process.argv.slice(2));

try {
  if (args.command === "help") {
    printHelp();
    process.exit(0);
  }
  if (args.command === "version") {
    if (args.versionAction === undefined) {
      console.log(GATE_PRE_GIT_VERSION);
      process.exit(0);
    }
    const report =
      args.versionAction === "plan"
        ? planVersionChange({ target: args.target, bump: args.versionBump })
        : args.versionAction === "bump"
          ? applyVersionBump({ target: args.target, bump: args.versionBump })
          : auditVersion({ target: args.target });
    printVersionReport(report, args.format);
    process.exit(report.ok ? 0 : 1);
  }
  if (args.command === "release") {
    const releaseOptions = { target: args.target, from: args.fromRef, to: args.toRef };
    const report =
      args.releaseAction === "write"
        ? writeReleaseArtifacts(releaseOptions)
        : args.releaseAction === "audit"
          ? auditReleaseArtifacts(releaseOptions)
          : buildReleasePlan(releaseOptions);
    printReleaseReport(report, args.format);
    process.exit(report.ok ? 0 : 1);
  }
  if (args.command === "update-tools") {
    const lock = writeDefaultLock(args.target);
    console.log(`gate_pre_git=passed`);
    console.log(`mode=update-tools`);
    console.log(`target=${resolve(args.target)}`);
    console.log(`lock=.gate-pre-git/lock.json`);
    console.log(`tools=${Object.keys(lock.tools).sort().join(",")}`);
    process.exit(0);
  }
  if (args.command === "sync-ci") {
    const report = buildCommandParityReport(args.target);
    printCommandParityReport(report, args.format);
    process.exit(report.ok ? 0 : 1);
  }
  if (args.command === "init") {
    const result = initProject({
      target: args.target,
      yes: args.yes,
      force: args.force,
      profile: args.profile,
      hook: args.hookKind,
      command: args.hookCommand ?? defaultHookCommand()
    });
    console.log(`init=${args.yes ? "applied" : "dry_run"}`);
    console.log(`profile=${args.profile}`);
    console.log(`config=${result.configPath}`);
    console.log(`biome_config=${result.biomeConfigPath}`);
    console.log(`lock=${result.lockPath}`);
    console.log(`bin=${result.binPath}`);
    console.log(`runtime=${result.runtimePath}`);
    console.log(`pre_commit_hook=${result.preCommitHookPath}`);
    console.log(`pre_push_hook=${result.prePushHookPath}`);
    console.log(`workflow=${result.workflowPath}`);
    console.log(`wrote_config=${result.wroteConfig}`);
    console.log(`wrote_biome_config=${result.wroteBiomeConfig}`);
    console.log(`installed_pre_commit_hook=${result.installedHook}`);
    console.log(`installed_pre_push_hook=${result.installedPrePushHook}`);
    console.log(`patched_package=${result.patchedPackage}`);
    if (!args.yes) console.log("rerun_with=--yes");
    process.exit(0);
  }
  if (args.command === "install-hook") {
    const result = installHook(
      args.target,
      args.yes,
      args.hookCommand ?? defaultHookCommand(),
      args.hookKind,
      args.force
    );
    if (result.installed) {
      console.log(`hook_installed=${result.path}`);
    } else {
      console.log(`hook_path=${result.path}`);
      console.log(result.text.trimEnd());
    }
    process.exit(0);
  }
  if (args.command === "doctor") {
    const report = runDoctor(args.target);
    printReport(report, args.format);
    process.exit(report.ok ? 0 : 1);
  }

  const report = runGate(args);
  printReport(report, args.format);
  process.exit(report.ok ? 0 : 1);
} catch (error) {
  console.error(`gate_pre_git=failed`);
  console.error(`error=${(error as Error).message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): ParsedArgs {
  if (argv[0] === "--help" || argv[0] === "-h") argv = ["help", ...argv.slice(1)];
  const command = parseCommand(argv[0]);
  const versionAction = command === "version" ? parseVersionAction(argv[1]) : undefined;
  const versionBump = command === "version" ? parseVersionBump(argv, versionAction) : undefined;
  const releaseAction = command === "release" ? parseReleaseAction(argv[1]) : undefined;
  const target = valueAfter(argv, "--target") ?? process.cwd();
  const configPath = valueAfter(argv, "--config");
  const hookCommand = valueAfter(argv, "--command");
  const hookKind = parseHookKind(valueAfter(argv, "--hook") ?? "native");
  const profile = parseProfile(valueAfter(argv, "--profile") ?? "auto");
  const format = parseFormat(valueAfter(argv, "--format") ?? (argv.includes("--json") ? "json" : "text"));
  const mode = isGateMode(command) ? command : "check";
  return {
    command,
    versionAction,
    versionBump,
    releaseAction,
    target,
    mode,
    all: argv.includes("--all"),
    json: format === "json",
    runCommands: !argv.includes("--no-commands"),
    configPath,
    base: valueAfter(argv, "--base"),
    fromRef: valueAfter(argv, "--from"),
    toRef: valueAfter(argv, "--to"),
    yes: argv.includes("--yes"),
    force: argv.includes("--force"),
    hookCommand,
    hookKind,
    profile,
    format
  };
}

function parseCommand(value: string | undefined): ParsedArgs["command"] {
  if (value === undefined) return "help";
  if (
    [
      "check",
      "staged",
      "fix",
      "push",
      "audit",
      "advice",
      "doctor",
      "update-tools",
      "sync-ci",
      "init",
      "install-hook",
      "help",
      "version",
      "release"
    ].includes(value)
  ) {
    return value as ParsedArgs["command"];
  }
  throw new Error(`unknown command: ${value}`);
}

function parseVersionAction(value: string | undefined): ParsedArgs["versionAction"] {
  if (value === undefined || value.startsWith("--")) return undefined;
  if (value === "plan" || value === "bump" || value === "audit") return value;
  throw new Error(`unknown version action: ${value}`);
}

function parseVersionBump(argv: string[], action: ParsedArgs["versionAction"]): string | undefined {
  if (action !== "plan" && action !== "bump") return undefined;
  const value = argv[2];
  if (value === undefined || value.startsWith("--")) return "patch";
  return value;
}

function parseReleaseAction(value: string | undefined): ParsedArgs["releaseAction"] {
  if (value === undefined || value.startsWith("--")) return "plan";
  if (value === "plan" || value === "write" || value === "audit") return value;
  throw new Error(`unknown release action: ${value}`);
}

function isGateMode(value: ParsedArgs["command"]): value is GateMode {
  return ["check", "staged", "fix", "push", "audit", "advice", "doctor", "update-tools"].includes(value);
}

function parseHookKind(value: string): HookKind {
  if (value === "native" || value === "husky") return value;
  throw new Error(`unknown hook kind: ${value}`);
}

function parseProfile(value: string): GateProfile {
  if (isGateProfile(value)) return value;
  throw new Error(`unknown profile: ${value}`);
}

function parseFormat(value: string): ParsedArgs["format"] {
  if (value === "text" || value === "json" || value === "sarif") return value;
  throw new Error(`unknown format: ${value}`);
}

function valueAfter(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`missing value for ${name}`);
  return value;
}

function printReport(report: GateReport, format: "text" | "json" | "sarif"): void {
  if (format === "sarif") {
    console.log(toSarif(report));
    return;
  }
  if (format === "json") {
    if (report.mode === "audit") {
      console.log(toAuditJson(report));
      return;
    }
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`version=${report.version}`);
  console.log(`mode=${report.mode}`);
  console.log(`target=${report.target}`);
  console.log(`files=${report.files.length}`);
  console.log(`advice=${report.advice.join(",") || "none"}`);
  console.log(`findings=${report.findings.length}`);
  if (report.mode === "audit") console.log(`manifest_hash=${buildAuditManifest(report).hash}`);
  console.log(`fixes_applied=${report.fixesApplied.length}`);
  console.log(`files_staged=${report.filesStaged.join(",") || "none"}`);
  console.log(
    `tools=${report.tools.length === 0 ? "none" : report.tools.map((tool) => `${tool.name}:${tool.status}`).join(",")}`
  );
  for (const finding of report.findings) {
    console.log(
      `finding.${finding.severity}.${finding.code}=${finding.file === undefined ? finding.message : `${finding.file}: ${finding.message}`}`
    );
  }
  for (const fix of report.fixesApplied) {
    console.log(`fix.${fix.tool}=${fix.file}:${fix.action}:staged=${fix.staged}`);
  }
  for (const check of report.checks) {
    console.log(`check.${check.name}=${check.status}`);
    for (const detail of check.details) console.log(`detail.${check.name}=${detail}`);
    for (const warning of check.warnings) console.log(`warning.${check.name}=${warning}`);
    for (const failure of check.failures) console.log(`failure.${check.name}=${failure}`);
  }
  console.log(`duration_ms=${report.durationMs}`);
}

function printVersionReport(report: VersionReport, format: "text" | "json" | "sarif"): void {
  if (format === "sarif") throw new Error("version reports do not support SARIF");
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`mode=version:${report.action}`);
  console.log(`target=${resolve(report.target)}`);
  console.log(`source=${report.source === null ? "none" : `${report.source.path}:${report.source.version}`}`);
  console.log(`current_version=${report.currentVersion ?? "none"}`);
  if (report.nextVersion !== undefined) console.log(`next_version=${report.nextVersion}`);
  console.log(`targets=${report.targets.length}`);
  console.log(`updated=${report.updated.join(",") || "none"}`);
  for (const versionTarget of report.targets) {
    console.log(
      `target.${versionTarget.kind}=${versionTarget.path}:${versionTarget.currentVersion ?? "missing-or-invalid"}`
    );
  }
  for (const warning of report.warnings) console.log(`warning.version=${warning}`);
  for (const failure of report.failures) console.log(`failure.version=${failure}`);
  console.log(`duration_ms=${report.durationMs}`);
}

function printReleaseReport(report: ReleaseReport, format: "text" | "json" | "sarif"): void {
  if (format === "sarif") throw new Error("release reports do not support SARIF");
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`mode=release:${report.action}`);
  console.log(`target=${resolve(report.target)}`);
  console.log(`project=${report.project ?? "unknown"}`);
  console.log(`version=${report.version ?? "unknown"}`);
  console.log(`range=${report.range ?? "unknown"}`);
  console.log(`entries=${report.entries.length}`);
  console.log(`excluded=${report.excludedCommits.length}`);
  console.log(`updated=${report.updated.join(",") || "none"}`);
  if (report.artifactHash !== null) console.log(`artifact_hash=${report.artifactHash}`);
  for (const entry of report.entries) {
    const component = entry.component === undefined ? "" : `:${entry.component}`;
    console.log(`entry.${entry.category}${component}=${entry.commitHash}:${entry.title}`);
  }
  for (const excluded of report.excludedCommits) {
    console.log(`excluded.${excluded.reason}=${excluded.commitHash}:${excluded.subject}`);
  }
  for (const warning of report.warnings) console.log(`warning.release=${warning}`);
  for (const failure of report.failures) console.log(`failure.release=${failure}`);
  console.log(`duration_ms=${report.durationMs}`);
}

function printCommandParityReport(report: CommandParityReport, format: "text" | "json" | "sarif"): void {
  if (format === "sarif") throw new Error("sync-ci reports do not support SARIF");
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`mode=sync-ci`);
  console.log(`target=${resolve(report.target)}`);
  console.log(`package_manager=${report.packageManager}`);
  console.log(`workflow_scripts=${report.workflowScripts.join(",") || "none"}`);
  console.log(`configured_push_scripts=${report.configuredPushScripts.join(",") || "none"}`);
  console.log(`missing=${report.missing.join(",") || "none"}`);
  console.log(`extra=${report.extra.join(",") || "none"}`);
  for (const command of report.suggestedCommandChecks) {
    console.log(`suggested.${command.name}=${command.run}:modes=${command.modes?.join(",") ?? "all"}`);
  }
}

function printHelp(): void {
  console.log(`gate-pre-git

Usage:
  gate-pre-git check [--all] [--target DIR] [--config FILE] [--json] [--no-commands]
  gate-pre-git staged [--target DIR] [--json]
  gate-pre-git fix [--all] [--target DIR] [--json]
  gate-pre-git push [--target DIR] [--base origin/main] [--json]
  gate-pre-git audit [--target DIR] [--format json|sarif]
  gate-pre-git advice [--target DIR] [--json]
  gate-pre-git doctor [--target DIR] [--json]
  gate-pre-git update-tools [--target DIR]
  gate-pre-git sync-ci [--target DIR] [--json]
  gate-pre-git version [plan|bump|audit] [patch|minor|major|x.y.z[-tag]] [--target DIR]
  gate-pre-git release [plan|write|audit] [--target DIR] [--from REF] [--to REF]
  gate-pre-git init [--target DIR] [--profile auto|strict|node|nuxt|docs|python|go|rust|security] [--hook native|husky] [--yes]
  gate-pre-git install-hook [--target DIR] [--hook native|husky] [--command CMD] [--yes]

Commands:
  check         Run portable pre-GitHub checks over changed files, or all files with --all.
  staged        Run the commit-boundary checks over the real staged snapshot.
  fix           Apply trusted local fixers and stage their output.
  push          Run local pre-push checks against the configured base.
  audit         Emit the minimum GitHub audit report as JSON or SARIF.
  advice        Print non-blocking risk signals for the current change set.
  doctor        Fail unless config, hooks, lockfile, package scripts, tools, and smoke checks are wired.
  update-tools  Rewrite the explicit tool lock and local shims.
  sync-ci       Compare package scripts invoked by GitHub workflows with push commandChecks.
  version       Plan, apply, or audit synchronized project version targets.
  release       Plan, write, or audit changelog and release-note artifacts.
  init          Apply the vendored recipe. Dry-run by default; write with --yes.
  install-hook  Print or install a native Git/Husky pre-commit hook.
`);
}

function defaultHookCommand(): string {
  const cliPath = fileURLToPath(import.meta.url);
  const argvPath = process.argv[1] === undefined ? cliPath : resolve(process.argv[1]);
  if (argvPath.endsWith("src/cli.ts")) return `bun "${argvPath}"`;
  return "gate-pre-git";
}
