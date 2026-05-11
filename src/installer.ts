import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { profileConfig } from "./profiles";
import { lockPath, writeDefaultLock, writeToolShims } from "./tools";
import { GATE_PRE_GIT_VERSION, type GateProfile, type HookKind } from "./types";

export type InitOptions = {
  target: string;
  yes: boolean;
  force: boolean;
  profile: GateProfile;
  hook: HookKind;
  command: string;
};

export type InitResult = {
  wroteConfig: boolean;
  wroteGovernance: boolean;
  preCommitHookPath: string;
  prePushHookPath: string;
  hookPath: string;
  installedHook: boolean;
  installedPrePushHook: boolean;
  patchedPackage: boolean;
  configPath: string;
  governancePath: string;
  lockPath: string;
  binPath: string;
  runtimePath: string;
  workflowPath: string;
};

let cachedRuntimeBundle: string | null = null;

export function hookText(command = "gate-pre-git", hook: "pre-commit" | "pre-push" = "pre-commit"): string {
  const gateCommand = hook === "pre-push" ? "push" : "staged";
  return `#!/usr/bin/env sh
set -eu

# managed by gate-pre-git
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
${command} ${gateCommand} --target "$repo_root"
`;
}

export function installHook(
  target: string,
  yes: boolean,
  command?: string,
  kind: HookKind = "native",
  force = false,
  hook: "pre-commit" | "pre-push" = "pre-commit"
): { installed: boolean; path: string; text: string } {
  const hookPath = hookPathFor(target, kind, hook);
  const text = hookText(command, hook);
  if (!yes) return { installed: false, path: hookPath, text };

  mkdirSync(dirname(hookPath), { recursive: true });
  if (existsSync(hookPath) && !force) {
    throw new Error(`refusing to overwrite existing hook: ${hookPath}`);
  }
  writeFileSync(hookPath, text, "utf8");
  chmodSync(hookPath, 0o755);
  return { installed: true, path: hookPath, text };
}

export function initProject(options: InitOptions): InitResult {
  const configPath = join(options.target, ".gate-pre-git", "config.json");
  const governancePath = join(options.target, ".gate-pre-git", "governance.json");
  const binPath = join(options.target, ".gate-pre-git", "bin", "gate-pre-git");
  const runtimePath = join(options.target, ".gate-pre-git", "runtime", "cli.js");
  const workflowPath = join(options.target, ".github", "workflows", "gate-pre-git-audit.yml");
  const config = profileConfig(options.profile, options.target);
  const biomeConfigPath = join(options.target, "biome.json");
  let wroteConfig = false;
  let wroteGovernance = false;

  if (options.yes) {
    mkdirSync(dirname(configPath), { recursive: true });
    mkdirSync(dirname(binPath), { recursive: true });
    mkdirSync(dirname(runtimePath), { recursive: true });
    mkdirSync(dirname(workflowPath), { recursive: true });
  }

  if (!existsSync(configPath) || options.force) {
    if (options.yes) {
      writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
      wroteConfig = true;
    }
  }

  if (!existsSync(governancePath) || options.force) {
    if (options.yes) {
      writeFileSync(governancePath, governanceMapText(), "utf8");
      wroteGovernance = true;
    }
  }

  if (options.yes) {
    writeLauncher(binPath, options.command);
    writeRuntimeBundle(runtimePath);
    if (config.tools.includes("biome") && (!existsSync(biomeConfigPath) || options.force)) {
      writeFileSync(biomeConfigPath, biomeConfigText(), "utf8");
    }
    const lock = writeDefaultLock(options.target);
    writeToolShims(options.target, lock);
    writeWorkflow(workflowPath);
  }

  const hookCommand = `.gate-pre-git/bin/gate-pre-git`;
  const preCommitHook = installHook(
    options.target,
    options.yes,
    hookCommand,
    options.hook,
    options.force,
    "pre-commit"
  );
  const prePushHook = installHook(options.target, options.yes, hookCommand, options.hook, options.force, "pre-push");
  const patchedPackage = patchPackageScripts(options.target, options.yes, options.force);

  return {
    wroteConfig,
    wroteGovernance,
    preCommitHookPath: preCommitHook.path,
    prePushHookPath: prePushHook.path,
    hookPath: preCommitHook.path,
    installedHook: preCommitHook.installed,
    installedPrePushHook: prePushHook.installed,
    patchedPackage,
    configPath,
    governancePath,
    lockPath: lockPath(options.target),
    binPath,
    runtimePath,
    workflowPath
  };
}

