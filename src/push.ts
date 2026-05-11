import { execFileSync } from "node:child_process";

export const DEFAULT_PUSH_BASE = "origin/main";

export type PushRangeResult = {
  base: string;
  mergeBase: string | null;
  files: string[];
  warnings: string[];
};

export type PushRangeOptions = {
  base?: string;
  head?: string;
};

export function resolvePushRange(cwd: string, options: PushRangeOptions = {}): PushRangeResult {
  const base = options.base ?? DEFAULT_PUSH_BASE;
  const head = options.head ?? "HEAD";

  if (!hasRevision(cwd, head)) {
    return {
      base,
      mergeBase: null,
      files: changedWorktreeFiles(cwd),
      warnings: [`${head} is not available; using worktree changes`]
    };
  }

  if (!hasRevision(cwd, base)) {
    return {
      base,
      mergeBase: null,
      files: filesWithoutBase(cwd),
      warnings: [`${base} is not available; using HEAD tree and worktree changes`]
    };
  }

  const mergeBase = firstGitLine(cwd, ["merge-base", head, base]);
  if (mergeBase === undefined) {
    return {
      base,
      mergeBase: null,
      files: filesWithoutBase(cwd),
      warnings: [`no merge-base found for ${head} and ${base}; using HEAD tree and worktree changes`]
    };
  }

  return {
    base,
    mergeBase,
    files: gitLines(cwd, ["diff", "--name-only", "--diff-filter=ACMR", mergeBase, head, "--"]),
    warnings: []
  };
}

function filesWithoutBase(cwd: string): string[] {
  return uniqueSorted([...gitLines(cwd, ["ls-tree", "-r", "--name-only", "HEAD"]), ...changedWorktreeFiles(cwd)]);
}

function hasRevision(cwd: string, revision: string): boolean {
  return git(cwd, ["rev-parse", "--verify", "--quiet", revision]).ok;
}

function changedWorktreeFiles(cwd: string): string[] {
  return normalizeGitStatusFiles(gitLines(cwd, ["status", "--porcelain=v1", "--untracked-files=all"]));
}

function firstGitLine(cwd: string, args: string[]): string | undefined {
  return gitLines(cwd, args)[0];
}

function gitLines(cwd: string, args: string[]): string[] {
  const result = git(cwd, args);
  if (!result.ok) return [];
  return result.stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

function git(cwd: string, args: string[]): { ok: true; stdout: string } | { ok: false; stdout: string } {
  try {
    return {
      ok: true,
      stdout: execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      })
    };
  } catch (error) {
    const candidate = error as { stdout?: Buffer | string };
    return { ok: false, stdout: String(candidate.stdout ?? "") };
  }
}

function normalizeGitStatusFiles(lines: string[]): string[] {
  const files = new Set<string>();
  for (const entry of lines) {
    const status = entry.slice(0, 2);
    if (status === " D" || status === "D " || status === "DD") continue;
    const rawPath = entry.slice(3);
    const renameTarget = rawPath.split(" -> ").at(-1);
    if (renameTarget !== undefined && renameTarget.length > 0) files.add(renameTarget);
  }
  return uniqueSorted([...files]);
}

function uniqueSorted(files: string[]): string[] {
  return [...new Set(files)].sort();
}
