import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { auditVersion } from "./versioning";

export type ReleaseCategory = "added" | "changed" | "fixed";
export type ReleaseAction = "plan" | "write" | "audit";

export type ReleaseEntry = {
  commitHash: string;
  category: ReleaseCategory;
  title: string;
  component?: string;
  breaking?: true;
};

export type ExcludedReleaseCommit = {
  commitHash: string;
  subject: string;
  reason: "merge_commit" | "bump_commit" | "lock_change" | "bot_author";
};

export type ReleaseReport = {
  ok: boolean;
  mode: "release";
  action: ReleaseAction;
  target: string;
  project: string | null;
  version: string | null;
  previousRef: string | null;
  toRef: string;
  range: string | null;
  entries: ReleaseEntry[];
  excludedCommits: ExcludedReleaseCommit[];
  updated: string[];
  artifactHash: string | null;
  failures: string[];
  warnings: string[];
  durationMs: number;
};

type PackageJson = {
  name?: unknown;
  version?: unknown;
};

type CommitRecord = {
  hash: string;
  subject: string;
};

const CONVENTIONAL_RE = /^(feat|fix|refactor|perf|docs|style|revert)(?:\(([^)]+)\))?(!)?: (.+)$/;
const SEMVER_TAG_RE = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/;

export function buildReleasePlan(options: { target: string; from?: string; to?: string }): ReleaseReport {
  const started = Date.now();
  const target = options.target;
  const failures: string[] = [];
  const warnings: string[] = [];
  const project = readProjectName(target, warnings);
  const version = readReleaseVersion(target, failures);
  const toRef = options.to ?? "HEAD";
  const previousRef = options.from ?? previousVersionRef(target);
  if (previousRef === null) failures.push("release baseline ref not found: create a commit/tag or pass --from");

  if (version === null || previousRef === null) {
    return releaseReport({
      started,
      action: "plan",
      target,
      project,
      version,
      previousRef,
      toRef,
      entries: [],
      excludedCommits: [],
      updated: [],
      failures,
      warnings
    });
  }

  const commits = collectCommits(target, previousRef, toRef, failures);
  const classified = classifyCommits(target, commits);
  return releaseReport({
    started,
    action: "plan",
    target,
    project,
    version,
    previousRef,
    toRef,
    entries: classified.entries,
    excludedCommits: classified.excluded,
    updated: [],
    failures,
    warnings
  });
}

export function writeReleaseArtifacts(options: { target: string; from?: string; to?: string }): ReleaseReport {
  const started = Date.now();
  const plan = buildReleasePlan(options);
  if (!plan.ok) return { ...plan, action: "write", durationMs: Date.now() - started };

  const updated: string[] = [];
  const changelogPath = "CHANGELOG.md";
  const releasePath = `docs/releases/${plan.version}.md`;
  const releaseMarkdown = releaseNotesMarkdown(plan);
  const changelogMarkdown = changelogWithRelease(options.target, plan, releaseMarkdown);

  writeText(join(options.target, changelogPath), changelogMarkdown);
  updated.push(changelogPath);
  writeText(join(options.target, releasePath), releaseMarkdown);
  updated.push(releasePath);

  return {
    ...plan,
    action: "write",
    updated,
    artifactHash: artifactHash(releaseMarkdown, changelogMarkdown),
    durationMs: Date.now() - started
  };
}

