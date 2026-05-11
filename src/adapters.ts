export type AdapterName = "biome" | "ruff" | "gitleaks" | "actionlint" | "shellcheck" | "markdownlint";
export type AdapterCapability = "check" | "fix";
export type AdapterRisk = "low" | "medium" | "high";

export type AdapterCommand = {
  adapter: AdapterName;
  capability: AdapterCapability;
  command: string;
  args: string[];
  shell: string;
  risk: AdapterRisk;
};

export type ToolAdapter = {
  name: AdapterName;
  command: string;
  capabilities: readonly AdapterCapability[];
  fileExtensions: readonly string[];
  pathIncludes?: readonly string[];
  matchesAllFiles?: boolean;
  risk: Readonly<Partial<Record<AdapterCapability, AdapterRisk>>>;
  args: Readonly<Partial<Record<AdapterCapability, readonly string[]>>>;
};

export const TOOL_ADAPTERS: readonly ToolAdapter[] = [
  {
    name: "biome",
    command: "biome",
    capabilities: ["check", "fix"],
    fileExtensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts", ".json", ".jsonc", ".css"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: ["check"],
      fix: ["check", "--write"]
    }
  },
  {
    name: "ruff",
    command: "ruff",
    capabilities: ["check", "fix"],
    fileExtensions: [".py", ".pyi"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: ["check"],
      fix: ["check", "--fix"]
    }
  },
  {
    name: "gitleaks",
    command: "gitleaks",
    capabilities: ["check"],
    fileExtensions: [],
    matchesAllFiles: true,
    risk: {
      check: "high"
    },
    args: {
      check: ["dir", ".", "--redact", "--no-banner", "--exit-code", "1"]
    }
  },
  {
    name: "actionlint",
    command: "actionlint",
    capabilities: ["check"],
    fileExtensions: [".yml", ".yaml"],
    pathIncludes: [".github/workflows/"],
    risk: {
      check: "low"
    },
    args: {
      check: []
    }
  },
  {
    name: "shellcheck",
    command: "shellcheck",
    capabilities: ["check"],
    fileExtensions: [".sh", ".bash", ".zsh", ".ksh"],
    risk: {
      check: "low"
    },
    args: {
      check: []
    }
  },
  {
    name: "markdownlint",
    command: "markdownlint-cli2",
    capabilities: ["check", "fix"],
    fileExtensions: [".md", ".markdown", ".mdown"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: [],
      fix: ["--fix"]
    }
  }
];

const ADAPTERS_BY_NAME = new Map(TOOL_ADAPTERS.map((adapter) => [adapter.name, adapter]));

export function adapterRegistry(): readonly ToolAdapter[] {
  return TOOL_ADAPTERS;
}

export function getAdapter(name: AdapterName): ToolAdapter {
  const adapter = ADAPTERS_BY_NAME.get(name);
  if (adapter === undefined) {
    throw new Error(`Unknown adapter: ${name}`);
  }
  return adapter;
}

export function selectAdaptersForFiles(
  files: readonly string[],
  capability: AdapterCapability = "check"
): ToolAdapter[] {
  return TOOL_ADAPTERS.filter(
    (adapter) => adapter.capabilities.includes(capability) && files.some((file) => adapterMatchesFile(adapter, file))
  );
}

export function adapterMatchesFile(adapter: ToolAdapter, file: string): boolean {
  const normalized = normalizePath(file);
  if (normalized.startsWith(".gate-pre-git/") && adapter.name !== "gitleaks") return false;
  if (adapter.matchesAllFiles === true) return true;
  if (adapter.pathIncludes !== undefined && !adapter.pathIncludes.some((part) => normalized.includes(part))) {
    return false;
  }
  return adapter.fileExtensions.some((extension) => normalized.endsWith(extension));
}

export function buildAdapterCommand(
  adapterName: AdapterName,
  capability: AdapterCapability,
  files: readonly string[],
  root = "."
): AdapterCommand {
  const adapter = getAdapter(adapterName);
  if (!adapter.capabilities.includes(capability)) {
    throw new Error(`${adapter.name} does not support ${capability}`);
  }

  const baseArgs = adapter.args[capability];
  if (baseArgs === undefined) {
    throw new Error(`${adapter.name} does not define ${capability} args`);
  }

  const command = normalizePath(`${root}/.gate-pre-git/cache/bin/${adapter.command}`);
  const args = [...baseArgs, ...commandFiles(adapter, files)];
  return {
    adapter: adapter.name,
    capability,
    command,
    args,
    shell: formatShellCommand(command, args),
    risk: adapter.risk[capability] ?? "medium"
  };
}

export function buildAdapterCommands(
  files: readonly string[],
  capability: AdapterCapability = "check",
  root = "."
): AdapterCommand[] {
  return selectAdaptersForFiles(files, capability).map((adapter) =>
    buildAdapterCommand(adapter.name, capability, files, root)
  );
}

function commandFiles(adapter: ToolAdapter, files: readonly string[]): string[] {
  if (adapter.matchesAllFiles === true) return [];
  return files.filter((file) => adapterMatchesFile(adapter, file));
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/\/{2,}/g, "/");
}

function formatShellCommand(command: string, args: readonly string[]): string {
  return [command, ...args].map(shellQuote).join(" ");
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:=@%+-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}
