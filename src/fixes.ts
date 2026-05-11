import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  checkGitDiffWhitespace,
  checkJsonSyntax,
  checkMarkdownStructure,
  checkStagedSafety,
  checkTextHygiene,
  checkYamlSyntax
} from "./checks";
import { isGitRepository, readIndexFile, stageFiles } from "./git";
import { collectGateFiles } from "./snapshot";
import type { GateCheck, GateConfig, GateFile, GateFinding, GateFix, GateMode } from "./types";

export type FixResult = {
  fixesApplied: GateFix[];
  filesStaged: string[];
  findings: GateFinding[];
};

type PlannedFix = {
  file: GateFile;
  path: string;
  text: string;
  tool: string;
  action: string;
  originalHash: string;
  fixedHash: string;
};

type FileSnapshot = {
  path: string;
  worktreeExists: boolean;
  worktreeText?: string;
  indexContent?: string;
};

export function runTransactionalFixes(target: string, files: GateFile[], config: GateConfig): FixResult {
  const findings: GateFinding[] = [];
  const shouldStage = config.policy.autoStageFixes && isGitRepository(target);
  const mode = inferMode(files);
  const planned: PlannedFix[] = [];

  for (const file of files) {
    if (!file.exists || file.deleted || file.content === undefined || !isTextFile(file.path, config)) continue;

    const fixed = fixContent(file.path, file.content);
    if (fixed.text === file.content) continue;

    if (file.partial) {
      findings.push({
        severity: "error",
        code: "partial_staging_fix_blocked",
        message: `fix would change partially staged file: ${file.path}`,
        file: file.path,
        source: "fixer"
      });
      continue;
    }

    const path = resolve(target, file.path);
    if (!existsSync(path)) continue;

    const worktreeText = readFileSync(path, "utf8");
    if (file.source === "index" && worktreeText !== file.content) {
      findings.push({
        severity: "error",
        code: "unstaged_drift_fix_blocked",
        message: `working tree differs from staged snapshot; refusing to auto-stage fix for ${file.path}`,
        file: file.path,
        source: "fixer"
      });
      continue;
    }

    planned.push({
      file,
      path,
      text: fixed.text,
      tool: fixed.tool,
      action: fixed.action,
      originalHash: contentHash(file.content),
      fixedHash: contentHash(fixed.text)
    });
  }

  if (findings.some((finding) => finding.severity === "error")) {
    return { fixesApplied: [], filesStaged: [], findings };
  }
  if (planned.length === 0) return { fixesApplied: [], filesStaged: [], findings };

  const snapshots = planned.map((fix) => snapshotFile(target, fix.path, fix.file.path));
  const staged = shouldStage ? planned.map((fix) => fix.file.path).sort() : [];

  try {
    for (const fix of planned) writeFileSync(fix.path, fix.text, "utf8");
    if (staged.length > 0) stageFiles(target, staged);

    const validationFailures = validatePostFix(target, mode, config);
    if (validationFailures.length > 0) {
      rollbackFiles(target, snapshots, shouldStage);
      return {
        fixesApplied: [],
        filesStaged: [],
        findings: [
          {
            severity: "error",
            code: "post_fix_validation_failed",
            message: `rolled back fixes because post-fix validation failed: ${validationFailures.join("; ")}`,
            source: "fixer"
          }
        ]
      };
    }
  } catch (error) {
    rollbackFiles(target, snapshots, shouldStage);
    return {
      fixesApplied: [],
      filesStaged: [],
      findings: [
        {
          severity: "error",
          code: "fix_transaction_failed",
          message: `rolled back fixes after transaction failure: ${(error as Error).message}`,
          source: "fixer"
        }
      ]
    };
  }

  const fixesApplied = planned.map(
    (fix) =>
      ({
        tool: fix.tool,
        file: fix.file.path,
        action: traceAction(fix.action, fix.originalHash, fix.fixedHash),
        staged: shouldStage
      }) satisfies GateFix
  );

  return {
    fixesApplied,
    filesStaged: staged,
    findings
  };
}