function governanceMapText(): string {
  return `${JSON.stringify(defaultGovernanceMap(), null, 2)}\n`;
}

function biomeConfigText(): string {
  return `${JSON.stringify(
    {
      $schema: "https://biomejs.dev/schemas/2.4.15/schema.json",
      formatter: {
        enabled: true,
        indentStyle: "space",
        indentWidth: 2,
        lineWidth: 120
      },
      javascript: {
        formatter: {
          quoteStyle: "double",
          semicolons: "always",
          trailingCommas: "none"
        }
      },
      json: {
        formatter: {
          trailingCommas: "none"
        }
      }
    },
    null,
    2
  )}\n`;
}

export function defaultGovernanceMap(): Record<string, unknown> {
  return {
    version: 1,
    generatedBy: GATE_PRE_GIT_VERSION,
    zones: [
      {
        name: "source_js",
        description: "JavaScript, TypeScript, Vue, and frontend/server source files.",
        owners: ["platform"],
        risk: "high",
        paths: [
          "src/**/*.js",
          "src/**/*.jsx",
          "src/**/*.mjs",
          "src/**/*.cjs",
          "src/**/*.ts",
          "src/**/*.tsx",
          "src/**/*.vue",
          "app/**/*.js",
          "app/**/*.jsx",
          "app/**/*.ts",
          "app/**/*.tsx",
          "app/**/*.vue",
          "lib/**/*.js",
          "lib/**/*.ts",
          "server/**/*.js",
          "server/**/*.ts"
        ],
        requiredEvidence: ["biome", "gitleaks", "typecheck", "test", "gate"]
      },
      {
        name: "source_python",
        description: "Python application, package, and script source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.py", "**/*.pyi"],
        requiredEvidence: ["ruff", "gitleaks", "gate"]
      },
      {
        name: "source_go",
        description: "Go application, package, and command source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.go"],
        requiredEvidence: ["go-test", "gitleaks", "gate"]
      },
      {
        name: "source_rust",
        description: "Rust crate and workspace source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.rs"],
        requiredEvidence: ["cargo-check", "gitleaks", "gate"]
      },
      {
        name: "tests_js",
        description: "JavaScript and TypeScript automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: [
          "tests/**/*.test.ts",
          "tests/**/*.spec.ts",
          "tests/**/*.ts",
          "test/**/*.test.ts",
          "test/**/*.spec.ts",
          "test/**/*.ts",
          "spec/**/*.ts",
          "__tests__/**/*.ts",
          "tests/**/*.test.js",
          "tests/**/*.spec.js",
          "tests/**/*.js",
          "test/**/*.test.js",
          "test/**/*.spec.js",
          "test/**/*.js",
          "spec/**/*.js",
          "__tests__/**/*.js"
        ],
        requiredEvidence: ["biome", "test"]
      },
      {
        name: "tests_python",
        description: "Python automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.py", "test/**/*.py"],
        requiredEvidence: ["ruff"]
      },
      {
        name: "tests_go",
        description: "Go automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.go", "test/**/*.go", "**/*_test.go"],
        requiredEvidence: ["go-test"]
      },
      {
        name: "tests_rust",
        description: "Rust automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.rs", "benches/**/*.rs"],
        requiredEvidence: ["cargo-check"]
      },
      {
        name: "vendored_gate",
        description: "Vendored gate configuration, lockfile, launcher, and local tool shims.",
        owners: ["platform"],
        risk: "critical",
        paths: [
          ".gate-pre-git/config.json",
          ".gate-pre-git/governance.json",
          ".gate-pre-git/lock.json",
          ".gate-pre-git/bin/**",
          ".gate-pre-git/runtime/**",
          ".gate-pre-git/cache/.gitignore"
        ],
        requiredEvidence: ["text_hygiene", "gitleaks"]
      },
      {
        name: "github_workflow",
        description: "GitHub audit workflow that verifies the local gate contract remotely.",
        owners: ["platform"],
        risk: "high",
        paths: [".github/workflows/**"],
        requiredEvidence: ["yaml_syntax", "actionlint"]
      },
      {
        name: "docs",
        description: "User-facing documentation and local evidence notes.",
        owners: ["maintainers"],
        risk: "low",
        paths: ["README.md", "CHANGELOG.md", "LICENSE", "LICENSE.*", "docs/**/*.md"],
        requiredEvidence: ["markdown_structure", "markdownlint"]
      },
      {
        name: "package_tooling",
        description: "Package manifests, compiler configuration, lockfiles, and root gate examples.",
        owners: ["platform"],
        risk: "high",
        paths: [
          "package.json",
          "bun.lock",
          "tsconfig.json",
          "nuxt.config.*",
          "vite.config.*",
          "next.config.*",
          "biome.json",
          ".markdownlint-cli2.jsonc",
          "gate-pre-git.config*.json",
          "pyproject.toml",
          "requirements*.txt",
          "setup.py",
          "go.mod",
          "go.sum",
          "Cargo.toml",
          "Cargo.lock",
          ".gitignore"
        ],
        requiredEvidence: ["text_hygiene", "gate"]
      },
      {
        name: "shell_scripts",
        description: "Repository automation and release shell scripts.",
        owners: ["platform"],
        risk: "medium",
        paths: ["scripts/**/*.sh", "**/*.sh", "**/*.bash", "**/*.zsh", "**/*.ksh"],
        requiredEvidence: ["text_hygiene", "shellcheck"]
      },
      {
        name: "templates",
        description: "Files copied or referenced by installer templates.",
        owners: ["platform"],
        risk: "medium",
        paths: ["templates/**"],
        requiredEvidence: ["text_hygiene"]
      },
      {
        name: "fixture_workspaces",
        description: "Versioned replay workspaces and fixture metadata used to certify portability.",
        owners: ["quality"],
        risk: "medium",
        paths: ["fixtures/**"],
        requiredEvidence: ["text_hygiene"]
      }
    ],
    sensitivePaths: [".env", ".env.*", "**/*.pem", "**/*.key", "**/*.p12", "**/*.pfx"],
    generatedPaths: ["dist/**", "build/**", ".next/**", ".nuxt/**", ".output/**"],
    exceptions: []
  };
}

