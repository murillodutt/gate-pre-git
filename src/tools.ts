import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GATE_PRE_GIT_VERSION, type GateLock, type GateToolLockEntry, type GateToolReport } from "./types";

const DEFAULT_TOOLS: Record<string, GateToolLockEntry> = {
  biome: {
    kind: "npm",
    package: "@biomejs/biome",
    version: "2.4.15",
    command: "biome"
  },
  markdownlint: {
    kind: "npm",
    package: "markdownlint-cli2",
    version: "0.22.1",
    command: "markdownlint-cli2"
  },
  actionlint: {
    kind: "npm",
    package: "github-actionlint",
    version: "1.7.12",
    command: "actionlint"
  },
  shellcheck: {
    kind: "npm",
    package: "shellcheck",
    version: "4.1.0",
    command: "shellcheck"
  },
  gitleaks: {
    kind: "npm",
    package: "@0xts/gitleaks-cli",
    version: "0.1.3",
    command: "gitleaks"
  },
  ruff: {
    kind: "python",
    package: "ruff",
    version: "0.15.12",
    command: "ruff"
  }
};

export function defaultLock(): GateLock {
  return {
    version: 1,
    generatedBy: GATE_PRE_GIT_VERSION,
    tools: DEFAULT_TOOLS
  };
}

export function lockPath(target: string): string {
  return join(target, ".gate-pre-git", "lock.json");
}

export function readLock(target: string): GateLock | null {
  const path = lockPath(target);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as GateLock;
}

export function writeDefaultLock(target: string): GateLock {
  const lock = defaultLock();
  const path = lockPath(target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  writeToolShims(target, lock);
  return lock;
}

export function writeToolShims(target: string, lock: GateLock): void {
  const binDir = join(target, ".gate-pre-git", "cache", "bin");
  mkdirSync(binDir, { recursive: true });
  writeFileSync(join(target, ".gate-pre-git", "cache", ".gitignore"), "*\n!.gitignore\n", "utf8");

  for (const [name, tool] of Object.entries(lock.tools)) {
    const path = join(binDir, tool.command);
    const text = shimText(name, tool);
    writeFileSync(path, text, "utf8");
    chmodSync(path, 0o755);
  }
}

export function inspectTools(target: string): GateToolReport[] {
  const lock = readLock(target);
  if (lock === null) {
    return [
      {
        name: "gate-lock",
        version: "missing",
        status: "missing",
        detail: ".gate-pre-git/lock.json not found"
      }
    ];
  }

  return Object.entries(lock.tools).map(([name, tool]) => {
    const path = join(target, ".gate-pre-git", "cache", "bin", tool.command);
    return {
      name,
      version: tool.version,
      command: tool.command,
      path,
      status: existsSync(path) ? "installed" : "locked",
      detail:
        (tool.kind === "npm" || tool.kind === "python") && tool.package !== undefined
          ? `${tool.package}@${tool.version}`
          : tool.kind
    };
  });
}

function shimText(name: string, tool: GateToolLockEntry): string {
  if (tool.kind === "npm") {
    const spec = `${tool.package ?? name}@${tool.version}`;
    return `#!/usr/bin/env sh
set -eu
exec bunx --silent --bun "${spec}" "$@"
`;
  }

  if (tool.kind === "system") {
    return `#!/usr/bin/env sh
set -eu
if ! command -v "${tool.command}" >/dev/null 2>&1; then
  echo "gate-pre-git tool '${tool.command}' is required but was not found on PATH" >&2
  exit 127
fi
exec "${tool.command}" "$@"
`;
  }

  if (tool.kind === "python") {
    const spec = `${tool.package ?? name}==${tool.version}`;
    return `#!/usr/bin/env sh
set -eu
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cache_dir="$repo_root/.gate-pre-git/cache/python/${name}-${tool.version}"
site_dir="$cache_dir/site"
if [ ! -d "$site_dir" ]; then
  mkdir -p "$site_dir"
  python3 -m pip install --disable-pip-version-check --quiet --target "$site_dir" "${spec}"
fi
PYTHONPATH="$site_dir\${PYTHONPATH:+:$PYTHONPATH}" exec python3 -m "${tool.command}" "$@"
`;
  }

  return `#!/usr/bin/env sh
set -eu
echo "gate-pre-git builtin tool '${name}' is managed inside the CLI" >&2
exit 0
`;
}
