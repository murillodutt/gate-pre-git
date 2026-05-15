import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { checkCommandParityWithCI } from "./ci";
import { loadConfig } from "./config";
import { runGate } from "./gate";
import { defaultGovernanceMap } from "./installer";
import { defaultLock, inspectTools, lockPath, readLock } from "./tools";
import type { GateCheck, GateReport } from "./types";
import { GATE_PRE_GIT_VERSION } from "./types";
import { auditVersion } from "./versioning";
import { checkGitHubAuditWorkflow } from "./workflow";

export function runDoctor(target: string, commandProbe = "gate-pre-git"): GateReport {
  const started = Date.now();
  const toolReports = inspectTools(target);
  const config = loadConfig(target);
  const checks: GateCheck[] = [
    structuralCheck("vendored_config", target, ".gate-pre-git/config.json"),
    governanceMapCheck(target),
    structuralCheck("tool_lock", target, ".gate-pre-git/lock.json"),
    toolLockDriftCheck(target),
    structuralCheck("vendored_launcher", target, ".gate-pre-git/bin/gate-pre-git"),
    structuralCheck("vendored_runtime", target, ".gate-pre-git/runtime/cli.js"),
    launcherPortabilityCheck(target),
    launcherExecutionCheck(target),
    checkGitHubAuditWorkflow(target),
    checkCommandParityWithCI(target, config),
    hookCheck(target, "pre-commit"),
    hookCheck(target, "pre-push"),
    packageScriptCheck(target),
    versionSyncCheck(target),
    binaryReferenceCheck(target, commandProbe),
    toolCacheCheck(toolReports),
    smokeCheck()
  ];

  const selfCheck = runGate({
    target,
    mode: "check",
    all: true,
    json: false,
    runCommands: false
  });

  checks.push({
    name: "self_check",
    status: selfCheck.ok ? "passed" : "failed",
    failures: selfCheck.checks.flatMap((check) => check.failures.map((failure) => `${check.name}: ${failure}`)),
    warnings: [],
    details: [`files=${selfCheck.files.length}`],
    durationMs: selfCheck.durationMs
  });

  const findings = [
    ...selfCheck.findings,
    ...checks.flatMap((check) =>
      check.failures.map((failure) => ({
        severity: "error" as const,
        code: check.name,
        message: failure,
        source: check.name
      }))
    )
  ];

  return {
    ok: checks.every((check) => check.status !== "failed") && selfCheck.ok,
    version: GATE_PRE_GIT_VERSION,
    mode: "doctor",
    target,
    files: selfCheck.files,
    findings,
    fixesApplied: [],
    filesStaged: [],
    governance: selfCheck.governance,
    evidence: selfCheck.evidence,
    impact: selfCheck.impact,
    tools: toolReports,
    checks,
    advice: selfCheck.advice,
    durationMs: Date.now() - started
  };
}

function versionSyncCheck(target: string): GateCheck {
  const report = auditVersion({ target });
  return {
    name: "version_sync",
    status: report.ok ? "passed" : "failed",
    failures: report.failures,
    warnings: report.warnings,
    details: report.targets.map((target) => `${target.path}=${target.currentVersion ?? "missing-or-invalid"}`),
    durationMs: report.durationMs
  };
}

function launcherExecutionCheck(target: string): GateCheck {
  const started = Date.now();
  const relativePath = ".gate-pre-git/bin/gate-pre-git";
  const path = join(target, relativePath);
  if (!existsSync(path)) return structuralCheck("launcher_execution", target, relativePath);

  try {
    const output = execFileSync(path, ["version"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10000
    }).trim();
    const failures =
      output === GATE_PRE_GIT_VERSION ? [] : [`vendored launcher returned unexpected version: ${output}`];
    return {
      name: "launcher_execution",
      status: failures.length === 0 ? "passed" : "failed",
      failures,
      warnings: [],
      details: [relativePath],
      durationMs: Date.now() - started
    };
  } catch (error) {
    const processError = error as Error & { stderr?: Buffer | string; stdout?: Buffer | string };
    const stderr = processError.stderr === undefined ? "" : String(processError.stderr).trim();
    const stdout = processError.stdout === undefined ? "" : String(processError.stdout).trim();
    return {
      name: "launcher_execution",
      status: "failed",
      failures: [`vendored launcher failed to execute: ${stderr || stdout || processError.message}`],
      warnings: [],
      details: [relativePath],
      durationMs: Date.now() - started
    };
  }
}

