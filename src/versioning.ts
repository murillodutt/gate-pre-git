import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

export type VersionBumpInput = "patch" | "minor" | "major" | string;

export type VersionTargetKind = "version-file" | "package-json" | "gate-generated-by" | "typescript-constant";

export type VersionSource = {
  path: string;
  kind: "version-file" | "package-json";
  version: string;
};

export type VersionTarget = {
  path: string;
  kind: VersionTargetKind;
  currentVersion: string | null;
};

export type VersionReport = {
  ok: boolean;
  mode: "version";
  action: "plan" | "bump" | "audit";
  target: string;
  source: VersionSource | null;
  currentVersion: string | null;
  nextVersion?: string;
  targets: VersionTarget[];
  updated: string[];
  failures: string[];
  warnings: string[];
  durationMs: number;
};

type PackageJson = {
  name?: unknown;
  version?: unknown;
  workspaces?: unknown;
};

type VersionTargetInternal = VersionTarget & {
  absolutePath: string;
};

const GATE_GENERATED_BY_PREFIX = "gate-pre-git@";
const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/;
const TYPES_VERSION_RE =
  /export\s+const\s+GATE_PRE_GIT_VERSION\s*=\s*"gate-pre-git@(\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?)";/;

export function planVersionChange(options: { target: string; bump?: VersionBumpInput }): VersionReport {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish(started, "plan", options.target, state, [], state.failures, state.warnings);
  }

  const nextVersion = computeNextVersion(state.source.version, options.bump ?? "patch");
  return finish(
    started,
    "plan",
    options.target,
    state,
    [],
    auditFailures(state.source.version, state.targets),
    [],
    nextVersion
  );
}

export function auditVersion(options: { target: string }): VersionReport {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish(started, "audit", options.target, state, [], state.failures, state.warnings);
  }

  return finish(started, "audit", options.target, state, [], auditFailures(state.source.version, state.targets), []);
}

export function applyVersionBump(options: { target: string; bump?: VersionBumpInput }): VersionReport {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish(started, "bump", options.target, state, [], state.failures, state.warnings);
  }

  const preflightFailures = auditFailures(state.source.version, state.targets);
  const nextVersion = computeNextVersion(state.source.version, options.bump ?? "patch");
  if (preflightFailures.length > 0) {
    return finish(started, "bump", options.target, state, [], preflightFailures, [], nextVersion);
  }

  const updated: string[] = [];
  const failures: string[] = [];
  for (const target of state.targets) {
    try {
      writeVersionTarget(target, nextVersion);
      updated.push(target.path);
    } catch (error) {
      failures.push(`${target.path}: ${(error as Error).message}`);
    }
  }

  const after = inspectVersionState(options.target);
  const afterFailures = after.ok ? auditFailures(nextVersion, after.targets) : after.failures;
  return finish(started, "bump", options.target, state, updated, [...failures, ...afterFailures], [], nextVersion);
}

function inspectVersionState(
  target: string
):
  | { ok: true; source: VersionSource; targets: VersionTargetInternal[] }
  | { ok: false; failures: string[]; warnings: string[] } {
  const failures: string[] = [];
  const warnings: string[] = [];
  const source = detectVersionSource(target, failures);
  if (source === null) return { ok: false, failures, warnings };

  const targets = discoverVersionTargets(target, source, warnings);
  if (targets.length === 0) {
    failures.push("no version targets discovered");
    return { ok: false, failures, warnings };
  }

  return { ok: true, source, targets };
}

function detectVersionSource(target: string, failures: string[]): VersionSource | null {
  const versionFile = join(target, "VERSION");
  if (existsSync(versionFile)) {
    const version = readFileSync(versionFile, "utf8").trim();
    if (!isSemVer(version)) {
      failures.push(`VERSION contains invalid SemVer: ${version}`);
      return null;
    }
    return { path: "VERSION", kind: "version-file", version };
  }

  const packageJson = join(target, "package.json");
  if (!existsSync(packageJson)) {
    failures.push("no version source found: expected VERSION or package.json");
    return null;
  }

  const parsed = readJson<PackageJson>(packageJson);
  if (typeof parsed.version !== "string" || !isSemVer(parsed.version)) {
    failures.push(`package.json contains invalid or missing SemVer version: ${String(parsed.version)}`);
    return null;
  }

  return { path: "package.json", kind: "package-json", version: parsed.version };
}

