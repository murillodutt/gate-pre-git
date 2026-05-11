import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { toSarif } from "../src/audit";
import { runGate } from "../src/gate";
import { initProject } from "../src/installer";
import { buildAuditManifest } from "../src/manifest";
import type { GateConfig, GateReport } from "../src/types";

type ReplayFixtureSpec = {
  name: string;
  baselineDir: string;
  expectedBaselineProfiles: GateConfig["profiles"];
  expectedBaselineTools?: GateConfig["tools"];
  runCommands?: boolean | "whenAvailable";
  commandProbes?: string[];
  checkEvidence?: string[];
  pushEvidence?: string[];
  mutations: Array<{
    name: string;
    files: Record<string, string>;
    expectedFiles: string[];
    expectedFindings: string[];
  }>;
};

const WORKSPACES_DIR = join(import.meta.dir, "..", "fixtures", "workspaces");

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();
}

function initRepository(cwd: string): void {
  git(cwd, ["init"]);
  git(cwd, ["config", "user.name", "Gate Test"]);
  git(cwd, ["config", "user.email", "gate-test@example.com"]);
}

function commitAll(cwd: string, message: string): string {
  git(cwd, ["add", "."]);
  git(cwd, ["commit", "--no-verify", "-m", message]);
  return git(cwd, ["rev-parse", "HEAD"]);
}

function readFixtureSpec(name: string): ReplayFixtureSpec {
  return JSON.parse(readFileSync(join(WORKSPACES_DIR, name, "fixture.json"), "utf8")) as ReplayFixtureSpec;
}

function readConfig(target: string): GateConfig {
  return JSON.parse(readFileSync(join(target, ".gate-pre-git", "config.json"), "utf8")) as GateConfig;
}

function materializeWorkspace(name: string): { dir: string; spec: ReplayFixtureSpec; baselineHead: string } {
  const spec = readFixtureSpec(name);
  const dir = mkdtempSync(join(tmpdir(), `gate-pre-git-replay-${name}-`));
  cpSync(join(WORKSPACES_DIR, name, spec.baselineDir), dir, { recursive: true });

  initRepository(dir);
  commitAll(dir, "source baseline");
  initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });
  const baselineHead = commitAll(dir, "install gate-pre-git baseline");
  git(dir, ["update-ref", "refs/remotes/origin/main", baselineHead]);

  return { dir, spec, baselineHead };
}

function cloneWorkspace(source: string, name: string): string {
  const dir = mkdtempSync(join(tmpdir(), `gate-pre-git-replay-${name}-mutation-`));
  cpSync(source, dir, { recursive: true });
  return dir;
}

function applyMutation(cwd: string, files: Record<string, string>): void {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, file)), { recursive: true });
    writeFileSync(join(cwd, file), content, "utf8");
  }
}

function shouldRunCommands(spec: ReplayFixtureSpec): boolean {
  if (spec.runCommands === true) return true;
  if (spec.runCommands === false || spec.runCommands === undefined) return false;
  return (spec.commandProbes ?? []).every(commandExists);
}

function commandExists(command: string): boolean {
  try {
    execFileSync("sh", ["-lc", `command -v ${shellQuote(command)}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function replayFixtures(): string[] {
  return readdirSync(WORKSPACES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function assertNoMissingImpactProvider(report: GateReport): void {
  expect(report.impact.filter((record) => record.reason === "no_provider_for_required_evidence")).toEqual([]);
  expect(report.impact.filter((record) => record.action === "run" && record.provider === "unknown")).toEqual([]);
}

describe("replayable fixture workspaces", () => {
  for (const fixtureName of replayFixtures()) {
    test(`replays ${fixtureName} from committed baseline to failing push mutation`, () => {
      const { dir, spec, baselineHead } = materializeWorkspace(fixtureName);
      try {
        const runCommands = shouldRunCommands(spec);
        const config = readConfig(dir);

        expect(config.profiles).toEqual(spec.expectedBaselineProfiles);
        if (spec.expectedBaselineTools !== undefined) expect(config.tools).toEqual(spec.expectedBaselineTools);
        expect(git(dir, ["status", "--short", "--untracked-files=all"])).toBe("");
        expect(git(dir, ["rev-parse", "origin/main"])).toBe(baselineHead);

        const structuralCheck = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });
        expect(structuralCheck.ok).toBe(true);
        expect(structuralCheck.governance.length).toBeGreaterThan(0);
        assertNoMissingImpactProvider(structuralCheck);

        const beforeCheck = runCommands
          ? runGate({ target: dir, mode: "check", all: true, json: false, runCommands: true })
          : structuralCheck;
        expect(beforeCheck.ok).toBe(true);
        assertNoMissingImpactProvider(beforeCheck);
        for (const evidence of runCommands ? (spec.checkEvidence ?? []) : []) {
          expect(beforeCheck.evidence.find((record) => record.id === evidence)?.status).toBe("satisfied");
        }

        const beforePushAll = runGate({ target: dir, mode: "push", all: true, json: false, runCommands });
        expect(beforePushAll.ok).toBe(true);
        assertNoMissingImpactProvider(beforePushAll);
        for (const evidence of runCommands ? (spec.pushEvidence ?? []) : []) {
          expect(beforePushAll.evidence.find((record) => record.id === evidence)?.status).toBe("satisfied");
        }

        const beforeAudit = runGate({ target: dir, mode: "audit", all: true, json: false, runCommands });
        const beforeManifest = buildAuditManifest(beforeAudit);
        const beforeSarif = JSON.parse(toSarif(beforeAudit)) as {
          runs: Array<{ properties: { gatePreGitManifestHash: string } }>;
        };
        expect(beforeAudit.ok).toBe(true);
        expect(beforeManifest.hash).toHaveLength(64);
        expect(beforeSarif.runs[0]?.properties.gatePreGitManifestHash).toBe(beforeManifest.hash);
        expect(beforeManifest.manifest.governance.length).toBeGreaterThan(0);
        expect(beforeManifest.manifest.evidence.length).toBeGreaterThan(0);
        expect(beforeManifest.manifest.impact.length).toBeGreaterThan(0);

        expect(spec.mutations.length).toBeGreaterThan(0);
        for (const mutation of spec.mutations) {
          const mutationDir = cloneWorkspace(dir, spec.name);
          try {
            applyMutation(mutationDir, mutation.files);
            commitAll(mutationDir, `fixture mutation: ${mutation.name}`);

            const afterPush = runGate({
              target: mutationDir,
              mode: "push",
              all: false,
              json: false,
              runCommands: false
            });
            const afterManifest = buildAuditManifest(afterPush);
            const codes = afterPush.findings.map((finding) => finding.code);

            expect(afterPush.ok).toBe(false);
            expect(afterPush.files).toEqual(mutation.expectedFiles);
            expect(codes).not.toContain("push_range");
            for (const expectedFinding of mutation.expectedFindings) expect(codes).toContain(expectedFinding);
            expect(afterManifest.hash).not.toBe(beforeManifest.hash);
          } finally {
            rmSync(mutationDir, { recursive: true, force: true });
          }
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    }, 20000);
  }
});
