import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  changedFiles,
  gitStatusSets,
  isGitRepository,
  readIndexFile,
  stagedFiles,
  trackedFiles,
  walkFiles
} from "./git";
import { resolvePushRange } from "./push";
import type { GateFile, GateMode } from "./types";

export function collectGateFiles(
  target: string,
  mode: GateMode,
  all: boolean,
  ignoredDirs: string[],
  base?: string
): GateFile[] {
  const git = isGitRepository(target);
  const status = git
    ? gitStatusSets(target)
    : {
        staged: new Set<string>(),
        unstaged: new Set<string>(),
        deleted: new Set<string>(),
        unmerged: new Set<string>()
      };
  const source = mode === "staged" ? "index" : "worktree";
  const paths = collectPaths(target, mode, all, ignoredDirs, base);

  return paths
    .map((path) => {
      const staged = status.staged.has(path);
      const unstaged = status.unstaged.has(path);
      const deleted = status.deleted.has(path);
      const exists = existsSync(resolve(target, path));
      const content = source === "index" ? readIndexFile(target, path) : readWorktreeFile(target, path);

      return {
        path,
        exists: source === "index" ? content !== undefined : exists,
        source,
        content,
        staged,
        unstaged,
        partial: staged && unstaged,
        deleted
      } satisfies GateFile;
    })
    .filter((file) => file.exists || file.deleted)
    .sort((left, right) => left.path.localeCompare(right.path));
}

function collectPaths(target: string, mode: GateMode, all: boolean, ignoredDirs: string[], base?: string): string[] {
  const git = isGitRepository(target);
  const files = git
    ? all
      ? [...trackedFiles(target), ...changedFiles(target)]
      : mode === "staged"
        ? stagedFiles(target)
        : mode === "push" || mode === "audit"
          ? resolvePushRange(target, { base }).files
          : changedFiles(target)
    : walkFiles(target, ignoredDirs);

  return [...new Set(files)].sort();
}

function readWorktreeFile(target: string, file: string): string | undefined {
  const path = resolve(target, file);
  if (!existsSync(path)) return undefined;
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
