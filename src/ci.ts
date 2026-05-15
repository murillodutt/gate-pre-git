import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { parseDocument } from "yaml";
import { loadConfig } from "./config";
import type { CommandCheckConfig, GateCheck, GateConfig } from "./types";

export type PackageManager = "bun" | "pnpm" | "npm" | "yarn";

export type CommandParityReport = {
  ok: boolean;
  target: string;
  packageManager: PackageManager;
  workflowScripts: string[];
  configuredPushScripts: string[];
  missing: string[];
  extra: string[];
  suggestedCommandChecks: CommandCheckConfig[];
};

const NON_SCRIPT_SHORTCUTS = new Set([
  "add",
  "audit",
  "ci",
  "create",
  "dlx",
  "exec",
  "init",
  "install",
  "link",
  "outdated",
  "pack",
  "publish",
  "remove",
  "run",
  "unlink",
  "update",
  "upgrade",
  "why",
  "x"
]);

export function detectPackageManager(target: string | undefined): PackageManager {
  if (target === undefined) return "bun";
  if (existsSync(join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(target, "bun.lock")) || existsSync(join(target, "bun.lockb"))) return "bun";
  if (existsSync(join(target, "package-lock.json")) || existsSync(join(target, "npm-shrinkwrap.json"))) return "npm";
  if (existsSync(join(target, "yarn.lock"))) return "yarn";
  return "bun";
}

export function packageManagerRunCommand(manager: PackageManager, script: string): string {
  return `${manager} run ${script}`;
}

export function workflowCommandChecks(target: string | undefined): CommandCheckConfig[] {
  if (target === undefined) return [];
  const manager = detectPackageManager(target);
  return detectWorkflowPackageScripts(target).map((script) => ({
    name: script,
    run: packageManagerRunCommand(manager, script),
    modes: ["push"]
  }));
}

export function detectWorkflowPackageScripts(target: string): string[] {
  const scripts = readPackageScripts(target);
  const knownScripts = new Set(Object.keys(scripts));
  if (knownScripts.size === 0) return [];

  const found: string[] = [];
  const seen = new Set<string>();
  for (const workflowPath of workflowPaths(target)) {
    const text = readFileSync(workflowPath, "utf8");
    for (const run of workflowRunSteps(text)) {
      for (const script of packageScriptsFromRun(run, knownScripts)) {
        if (seen.has(script)) continue;
        seen.add(script);
        found.push(script);
      }
    }
  }
  return found;
}

export function checkCommandParityWithCI(target: string, config: GateConfig): GateCheck {
  const started = Date.now();
  const report = buildCommandParityReport(target, config);
  const failures = config.policy.requireCommandParityWithCI
    ? report.missing.map((script) => `CI package script missing from push commandChecks: ${script}`)
    : [];
  const warnings = config.policy.requireCommandParityWithCI
    ? []
    : report.missing.map((script) => `CI package script absent from push commandChecks: ${script}`);

  return {
    name: "command_ci_parity",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings,
    details: [
      `package_manager=${report.packageManager}`,
      `workflow_scripts=${report.workflowScripts.join(",") || "none"}`,
      `configured_push_scripts=${report.configuredPushScripts.join(",") || "none"}`,
      `missing=${report.missing.join(",") || "none"}`
    ],
    durationMs: Date.now() - started
  };
}

export function buildCommandParityReport(target: string, config: GateConfig = loadConfig(target)): CommandParityReport {
  const workflowScripts = detectWorkflowPackageScripts(target);
  const configuredPushScripts = configuredPushCommandNames(config.commandChecks);
  const missing = workflowScripts.filter((script) => !configuredPushScripts.includes(script));
  const extra = configuredPushScripts.filter((script) => !workflowScripts.includes(script));
  const packageManager = detectPackageManager(target);

  return {
    ok: missing.length === 0,
    target,
    packageManager,
    workflowScripts,
    configuredPushScripts,
    missing,
    extra,
    suggestedCommandChecks: workflowScripts.map((script) => ({
      name: script,
      run: packageManagerRunCommand(packageManager, script),
      modes: ["push"]
    }))
  };
}

function readPackageScripts(target: string): Record<string, string> {
  const packagePath = join(target, "package.json");
  if (!existsSync(packagePath)) return {};
  try {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: unknown };
    if (!isRecord(pkg.scripts)) return {};
    return Object.fromEntries(
      Object.entries(pkg.scripts).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
  } catch {
    return {};
  }
}

function workflowPaths(target: string): string[] {
  const workflowDir = join(target, ".github", "workflows");
  if (!existsSync(workflowDir)) return [];
  return readdirSync(workflowDir)
    .filter((entry) => [".yml", ".yaml"].includes(extname(entry)))
    .map((entry) => join(workflowDir, entry))
    .sort();
}

function workflowRunSteps(text: string): string[] {
  const doc = parseDocument(text, { prettyErrors: false });
  if (doc.errors.length > 0) return [];
  return collectRunSteps(doc.toJSON());
}

function collectRunSteps(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectRunSteps);
  if (!isRecord(value)) return [];

  const direct = typeof value.run === "string" ? [value.run] : [];
  const nested = Object.entries(value)
    .filter(([key]) => key !== "run")
    .flatMap(([, nestedValue]) => collectRunSteps(nestedValue));
  return [...direct, ...nested];
}

function packageScriptsFromRun(run: string, knownScripts: ReadonlySet<string>): string[] {
  const scripts: string[] = [];
  const seen = new Set<string>();
  for (const command of shellCommandFragments(run)) {
    for (const script of scriptsFromCommand(command)) {
      if (!knownScripts.has(script) || seen.has(script)) continue;
      seen.add(script);
      scripts.push(script);
    }
  }
  return scripts;
}

function shellCommandFragments(run: string): string[] {
  return run
    .split(/\r?\n/)
    .flatMap((line) => line.split(/\s*(?:&&|;)\s*/))
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.replace(/^corepack\s+/, ""));
}

function scriptsFromCommand(command: string): string[] {
  return [
    ...matches(command, /\bbun\s+run\s+([A-Za-z0-9:_-]+)/g),
    ...matches(command, /\bpnpm\s+run\s+([A-Za-z0-9:_-]+)/g),
    ...scriptShortcuts(command, /\bpnpm\s+([A-Za-z0-9:_-]+)/g),
    ...matches(command, /\bnpm\s+run(?:-script)?\s+([A-Za-z0-9:_-]+)/g),
    ...matches(command, /\bnpm\s+(test|start|stop|restart)\b/g),
    ...matches(command, /\byarn\s+run\s+([A-Za-z0-9:_-]+)/g),
    ...scriptShortcuts(command, /\byarn\s+([A-Za-z0-9:_-]+)/g)
  ];
}

function matches(command: string, pattern: RegExp): string[] {
  return [...command.matchAll(pattern)]
    .map((match) => match[1])
    .filter((value): value is string => value !== undefined);
}

function scriptShortcuts(command: string, pattern: RegExp): string[] {
  return matches(command, pattern).filter((script) => !NON_SCRIPT_SHORTCUTS.has(script));
}

function configuredPushCommandNames(commandChecks: readonly CommandCheckConfig[]): string[] {
  return commandChecks
    .filter((command) => command.modes === undefined || command.modes.includes("push"))
    .map((command) => command.name)
    .sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
