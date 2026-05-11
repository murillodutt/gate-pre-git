import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { DEFAULT_CONFIG } from "./config";
import type { CommandCheckConfig, GateConfig, GateProfile } from "./types";

export function profileConfig(profile: GateProfile, target?: string): GateConfig {
  const resolvedProfiles = profile === "auto" ? detectProfiles(target) : [profile];
  const packageJson = target === undefined ? null : readPackageJson(target);
  const nodeCommands = nodeCommandChecks(packageJson, target);
  const commands: Record<GateProfile, CommandCheckConfig[]> = {
    auto: [],
    strict: [],
    docs: [],
    node: nodeCommands,
    nuxt: [
      ...nodeCommands,
      ...(hasPackageScript(packageJson, "build")
        ? [
            {
              name: "build",
              run: "bun run build",
              modes: ["push" as const]
            }
          ]
        : [])
    ],
    python: [
      {
        name: "ruff",
        run: ".gate-pre-git/cache/bin/ruff check .",
        modes: ["check", "push"]
      }
    ],
    go: [
      {
        name: "go-test",
        run: "go test ./...",
        modes: ["check", "push"]
      }
    ],
    rust: [
      {
        name: "cargo-check",
        run: "cargo check",
        modes: ["check", "push"]
      }
    ],
    security: []
  };

  return {
    ...DEFAULT_CONFIG,
    markdown: {
      requireH1: resolvedProfiles.length === 1 && resolvedProfiles.includes("docs"),
      maxHeadingDepth: 4
    },
    profiles: resolvedProfiles,
    tools: toolsForProfiles(resolvedProfiles, target),
    commandChecks: uniqueCommands(resolvedProfiles.flatMap((resolvedProfile) => commands[resolvedProfile]))
  };
}

export function isGateProfile(value: string | undefined): value is GateProfile {
  return (
    value === "auto" ||
    value === "strict" ||
    value === "node" ||
    value === "nuxt" ||
    value === "docs" ||
    value === "python" ||
    value === "go" ||
    value === "rust" ||
    value === "security"
  );
}

function detectProfiles(target: string | undefined): GateProfile[] {
  if (target === undefined) return ["auto"];

  const files = listFiles(target, 4);
  const packageJson = readPackageJson(target);
  const packageDeps = {
    ...((packageJson?.dependencies ?? {}) as Record<string, string>),
    ...((packageJson?.devDependencies ?? {}) as Record<string, string>)
  };
  const profiles = new Set<GateProfile>();

  const hasNuxt =
    files.some((file) => /^nuxt\.config\.(ts|js|mjs|mts)$/.test(file)) || Object.hasOwn(packageDeps, "nuxt");
  const hasPackage = packageJson !== null;
  const hasJs = files.some((file) => [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".vue"].includes(extname(file)));
  const hasPython =
    files.some((file) => [".py", ".pyi"].includes(extname(file))) ||
    files.some((file) => ["pyproject.toml", "requirements.txt", "setup.py"].includes(file));
  const hasGo = files.some((file) => extname(file) === ".go" || file === "go.mod");
  const hasRust = files.some((file) => extname(file) === ".rs" || file === "Cargo.toml");
  const hasDocs = files.some((file) => file === "README.md" || file.startsWith("docs/") || extname(file) === ".md");

  if (hasNuxt) profiles.add("nuxt");
  else if (hasPackage || hasJs) profiles.add("node");
  if (hasPython) profiles.add("python");
  if (hasGo) profiles.add("go");
  if (hasRust) profiles.add("rust");
  if (hasDocs) profiles.add("docs");
  profiles.add("security");

  return profiles.size === 1 ? ["strict", "security"] : [...profiles];
}

function toolsForProfiles(profiles: readonly GateProfile[], target: string | undefined): string[] {
  const all = ["biome", "markdownlint", "actionlint", "shellcheck", "gitleaks", "ruff"];
  const tools: Record<GateProfile, string[]> = {
    auto: all,
    strict: [],
    docs: ["markdownlint"],
    node: ["biome"],
    nuxt: ["biome"],
    python: ["ruff"],
    go: [],
    rust: [],
    security: ["gitleaks"]
  };
  const selected = new Set(["actionlint", "gitleaks", ...profiles.flatMap((profile) => tools[profile])]);
  const files = target === undefined ? [] : listFiles(target, 4);
  if (files.some((file) => file.startsWith(".github/workflows/") && [".yml", ".yaml"].includes(extname(file)))) {
    selected.add("actionlint");
  }
  if (files.some((file) => [".sh", ".bash", ".zsh", ".ksh"].includes(extname(file)))) selected.add("shellcheck");
  return [...selected].sort((left, right) => all.indexOf(left) - all.indexOf(right));
}

function uniqueCommands(commands: readonly CommandCheckConfig[]): CommandCheckConfig[] {
  const byName = new Map<string, CommandCheckConfig>();
  for (const command of commands) byName.set(command.name, command);
  return [...byName.values()];
}

function nodeCommandChecks(
  packageJson: null | { scripts?: unknown },
  target: string | undefined
): CommandCheckConfig[] {
  const checks: CommandCheckConfig[] = [];
  if (hasPackageScript(packageJson, "typecheck")) {
    checks.push({
      name: "typecheck",
      run: "bun run typecheck",
      modes: ["check", "push"]
    });
  }

  const testCommand = nodeTestCommand(packageJson, target);
  if (testCommand !== null) {
    checks.push({
      name: "test",
      run: testCommand,
      modes: ["check", "push"]
    });
  }

  return checks;
}

function nodeTestCommand(packageJson: null | { scripts?: unknown }, target: string | undefined): string | null {
  const scripts = packageJson?.scripts;
  if (isRecord(scripts) && typeof scripts.test === "string") return "bun run test";
  if (target !== undefined && hasBunTestFiles(target)) return "bun test";
  return null;
}

function hasPackageScript(packageJson: null | { scripts?: unknown }, name: string): boolean {
  const scripts = packageJson?.scripts;
  return isRecord(scripts) && typeof scripts[name] === "string";
}

function hasBunTestFiles(target: string): boolean {
  return listFiles(target, 4).some((file) => /(^|\/).*(\.test|\.spec|_test_|_spec_)\.[cm]?[jt]sx?$/.test(file));
}

function readPackageJson(
  target: string
): null | { dependencies?: unknown; devDependencies?: unknown; scripts?: unknown } {
  const path = join(target, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as {
      dependencies?: unknown;
      devDependencies?: unknown;
      scripts?: unknown;
    };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function listFiles(target: string, maxDepth: number): string[] {
  const files: string[] = [];
  walk(target, "", maxDepth, files);
  return files;
}

function walk(target: string, relative: string, depth: number, files: string[]): void {
  if (depth < 0) return;
  const dir = relative === "" ? target : join(target, relative);
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      [".git", "node_modules", "dist", "build", ".next", ".nuxt", ".output", "coverage", "fixtures"].includes(
        entry.name
      )
    ) {
      continue;
    }
    const path = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) {
      walk(target, path, depth - 1, files);
    } else {
      files.push(path);
    }
  }
}
