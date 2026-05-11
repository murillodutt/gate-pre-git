import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function isGitRepository(cwd: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return true;
  } catch {
    return false;
  }
}

export function changedFiles(cwd: string): string[] {
  const lines = gitLines(cwd, ["status", "--porcelain=v1", "--untracked-files=all"]);
  return normalizeGitStatusFiles(lines);
}

export function stagedFiles(cwd: string): string[] {
  return gitLines(cwd, ["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
}

export function unstagedFiles(cwd: string): string[] {
  return gitLines(cwd, ["diff", "--name-only", "--diff-filter=ACMR"]);
}

export function unmergedFiles(cwd: string): string[] {
  return gitLines(cwd, ["diff", "--name-only", "--diff-filter=U"]);
}

export function trackedFiles(cwd: string): string[] {
  return gitLines(cwd, ["ls-files"]);
}

export function pushFiles(cwd: string, base = "origin/main"): string[] {
  try {
    const mergeBase = gitLines(cwd, ["merge-base", "HEAD", base])[0];
    if (mergeBase === undefined) return changedFiles(cwd);
    return gitLines(cwd, ["diff", "--name-only", "--diff-filter=ACMR", mergeBase, "HEAD"]);
  } catch {
    return changedFiles(cwd);
  }
}

export function walkFiles(root: string, ignoredDirs: string[]): string[] {
  const out: string[] = [];
  const ignored = new Set(ignoredDirs);

  function walk(abs: string): void {
    for (const entry of readdirSync(abs)) {
      if (ignored.has(entry)) continue;
      const path = join(abs, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) walk(path);
      else out.push(relative(root, path));
    }
  }

  if (existsSync(root)) walk(root);
  return out.sort();
}

export function gitDiffCheck(cwd: string, cached: boolean): { ok: boolean; output: string } {
  const args = cached ? ["diff", "--cached", "--check"] : ["diff", "--check"];
  try {
    const output = execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, output: output.trim() };
  } catch (error) {
    const candidate = error as { stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      ok: false,
      output: `${candidate.stdout ?? ""}${candidate.stderr ?? ""}`.trim()
    };
  }
}

export function readIndexFile(cwd: string, file: string): string | undefined {
  try {
    return execFileSync("git", ["show", `:${file}`], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return undefined;
  }
}

export function stageFiles(cwd: string, files: string[]): void {
  if (files.length === 0) return;
  execFileSync("git", ["add", "--", ...files], { cwd, stdio: "ignore" });
}

export function gitStatusSets(cwd: string): {
  staged: Set<string>;
  unstaged: Set<string>;
  deleted: Set<string>;
  unmerged: Set<string>;
} {
  const staged = new Set(stagedFiles(cwd));
  const unstaged = new Set(unstagedFiles(cwd));
  const deleted = new Set(gitLines(cwd, ["diff", "--name-only", "--diff-filter=D"]));
  const unmerged = new Set(unmergedFiles(cwd));
  return { staged, unstaged, deleted, unmerged };
}

export function gitLines(cwd: string, args: string[]): string[] {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
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
  return [...files].sort();
}