function hookPathFor(target: string, kind: HookKind, hook: "pre-commit" | "pre-push"): string {
  if (kind === "husky") return join(target, ".husky", hook);
  try {
    const path = execFileSync("git", ["rev-parse", "--git-path", `hooks/${hook}`], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return isAbsolute(path) ? path : join(target, path);
  } catch {
    throw new Error(`native hook requires a Git repository: ${target}`);
  }
}

function writeLauncher(path: string, command: string): void {
  writeFileSync(
    path,
    `#!/usr/bin/env sh
set -eu
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if [ -f "$repo_root/.gate-pre-git/runtime/cli.js" ]; then
  exec bun "$repo_root/.gate-pre-git/runtime/cli.js" "$@"
fi

if [ -f "$repo_root/.gate-pre-git/runtime/cli.ts" ]; then
  exec bun "$repo_root/.gate-pre-git/runtime/cli.ts" "$@"
fi

if [ -f "$repo_root/package.json" ] && [ -f "$repo_root/src/cli.ts" ] && grep -q '"name"[[:space:]]*:[[:space:]]*"gate-pre-git"' "$repo_root/package.json"; then
  exec bun "$repo_root/src/cli.ts" "$@"
fi

if command -v gate-pre-git >/dev/null 2>&1; then
  exec gate-pre-git "$@"
fi

echo "gate-pre-git launcher could not find a local runtime. Tried .gate-pre-git/runtime/cli.ts, source checkout src/cli.ts, and gate-pre-git on PATH." >&2
exit 127
`,
    "utf8"
  );
  chmodSync(path, 0o755);
  void command;
}

function writeRuntimeBundle(path: string): void {
  writeFileSync(path, runtimeBundleText(), "utf8");
  chmodSync(path, 0o755);
}

function runtimeBundleText(): string {
  if (cachedRuntimeBundle !== null) return cachedRuntimeBundle;

  const sourceEntry = join(import.meta.dir, "cli.ts");
  if (!existsSync(sourceEntry)) {
    cachedRuntimeBundle = readFileSync(fileURLToPath(import.meta.url), "utf8");
    return cachedRuntimeBundle;
  }

  const dir = mkdtempSync(join(tmpdir(), "gate-pre-git-runtime-"));
  const outPath = join(dir, "cli.js");
  try {
    execFileSync("bun", ["build", sourceEntry, "--target=bun", "--outfile", outPath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    cachedRuntimeBundle = readFileSync(outPath, "utf8");
    return cachedRuntimeBundle;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function writeWorkflow(path: string): void {
  writeFileSync(
    path,
    `name: gate-pre-git-audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Drop checkout Git credentials before audit
        run: git config --local --unset-all http.https://github.com/.extraheader || true
      - name: Install source checkout dependencies
        run: |
          if [ -f package.json ] && grep -q '"name"[[:space:]]*:[[:space:]]*"gate-pre-git"' package.json; then
            bun install --frozen-lockfile
          fi
      - name: Restore gate tool shims from lockfile
        run: .gate-pre-git/bin/gate-pre-git update-tools --target .
      - name: Gate audit JSON
        run: |
          set +e
          .gate-pre-git/bin/gate-pre-git audit --target . --all --format json > gate-pre-git-audit.json
          status=$?
          if [ "$status" -ne 0 ]; then
            bun -e '
            const report = JSON.parse(await Bun.file("gate-pre-git-audit.json").text());
            const checks = report.checks?.filter((check) => check.status !== "passed") ?? [];
            console.log(JSON.stringify({ ok: report.ok, findings: report.findings, checks }, null, 2));
            '
            exit "$status"
          fi
      - name: Gate audit SARIF
        run: .gate-pre-git/bin/gate-pre-git audit --target . --all --format sarif > gate-pre-git-audit.sarif
      - name: Validate audit manifest
        run: |
          bun -e '
          const json = JSON.parse(await Bun.file("gate-pre-git-audit.json").text());
          const sarif = JSON.parse(await Bun.file("gate-pre-git-audit.sarif").text());
          if (!json.manifestHash || json.manifestHash.length !== 64) throw new Error("missing manifestHash");
          if (!Array.isArray(json.manifest.files)) throw new Error("missing manifest.files");
          if (!Array.isArray(json.manifest.tools)) throw new Error("missing manifest.tools");
          if (!Array.isArray(json.manifest.governance)) throw new Error("missing manifest.governance");
          if (!Array.isArray(json.manifest.evidence)) throw new Error("missing manifest.evidence");
          if (!Array.isArray(json.manifest.impact)) throw new Error("missing manifest.impact");
          const props = sarif.runs?.[0]?.properties ?? {};
          if (props.gatePreGitManifestHash !== json.manifestHash) throw new Error("SARIF manifest hash mismatch");
          '
      - uses: actions/upload-artifact@v4
        with:
          name: gate-pre-git-audit
          path: |
            gate-pre-git-audit.json
            gate-pre-git-audit.sarif
`,
    "utf8"
  );
}

function patchPackageScripts(target: string, yes: boolean, force: boolean): boolean {
  const packagePath = join(target, "package.json");
  if (!existsSync(packagePath) || !yes) return false;

  const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { scripts?: Record<string, string> };
  const scripts = pkg.scripts ?? {};
  const desired = {
    gate: ".gate-pre-git/bin/gate-pre-git check --all",
    "gate:audit": ".gate-pre-git/bin/gate-pre-git audit --all --format json",
    "gate:doctor": ".gate-pre-git/bin/gate-pre-git doctor",
    "gate:push": ".gate-pre-git/bin/gate-pre-git push",
    "gate:release-plan": ".gate-pre-git/bin/gate-pre-git release plan",
    "gate:staged": ".gate-pre-git/bin/gate-pre-git staged",
    "gate:version-audit": ".gate-pre-git/bin/gate-pre-git version audit"
  };

  for (const [name, command] of Object.entries(desired)) {
    if (scripts[name] !== undefined && scripts[name] !== command && !force) {
      throw new Error(`refusing to overwrite package script ${name}`);
    }
    scripts[name] = command;
  }

  pkg.scripts = sortRecord(scripts);
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  return true;
}

function sortRecord(input: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(input).sort(([left], [right]) => left.localeCompare(right)));
}