function discoverVersionTargets(target: string, source: VersionSource, warnings: string[]): VersionTargetInternal[] {
  const targets = new Map<string, VersionTargetInternal>();
  const gateRuntimeProject = isGateRuntimeProject(target);
  const add = (path: string, kind: VersionTargetKind): void => {
    const absolutePath = join(target, path);
    if (!existsSync(absolutePath)) return;
    targets.set(path, {
      path,
      absolutePath,
      kind,
      currentVersion: readVersionTarget(absolutePath, kind)
    });
  };

  if (source.kind === "version-file") add("VERSION", "version-file");
  add("package.json", "package-json");
  for (const workspacePackage of discoverWorkspacePackages(target, warnings)) {
    add(workspacePackage, "package-json");
  }
  if (gateRuntimeProject) {
    add(".gate-pre-git/governance.json", "gate-generated-by");
    add(".gate-pre-git/lock.json", "gate-generated-by");
    add("src/types.ts", "typescript-constant");
  }

  return [...targets.values()].sort((left, right) => targetOrder(left).localeCompare(targetOrder(right)));
}

function isGateRuntimeProject(target: string): boolean {
  const packagePath = join(target, "package.json");
  if (existsSync(packagePath)) {
    const pkg = readJson<PackageJson>(packagePath);
    if (pkg.name === "gate-pre-git") return true;
  }

  const typesPath = join(target, "src", "types.ts");
  return existsSync(typesPath) && TYPES_VERSION_RE.test(readFileSync(typesPath, "utf8"));
}

function discoverWorkspacePackages(target: string, warnings: string[]): string[] {
  const rootPackagePath = join(target, "package.json");
  if (!existsSync(rootPackagePath)) return [];

  const rootPackage = readJson<PackageJson>(rootPackagePath);
  const workspacePatterns = workspacePatternsFrom(rootPackage.workspaces);
  const packages = new Set<string>();

  if (workspacePatterns.length > 0) {
    for (const pattern of workspacePatterns) {
      for (const packagePath of expandWorkspacePattern(target, pattern, warnings)) {
        if (packagePath !== "package.json") packages.add(packagePath);
      }
    }
    return [...packages].sort();
  }

  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const packagePath = join(entry.name, "package.json");
    if (existsSync(join(target, packagePath))) packages.add(packagePath);
  }
  return [...packages].sort();
}

function workspacePatternsFrom(workspaces: unknown): string[] {
  if (Array.isArray(workspaces)) return workspaces.filter((entry): entry is string => typeof entry === "string");
  if (isRecord(workspaces) && Array.isArray(workspaces.packages)) {
    return workspaces.packages.filter((entry): entry is string => typeof entry === "string");
  }
  return [];
}

function expandWorkspacePattern(target: string, pattern: string, warnings: string[]): string[] {
  const normalized = normalizePath(pattern);
  if (normalized.includes("..") || normalized.startsWith("/")) {
    warnings.push(`ignored unsafe workspace pattern: ${pattern}`);
    return [];
  }

  if (normalized.endsWith("/*")) {
    return packageJsonsOneLevel(target, normalized.slice(0, -2));
  }
  if (normalized.endsWith("/**")) {
    return packageJsonsRecursive(target, normalized.slice(0, -3));
  }
  if (normalized.endsWith("/package.json")) {
    return existsSync(join(target, normalized)) ? [normalized] : [];
  }
  if (!normalized.includes("*") && existsSync(join(target, normalized, "package.json"))) {
    return [normalizePath(join(normalized, "package.json"))];
  }

  warnings.push(`ignored unsupported workspace pattern: ${pattern}`);
  return [];
}

function packageJsonsOneLevel(target: string, base: string): string[] {
  const absoluteBase = join(target, base);
  if (!existsSync(absoluteBase)) return [];

  return readdirSync(absoluteBase, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules")
    .map((entry) => normalizePath(join(base, entry.name, "package.json")))
    .filter((path) => existsSync(join(target, path)))
    .sort();
}

function packageJsonsRecursive(target: string, base: string): string[] {
  const absoluteBase = join(target, base);
  if (!existsSync(absoluteBase)) return [];
  const packages: string[] = [];
  walkPackages(target, absoluteBase, packages);
  return packages.sort();
}

function walkPackages(root: string, dir: string, packages: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const child = join(dir, entry.name);
    const packageJson = join(child, "package.json");
    if (existsSync(packageJson)) packages.push(normalizePath(relative(root, packageJson)));
    walkPackages(root, child, packages);
  }
}