export function auditReleaseArtifacts(options: { target: string; from?: string; to?: string }): ReleaseReport {
  const started = Date.now();
  const plan = buildReleasePlan(options);
  if (!plan.ok) return { ...plan, action: "audit", durationMs: Date.now() - started };

  const releasePath = `docs/releases/${plan.version}.md`;
  const changelogPath = "CHANGELOG.md";
  const expectedRelease = releaseNotesMarkdown(plan);
  const failures: string[] = [];
  const releaseAbsolutePath = join(options.target, releasePath);
  const changelogAbsolutePath = join(options.target, changelogPath);

  if (!existsSync(releaseAbsolutePath)) {
    failures.push(`missing ${releasePath}`);
  } else if (readFileSync(releaseAbsolutePath, "utf8") !== expectedRelease) {
    failures.push(`${releasePath} drifted from generated release plan`);
  }

  if (!existsSync(changelogAbsolutePath)) {
    failures.push(`missing ${changelogPath}`);
  } else if (!readFileSync(changelogAbsolutePath, "utf8").includes(`## ${plan.version}`)) {
    failures.push(`${changelogPath} missing ${plan.version}`);
  }

  return {
    ...plan,
    action: "audit",
    artifactHash: artifactHash(
      existsSync(releaseAbsolutePath) ? readFileSync(releaseAbsolutePath, "utf8") : "",
      existsSync(changelogAbsolutePath) ? readFileSync(changelogAbsolutePath, "utf8") : ""
    ),
    failures: [...plan.failures, ...failures],
    durationMs: Date.now() - started,
    ok: plan.ok && failures.length === 0
  };
}

function releaseReport(options: {
  started: number;
  action: ReleaseAction;
  target: string;
  project: string | null;
  version: string | null;
  previousRef: string | null;
  toRef: string;
  entries: ReleaseEntry[];
  excludedCommits: ExcludedReleaseCommit[];
  updated: string[];
  failures: string[];
  warnings: string[];
}): ReleaseReport {
  const range = options.previousRef === null ? null : `${options.previousRef}..${options.toRef}`;
  return {
    ok: options.failures.length === 0,
    mode: "release",
    action: options.action,
    target: options.target,
    project: options.project,
    version: options.version,
    previousRef: options.previousRef,
    toRef: options.toRef,
    range,
    entries: options.entries,
    excludedCommits: options.excludedCommits,
    updated: options.updated,
    artifactHash: null,
    failures: options.failures,
    warnings: options.warnings,
    durationMs: Date.now() - options.started
  };
}

function readReleaseVersion(target: string, failures: string[]): string | null {
  const version = auditVersion({ target });
  if (!version.ok || version.currentVersion === null) {
    failures.push(...version.failures.map((failure) => `version audit: ${failure}`));
    return null;
  }
  return `v${version.currentVersion}`;
}

function readProjectName(target: string, warnings: string[]): string | null {
  const packagePath = join(target, "package.json");
  if (!existsSync(packagePath)) {
    warnings.push("package.json not found; project name unavailable");
    return null;
  }
  const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as PackageJson;
  return typeof pkg.name === "string" ? pkg.name : null;
}

function previousVersionRef(target: string): string | null {
  try {
    const tags = execFileSync("git", ["tag", "--sort=-version:refname"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    })
      .split("\n")
      .map((tag) => tag.trim())
      .filter((tag) => SEMVER_TAG_RE.test(tag));
    return tags[0] ?? firstCommit(target);
  } catch {
    return firstCommit(target);
  }
}

function firstCommit(target: string): string | null {
  try {
    return execFileSync("git", ["rev-list", "--max-parents=0", "HEAD"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    })
      .split("\n")
      .map((hash) => hash.trim())
      .filter(Boolean)[0];
  } catch {
    return null;
  }
}

function collectCommits(target: string, from: string, to: string, failures: string[]): CommitRecord[] {
  try {
    const output = execFileSync("git", ["log", "--format=%H%x00%s", `${from}..${to}`], {
      cwd: target,
      encoding: "utf8"
    });
    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash = "", subject = ""] = line.split("\0");
        return { hash, subject };
      });
  } catch (error) {
    failures.push(`failed to collect release commits: ${(error as Error).message}`);
    return [];
  }
}

function classifyCommits(
  target: string,
  commits: CommitRecord[]
): { entries: ReleaseEntry[]; excluded: ExcludedReleaseCommit[] } {
  const entries: ReleaseEntry[] = [];
  const excluded: ExcludedReleaseCommit[] = [];

  for (const commit of commits) {
    const exclusion = excludedReason(target, commit);
    if (exclusion !== null) {
      excluded.push({
        commitHash: shortHash(target, commit.hash),
        subject: commit.subject,
        reason: exclusion
      });
      continue;
    }

    entries.push(classifyCommit(target, commit));
  }

  return { entries, excluded };
}