function snapshotFile(target: string, path: string, relativePath: string): FileSnapshot {
  return {
    path: relativePath,
    worktreeExists: existsSync(path),
    worktreeText: existsSync(path) ? readFileSync(path, "utf8") : undefined,
    indexContent: isGitRepository(target) ? readIndexFile(target, relativePath) : undefined
  };
}

function rollbackFiles(target: string, snapshots: FileSnapshot[], restoreIndex: boolean): void {
  for (const snapshot of snapshots) {
    const path = resolve(target, snapshot.path);
    if (snapshot.worktreeExists && snapshot.worktreeText !== undefined)
      writeFileSync(path, snapshot.worktreeText, "utf8");
    else if (existsSync(path)) unlinkSync(path);

    if (restoreIndex) restoreIndexContent(target, snapshot);
  }
}

function restoreIndexContent(target: string, snapshot: FileSnapshot): void {
  if (snapshot.indexContent === undefined) {
    execFileSync("git", ["rm", "--cached", "--ignore-unmatch", "--", snapshot.path], { cwd: target, stdio: "ignore" });
    return;
  }

  const blob = execFileSync("git", ["hash-object", "-w", "--stdin"], {
    cwd: target,
    input: snapshot.indexContent,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"]
  }).trim();
  execFileSync("git", ["update-index", "--add", "--cacheinfo", "100644", blob, snapshot.path], {
    cwd: target,
    stdio: "ignore"
  });
}

function validatePostFix(target: string, mode: GateMode, config: GateConfig): string[] {
  const files = collectGateFiles(target, mode, false, config.ignoreDirs);
  const checks: GateCheck[] = [
    checkStagedSafety(target, files, config),
    checkTextHygiene(target, files, config),
    checkJsonSyntax(target, files),
    checkYamlSyntax(target, files),
    checkMarkdownStructure(target, files, config),
    checkGitDiffWhitespace(target, mode)
  ];

  return checks
    .filter((check) => check.status === "failed")
    .flatMap((check) => check.failures.map((failure) => `${check.name}: ${failure}`));
}

function inferMode(files: GateFile[]): GateMode {
  return files.some((file) => file.source === "index") ? "staged" : "fix";
}

function traceAction(action: string, originalHash: string, fixedHash: string): string {
  return `${action} [trace original=${originalHash} fixed=${fixedHash}]`;
}

function contentHash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 12);
}

function fixContent(path: string, text: string): { text: string; tool: string; action: string } {
  const normalized = normalizeText(text);
  if (path.toLowerCase().endsWith(".json")) {
    try {
      const formatted = `${formatJson(JSON.parse(normalized))}\n`;
      return {
        text: formatted,
        tool: "builtin:json-format",
        action: "format JSON and normalize text"
      };
    } catch {
      return {
        text: normalized,
        tool: "builtin:text-normalize",
        action: "normalize text"
      };
    }
  }

  return {
    text: normalized,
    tool: "builtin:text-normalize",
    action: "normalize text"
  };
}

function formatJson(value: unknown, depth = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every(isJsonPrimitive) && !value.some(isRegexLikeString)) {
      const inline = `[${value.map((entry) => formatJson(entry, depth)).join(", ")}]`;
      if (inline.length <= 100) return inline;
    }
    const indent = "  ".repeat(depth);
    const childIndent = "  ".repeat(depth + 1);
    return `[\n${value.map((entry) => `${childIndent}${formatJson(entry, depth + 1)}`).join(",\n")}\n${indent}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return "{}";

  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);
  return `{\n${entries
    .map(([key, entry]) => `${childIndent}${JSON.stringify(key)}: ${formatJson(entry, depth + 1)}`)
    .join(",\n")}\n${indent}}`;
}

function isJsonPrimitive(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function isRegexLikeString(value: unknown): boolean {
  return typeof value === "string" && value.includes("\\");
}

function normalizeText(text: string): string {
  const withoutTrailingWhitespace = text.replace(/[ \t]+$/gm, "");
  if (withoutTrailingWhitespace.length === 0 || withoutTrailingWhitespace.endsWith("\n")) {
    return withoutTrailingWhitespace;
  }
  return `${withoutTrailingWhitespace}\n`;
}

function isTextFile(file: string, config: GateConfig): boolean {
  return config.textExtensions.some((extension) => file.toLowerCase().endsWith(extension));
}