function readVersionTarget(path: string, kind: VersionTargetKind): string | null {
  if (kind === "version-file") {
    const version = readFileSync(path, "utf8").trim();
    return isSemVer(version) ? version : null;
  }

  if (kind === "package-json") {
    const parsed = readJson<PackageJson>(path);
    return typeof parsed.version === "string" && isSemVer(parsed.version) ? parsed.version : null;
  }

  if (kind === "gate-generated-by") {
    const parsed = readJson<{ generatedBy?: unknown }>(path);
    if (typeof parsed.generatedBy !== "string") return null;
    const version = parsed.generatedBy.startsWith(GATE_GENERATED_BY_PREFIX)
      ? parsed.generatedBy.slice(GATE_GENERATED_BY_PREFIX.length)
      : null;
    return version !== null && isSemVer(version) ? version : null;
  }

  const match = readFileSync(path, "utf8").match(TYPES_VERSION_RE);
  return match?.[1] ?? null;
}

function writeVersionTarget(target: VersionTargetInternal, version: string): void {
  if (target.kind === "version-file") {
    writeFileSync(target.absolutePath, `${version}\n`, "utf8");
    return;
  }

  if (target.kind === "package-json") {
    const parsed = readJson<Record<string, unknown>>(target.absolutePath);
    parsed.version = version;
    writeJson(target.absolutePath, parsed);
    return;
  }

  if (target.kind === "gate-generated-by") {
    const parsed = readJson<Record<string, unknown>>(target.absolutePath);
    parsed.generatedBy = `${GATE_GENERATED_BY_PREFIX}${version}`;
    writeJson(target.absolutePath, parsed);
    return;
  }

  const text = readFileSync(target.absolutePath, "utf8");
  if (!TYPES_VERSION_RE.test(text)) {
    throw new Error("GATE_PRE_GIT_VERSION constant not found");
  }
  writeFileSync(
    target.absolutePath,
    text.replace(TYPES_VERSION_RE, `export const GATE_PRE_GIT_VERSION = "gate-pre-git@${version}";`),
    "utf8"
  );
}

function auditFailures(expectedVersion: string, targets: VersionTarget[]): string[] {
  return targets.flatMap((target) => {
    if (target.currentVersion === expectedVersion) return [];
    return [`${target.path}: expected ${expectedVersion}, found ${target.currentVersion ?? "missing-or-invalid"}`];
  });
}

function finish(
  started: number,
  action: VersionReport["action"],
  target: string,
  state:
    | { ok: true; source: VersionSource; targets: VersionTargetInternal[] }
    | { ok: false; failures: string[]; warnings: string[] },
  updated: string[],
  failures: string[],
  warnings: string[],
  nextVersion?: string
): VersionReport {
  const okState = state.ok ? state : null;
  return {
    ok: failures.length === 0 && state.ok,
    mode: "version",
    action,
    target,
    source: okState?.source ?? null,
    currentVersion: okState?.source.version ?? null,
    nextVersion,
    targets: okState?.targets.map(({ absolutePath: _absolutePath, ...target }) => target) ?? [],
    updated,
    failures: state.ok ? failures : [...state.failures, ...failures],
    warnings: state.ok ? warnings : [...state.warnings, ...warnings],
    durationMs: Date.now() - started
  };
}

function computeNextVersion(currentVersion: string, bump: VersionBumpInput): string {
  if (bump === "patch" || bump === "minor" || bump === "major") {
    const match = currentVersion.match(VERSION_RE);
    if (match === null) throw new Error(`invalid current SemVer: ${currentVersion}`);
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    if (bump === "major") return `${major + 1}.0.0`;
    if (bump === "minor") return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
  }
  if (!isSemVer(bump)) throw new Error(`invalid SemVer bump: ${bump}`);
  return bump;
}

function isSemVer(value: string): boolean {
  return VERSION_RE.test(value);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function targetOrder(target: VersionTarget): string {
  const rank =
    target.kind === "version-file"
      ? 0
      : target.path === "package.json"
        ? 1
        : target.kind === "package-json"
          ? 2
          : target.kind === "gate-generated-by"
            ? 3
            : 4;
  return `${rank}:${target.path}`;
}