function excludedReason(target: string, commit: CommitRecord): ExcludedReleaseCommit["reason"] | null {
  if (commit.subject.startsWith("Merge ") || commit.subject.startsWith("Merge branch")) return "merge_commit";
  if (/bump.*version/i.test(commit.subject)) return "bump_commit";
  if (/\b(lock|yarn\.lock|bun\.lock|package-lock)\b/i.test(commit.subject)) return "lock_change";
  if (
    authorEmail(target, commit.hash).includes("[bot]") ||
    authorEmail(target, commit.hash).includes("noreply@github.com")
  ) {
    return "bot_author";
  }
  return null;
}

function classifyCommit(target: string, commit: CommitRecord): ReleaseEntry {
  const match = commit.subject.match(CONVENTIONAL_RE);
  if (match === null) {
    return {
      commitHash: shortHash(target, commit.hash),
      category: "changed",
      title: commit.subject
    };
  }

  const [, type, component, breaking, title] = match;
  return compactReleaseEntry({
    commitHash: shortHash(target, commit.hash),
    category: categoryForType(type),
    title,
    component,
    breaking: breaking === "!" ? true : undefined
  });
}

function categoryForType(type: string): ReleaseCategory {
  if (type === "feat") return "added";
  if (type === "fix") return "fixed";
  return "changed";
}

function compactReleaseEntry(entry: ReleaseEntry): ReleaseEntry {
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined)) as ReleaseEntry;
}

function shortHash(target: string, hash: string): string {
  return execFileSync("git", ["rev-parse", "--short=12", hash], { cwd: target, encoding: "utf8" }).trim();
}

function authorEmail(target: string, hash: string): string {
  try {
    return execFileSync("git", ["log", "--format=%ae", "-1", hash], { cwd: target, encoding: "utf8" })
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

function releaseNotesMarkdown(plan: ReleaseReport): string {
  const lines = [
    `# Release ${plan.version}`,
    "",
    `Project: ${plan.project ?? "unknown"}`,
    `Range: ${plan.range ?? "unknown"}`,
    "",
    "## Added",
    "",
    ...entriesForCategory(plan, "added"),
    "",
    "## Fixed",
    "",
    ...entriesForCategory(plan, "fixed"),
    "",
    "## Changed",
    "",
    ...entriesForCategory(plan, "changed"),
    ""
  ];

  return `${lines.join("\n")}`;
}

function entriesForCategory(plan: ReleaseReport, category: ReleaseCategory): string[] {
  const entries = plan.entries.filter((entry) => entry.category === category);
  if (entries.length === 0) return ["- None"];
  return entries.map((entry) => {
    const component = entry.component === undefined ? "" : ` **${entry.component}:**`;
    const breaking = entry.breaking === true ? " **BREAKING**" : "";
    return `- ${entry.commitHash}${component} ${entry.title}${breaking}`;
  });
}

function changelogWithRelease(target: string, plan: ReleaseReport, releaseMarkdown: string): string {
  const changelogPath = join(target, "CHANGELOG.md");
  const existing = existsSync(changelogPath) ? readFileSync(changelogPath, "utf8") : "# Changelog\n\n";
  const releaseBody = releaseMarkdown.replace(/^# Release .+\n\n/, `## ${plan.version}\n\n`);
  const withoutExistingVersion = existing.replace(
    new RegExp(`\\n?## ${escapeRegExp(plan.version ?? "")}[\\s\\S]*?(?=\\n## |$)`),
    "\n"
  );
  return `${withoutExistingVersion.trimEnd()}\n\n${releaseBody}`;
}

function writeText(path: string, value: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function artifactHash(...values: string[]): string {
  const hash = createHash("sha256");
  for (const value of values) hash.update(value);
  return hash.digest("hex");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