function launcherPortabilityCheck(target: string): GateCheck {
  const relativePath = ".gate-pre-git/bin/gate-pre-git";
  const path = join(target, relativePath);
  if (!existsSync(path)) return structuralCheck("launcher_portability", target, relativePath);

  const text = readFileSync(path, "utf8");
  const failures = [
    ...(text.includes("/Users/") ? ["vendored launcher contains a user-local absolute path"] : []),
    ...(text.includes("repo_root=") ? [] : ["vendored launcher does not resolve the repository root"]),
    ...(text.includes(".gate-pre-git/runtime/cli.js") ||
    text.includes(".gate-pre-git/runtime/cli.ts") ||
    text.includes("src/cli.ts")
      ? []
      : ["vendored launcher does not reference a portable local runtime candidate"])
  ];

  return {
    name: "launcher_portability",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [relativePath],
    durationMs: 0
  };
}

function governanceMapCheck(target: string): GateCheck {
  const governancePath = ".gate-pre-git/governance.json";
  const vendored = [
    ".gate-pre-git/config.json",
    ".gate-pre-git/lock.json",
    ".gate-pre-git/bin/gate-pre-git",
    ".gate-pre-git/runtime/cli.js"
  ].some((relativePath) => existsSync(join(target, relativePath)));

  if (!vendored) {
    return {
      name: "governance_map",
      status: "skipped",
      failures: [],
      warnings: ["repo is not vendored"],
      details: [governancePath],
      durationMs: 0
    };
  }

  const path = join(target, governancePath);
  if (!existsSync(path)) return structuralCheck("governance_map", target, governancePath);

  const failures = governanceDriftFailures(JSON.parse(readFileSync(path, "utf8")) as GovernanceTemplate);
  return {
    name: "governance_map",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [governancePath],
    durationMs: 0
  };
}

type GovernanceTemplate = {
  zones?: Array<{
    name?: string;
    risk?: string;
    paths?: string[];
    requiredEvidence?: string[];
  }>;
  sensitivePaths?: string[];
  generatedPaths?: string[];
};

function governanceDriftFailures(actual: GovernanceTemplate): string[] {
  const expected = defaultGovernanceMap() as GovernanceTemplate;
  const actualZones = new Map((actual.zones ?? []).map((zone) => [zone.name, zone]));
  const failures: string[] = [];

  for (const expectedZone of expected.zones ?? []) {
    const actualZone = actualZones.get(expectedZone.name);
    if (expectedZone.name === undefined || actualZone === undefined) {
      failures.push(`missing base governance zone: ${expectedZone.name}`);
      continue;
    }
    if (riskRank(actualZone.risk) < riskRank(expectedZone.risk)) {
      failures.push(`weakened base risk for zone ${expectedZone.name}: expected ${expectedZone.risk}`);
    }
    for (const path of expectedZone.paths ?? []) {
      if (!actualZone.paths?.includes(path)) failures.push(`missing base path for zone ${expectedZone.name}: ${path}`);
    }
    for (const evidence of expectedZone.requiredEvidence ?? []) {
      if (!actualZone.requiredEvidence?.includes(evidence)) {
        failures.push(`missing base evidence for zone ${expectedZone.name}: ${evidence}`);
      }
    }
  }

  for (const sensitive of expected.sensitivePaths ?? []) {
    if (!actual.sensitivePaths?.includes(sensitive)) failures.push(`missing base sensitive path: ${sensitive}`);
  }
  for (const generated of expected.generatedPaths ?? []) {
    if (!actual.generatedPaths?.includes(generated)) failures.push(`missing base generated path: ${generated}`);
  }

  return failures;
}

function riskRank(risk: string | undefined): number {
  if (risk === "critical") return 4;
  if (risk === "high") return 3;
  if (risk === "medium") return 2;
  if (risk === "low") return 1;
  return 0;
}

function toolLockDriftCheck(target: string): GateCheck {
  const lock = readLock(target);
  if (lock === null) {
    return {
      name: "tool_lock_drift",
      status: "failed",
      failures: ["missing .gate-pre-git/lock.json"],
      warnings: [],
      details: [],
      durationMs: 0
    };
  }

  const expected = defaultLock();
  const failures: string[] = [];
  for (const [name, expectedTool] of Object.entries(expected.tools)) {
    const actual = lock.tools[name];
    if (actual === undefined) {
      failures.push(`missing locked tool: ${name}`);
      continue;
    }
    for (const key of ["kind", "package", "version", "command"] as const) {
      if (actual[key] !== expectedTool[key])
        failures.push(`tool lock drift for ${name}.${key}: expected ${expectedTool[key]}`);
    }
  }

  return {
    name: "tool_lock_drift",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [".gate-pre-git/lock.json"],
    durationMs: 0
  };
}

function structuralCheck(name: string, target: string, relativePath: string): GateCheck {
  const path = join(target, relativePath);
  const ok = existsSync(path);
  return {
    name,
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`missing ${relativePath}`],
    warnings: [],
    details: [relativePath],
    durationMs: 0
  };
}

