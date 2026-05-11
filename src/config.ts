import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type { GateConfig } from "./types";

export const DEFAULT_CONFIG: GateConfig = {
  textExtensions: [
    ".md",
    ".txt",
    ".json",
    ".jsonc",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".vue",
    ".yml",
    ".yaml",
    ".css",
    ".html",
    ".py",
    ".pyi",
    ".go",
    ".rs",
    ".toml",
    ".mod",
    ".sum"
  ],
  blockedBasenames: [".DS_Store"],
  blockedMarkers: ["[STAGE_BLOCK:OPEN]"],
  secretPathPatterns: [
    "\\.env($|\\.)",
    "\\.(pem|key|p12|pfx)$",
    "(^|/)id_rsa$",
    "(^|/)id_ed25519$",
    "(^|/)secrets?\\."
  ],
  ignoreDirs: [".git", "node_modules", "dist", "build", ".next", ".nuxt", ".output", "coverage", ".cache"],
  markdown: {
    requireH1: false,
    maxHeadingDepth: 6
  },
  policy: {
    strict: true,
    autoStageFixes: true
  },
  profiles: ["auto"],
  tools: [],
  hooks: {
    preCommit: true,
    prePush: true
  },
  githubAudit: {
    enabled: true,
    workflowPath: ".github/workflows/gate-pre-git-audit.yml"
  },
  commandChecks: []
};

export function loadConfig(target: string, configPath?: string): GateConfig {
  const resolved =
    configPath === undefined
      ? defaultConfigPath(target)
      : isAbsolute(configPath)
        ? configPath
        : join(target, configPath);

  if (!existsSync(resolved)) return DEFAULT_CONFIG;

  const userConfig = JSON.parse(readFileSync(resolved, "utf8")) as Partial<GateConfig>;
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    markdown: {
      ...DEFAULT_CONFIG.markdown,
      ...userConfig.markdown
    },
    policy: {
      ...DEFAULT_CONFIG.policy,
      ...userConfig.policy
    },
    hooks: {
      ...DEFAULT_CONFIG.hooks,
      ...userConfig.hooks
    },
    githubAudit: {
      ...DEFAULT_CONFIG.githubAudit,
      ...userConfig.githubAudit
    },
    textExtensions: userConfig.textExtensions ?? DEFAULT_CONFIG.textExtensions,
    blockedBasenames: userConfig.blockedBasenames ?? DEFAULT_CONFIG.blockedBasenames,
    blockedMarkers: userConfig.blockedMarkers ?? DEFAULT_CONFIG.blockedMarkers,
    secretPathPatterns: userConfig.secretPathPatterns ?? DEFAULT_CONFIG.secretPathPatterns,
    ignoreDirs: userConfig.ignoreDirs ?? DEFAULT_CONFIG.ignoreDirs,
    profiles: userConfig.profiles ?? DEFAULT_CONFIG.profiles,
    tools: userConfig.tools ?? DEFAULT_CONFIG.tools,
    commandChecks: userConfig.commandChecks ?? DEFAULT_CONFIG.commandChecks
  };
}

export function defaultConfigPath(target: string): string {
  const vendored = join(target, ".gate-pre-git", "config.json");
  if (existsSync(vendored)) return vendored;
  return join(target, "gate-pre-git.config.json");
}