function hookCheck(target: string, hook: "pre-commit" | "pre-push"): GateCheck {
  const nativeHook = nativeHookPath(target, hook);
  const huskyHook = join(target, ".husky", hook);
  const hookPath =
    nativeHook !== null && existsSync(nativeHook) ? nativeHook : existsSync(huskyHook) ? huskyHook : null;
  const text = hookPath === null ? "" : readFileSync(hookPath, "utf8");
  const expectedCommand = hook === "pre-push" ? "push" : "staged";
  const ok = hookPath !== null && text.includes("gate-pre-git") && text.includes(expectedCommand);

  return {
    name: hook,
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`${hook} hook missing or not wired to gate-pre-git ${expectedCommand}`],
    warnings: [],
    details: hookPath === null ? [] : [hookPath],
    durationMs: 0
  };
}

function packageScriptCheck(target: string): GateCheck {
  const packagePath = join(target, "package.json");
  if (!existsSync(packagePath)) {
    return {
      name: "package_scripts",
      status: "skipped",
      failures: [],
      warnings: ["package.json not found"],
      details: [],
      durationMs: 0
    };
  }

  const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: Record<string, string> };
  const scripts = pkg.scripts ?? {};
  const required: Array<[string, string[]]> = [
    ["gate", [".gate-pre-git/bin/gate-pre-git check --all", "gate-pre-git check --all", "src/cli.ts check --all"]],
    ["gate:staged", [".gate-pre-git/bin/gate-pre-git staged", "gate-pre-git staged", "src/cli.ts staged"]],
    ["gate:doctor", [".gate-pre-git/bin/gate-pre-git doctor", "gate-pre-git doctor", "src/cli.ts doctor"]],
    ["gate:push", [".gate-pre-git/bin/gate-pre-git push", "gate-pre-git push"]],
    ["gate:audit", [".gate-pre-git/bin/gate-pre-git audit", "gate-pre-git audit"]],
    ["gate:release-plan", [".gate-pre-git/bin/gate-pre-git release plan", "gate-pre-git release plan"]],
    ["gate:version-audit", [".gate-pre-git/bin/gate-pre-git version audit", "gate-pre-git version audit"]]
  ];
  const failures = required
    .filter(([name, accepted]) => !accepted.some((needle) => scripts[name]?.includes(needle)))
    .map(([name]) => `package script missing or divergent: ${name}`);

  return {
    name: "package_scripts",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [],
    durationMs: 0
  };
}

function binaryReferenceCheck(target: string, commandProbe: string): GateCheck {
  const texts = [
    nativeHookPath(target, "pre-commit"),
    nativeHookPath(target, "pre-push"),
    join(target, ".husky", "pre-commit"),
    join(target, ".husky", "pre-push"),
    join(target, ".gate-pre-git", "bin", "gate-pre-git")
  ]
    .filter((path): path is string => path !== null)
    .filter(existsSync)
    .map((path) => readFileSync(path, "utf8"));
  const ok = texts.some(
    (text) =>
      text.includes(commandProbe) || text.includes("src/cli.ts") || text.includes(".gate-pre-git/bin/gate-pre-git")
  );

  return {
    name: "hook_command_reference",
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`hook does not reference ${commandProbe}, the vendored launcher, or a concrete CLI path`],
    warnings: [],
    details: [],
    durationMs: 0
  };
}

function toolCacheCheck(toolReports: ReturnType<typeof inspectTools>): GateCheck {
  const missingLock = toolReports.some((tool) => tool.name === "gate-lock" && tool.status === "missing");
  const missingShims = toolReports.filter((tool) => tool.status === "locked").map((tool) => tool.name);
  const failures = [
    ...(missingLock ? [`missing ${lockPath(".")}`] : []),
    ...missingShims.map((tool) => `tool shim missing for ${tool}`)
  ];

  return {
    name: "tool_cache",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: toolReports.map((tool) => `${tool.name}=${tool.status}`),
    durationMs: 0
  };
}

function smokeCheck(): GateCheck {
  const dir = join(tmpdir(), `gate-pre-git-doctor-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const started = Date.now();
  try {
    mkdirSync(dir, { recursive: true });
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "bad.json"), "{", "utf8");
    execFileSync("git", ["add", "bad.json"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "bad.json"), "{}\n", "utf8");
    const report = runGate({ target: dir, mode: "staged", all: false, json: false, runCommands: false });
    const ok = !report.ok && report.findings.some((finding) => finding.code === "json_syntax");
    return {
      name: "staged_snapshot_smoke",
      status: ok ? "passed" : "failed",
      failures: ok ? [] : ["staged smoke test did not catch invalid index content"],
      warnings: [],
      details: [],
      durationMs: Date.now() - started
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function nativeHookPath(target: string, hook: "pre-commit" | "pre-push"): string | null {
  try {
    const path = execFileSync("git", ["rev-parse", "--git-path", `hooks/${hook}`], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return isAbsolute(path) ? path : join(target, path);
  } catch {
    return null;
  }
}
