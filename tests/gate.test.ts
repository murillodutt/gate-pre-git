import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDoctor } from "../src/doctor";
import { runGate } from "../src/gate";
import { initProject } from "../src/installer";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe("gate-pre-git", () => {
  test("fails invalid JSON and YAML", () => {
    const dir = fixture("syntax");
    writeFileSync(join(dir, "bad.json"), "{", "utf8");
    writeFileSync(join(dir, "bad.yaml"), "root: [", "utf8");

    const report = runGate({
      target: dir,
      mode: "check",
      all: true,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(false);
    expect(report.checks.find((check) => check.name === "json_syntax")?.status).toBe("failed");
    expect(report.checks.find((check) => check.name === "yaml_syntax")?.status).toBe("failed");
    rmSync(dir, { recursive: true, force: true });
  });

  test("blocks secret paths and conflict markers", () => {
    const dir = fixture("safety");
    writeFileSync(join(dir, ".env"), "TOKEN=abc", "utf8");
    writeFileSync(join(dir, "file.ts"), "<<<<<<< HEAD\nconst value = 1;\n>>>>>>> branch\n", "utf8");

    const report = runGate({
      target: dir,
      mode: "check",
      all: true,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(false);
    expect(report.checks.find((check) => check.name === "staged_safety")?.failures.join("\n")).toContain(".env");
    expect(report.checks.find((check) => check.name === "text_hygiene")?.failures.join("\n")).toContain(
      "merge conflict"
    );
    rmSync(dir, { recursive: true, force: true });
  });

  test("reports source changes without tests as advice", () => {
    const dir = fixture("advice");
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "src", "core.ts"), "export const value = 1;\n", "utf8");

    const report = runGate({
      target: dir,
      mode: "advice",
      all: true,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(true);
    expect(report.advice).toContain("source_without_test_change");
    rmSync(dir, { recursive: true, force: true });
  });

  test("init applies the strict native hook recipe and doctor certifies it", () => {
    const dir = fixture("init");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(
      join(dir, "package.json"),
      `${JSON.stringify({ name: "target", version: "0.0.0", scripts: {} }, null, 2)}\n`,
      "utf8"
    );

    const init = initProject({
      target: dir,
      yes: true,
      force: false,
      profile: "auto",
      hook: "native",
      command: "gate-pre-git"
    });

    expect(init.wroteConfig).toBe(true);
    expect(init.wroteGovernance).toBe(true);
    expect(init.installedHook).toBe(true);
    expect(init.installedPrePushHook).toBe(true);
    expect(init.patchedPackage).toBe(true);
    expect(existsSync(join(dir, ".gate-pre-git", "config.json"))).toBe(true);
    expect(existsSync(join(dir, ".gate-pre-git", "governance.json"))).toBe(true);
    expect(existsSync(join(dir, ".gate-pre-git", "lock.json"))).toBe(true);
    expect(existsSync(join(dir, ".gate-pre-git", "runtime", "cli.js"))).toBe(true);
    expect(existsSync(join(dir, ".github", "workflows", "gate-pre-git-audit.yml"))).toBe(true);
    const governance = JSON.parse(readFileSync(init.governancePath, "utf8")) as {
      zones: Array<{ name: string; owners: string[]; paths: string[] }>;
    };
    expect(governance.zones.map((zone) => zone.name)).toEqual([
      "source_js",
      "source_python",
      "source_go",
      "source_rust",
      "tests_js",
      "tests_python",
      "tests_go",
      "tests_rust",
      "vendored_gate",
      "github_workflow",
      "docs",
      "package_tooling",
      "shell_scripts",
      "templates",
      "fixture_workspaces"
    ]);
    expect(governance.zones.every((zone) => zone.owners.length > 0)).toBe(true);
    expect(governance.zones.find((zone) => zone.name === "docs")?.paths).toContain("LICENSE");
    const launcherText = readFileSync(init.binPath, "utf8");
    expect(launcherText).not.toContain("/Users/");
    expect(launcherText).toContain("repo_root=");
    expect(launcherText).toContain(".gate-pre-git/runtime/cli.js");
    expect(launcherText).toContain(".gate-pre-git/runtime/cli.ts");
    expect(readFileSync(init.preCommitHookPath, "utf8")).toContain("managed by gate-pre-git");
    expect(readFileSync(init.prePushHookPath, "utf8")).toContain("push");
    expect(readFileSync(init.workflowPath, "utf8")).toContain("update-tools --target .");

    const doctor = runDoctor(dir);
    expect(doctor.ok).toBe(true);

    rmSync(init.governancePath, { force: true });
    const doctorWithoutGovernance = runDoctor(dir);
    expect(doctorWithoutGovernance.ok).toBe(false);
    expect(doctorWithoutGovernance.checks.find((check) => check.name === "governance_map")?.status).toBe("failed");

    rmSync(join(dir, ".gate-pre-git", "runtime", "cli.js"), { force: true });
    const doctorWithoutRuntime = runDoctor(dir);
    expect(doctorWithoutRuntime.ok).toBe(false);
    expect(doctorWithoutRuntime.checks.find((check) => check.name === "vendored_runtime")?.status).toBe("failed");
    rmSync(dir, { recursive: true, force: true });
  });

  test("doctor fails when the GitHub audit workflow stops validating audit artifacts", () => {
    const dir = fixture("workflow-drift");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(
      join(dir, "package.json"),
      `${JSON.stringify({ name: "target", version: "0.0.0", scripts: {} }, null, 2)}\n`,
      "utf8"
    );
    const init = initProject({
      target: dir,
      yes: true,
      force: false,
      profile: "auto",
      hook: "native",
      command: "gate-pre-git"
    });
    writeFileSync(
      init.workflowPath,
      "name: drift\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ok\n",
      "utf8"
    );

    const doctor = runDoctor(dir);

    expect(doctor.ok).toBe(false);
    expect(doctor.checks.find((check) => check.name === "github_audit_workflow")?.status).toBe("failed");
    expect(doctor.findings.map((finding) => finding.code)).toContain("github_audit_workflow");
    rmSync(dir, { recursive: true, force: true });
  });

  test("doctor fails when vendored governance weakens required base evidence", () => {
    const dir = fixture("governance-drift");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(
      join(dir, "package.json"),
      `${JSON.stringify({ name: "target", version: "0.0.0", scripts: {} }, null, 2)}\n`,
      "utf8"
    );
    const init = initProject({
      target: dir,
      yes: true,
      force: false,
      profile: "auto",
      hook: "native",
      command: "gate-pre-git"
    });
    const governance = JSON.parse(readFileSync(init.governancePath, "utf8")) as {
      zones: Array<{ name: string; requiredEvidence: string[] }>;
    };
    const source = governance.zones.find((zone) => zone.name === "source_js");
    if (source !== undefined) source.requiredEvidence = ["test"];
    writeFileSync(init.governancePath, `${JSON.stringify(governance, null, 2)}\n`, "utf8");

    const doctor = runDoctor(dir);

    expect(doctor.ok).toBe(false);
    expect(doctor.checks.find((check) => check.name === "governance_map")?.failures.join("\n")).toContain(
      "missing base evidence"
    );
    rmSync(dir, { recursive: true, force: true });
  });

  test("doctor fails when gate runtime version metadata drifts", () => {
    const dir = fixture("version-drift");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(
      join(dir, "package.json"),
      `${JSON.stringify({ name: "gate-pre-git", version: "0.1.0", scripts: {} }, null, 2)}\n`,
      "utf8"
    );
    const init = initProject({
      target: dir,
      yes: true,
      force: false,
      profile: "auto",
      hook: "native",
      command: "gate-pre-git"
    });
    const lock = JSON.parse(readFileSync(init.lockPath, "utf8")) as { generatedBy: string };
    lock.generatedBy = "gate-pre-git@0.1.1";
    writeFileSync(init.lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf8");

    const doctor = runDoctor(dir);

    expect(doctor.ok).toBe(false);
    expect(doctor.checks.find((check) => check.name === "version_sync")?.status).toBe("failed");
    expect(doctor.findings.map((finding) => finding.code)).toContain("version_sync");
    rmSync(dir, { recursive: true, force: true });
  });

  test("staged reads invalid index content even when working tree is fixed", () => {
    const dir = fixture("staged-index-invalid");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "bad.json"), "{", "utf8");
    execFileSync("git", ["add", "bad.json"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "bad.json"), "{}\n", "utf8");

    const report = runGate({
      target: dir,
      mode: "staged",
      all: false,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(false);
    expect(report.checks.find((check) => check.name === "json_syntax")?.status).toBe("failed");
    rmSync(dir, { recursive: true, force: true });
  });

  test("staged ignores invalid working tree when staged content is valid", () => {
    const dir = fixture("staged-index-valid");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "good.json"), "{}\n", "utf8");
    execFileSync("git", ["add", "good.json"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "good.json"), "{", "utf8");

    const report = runGate({
      target: dir,
      mode: "staged",
      all: false,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  test("staged applies safe fixes and stages the sanitized result", () => {
    const dir = fixture("auto-stage-fix");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "data.json"), '{"b":2,"a":1}', "utf8");
    execFileSync("git", ["add", "data.json"], { cwd: dir, stdio: "ignore" });

    const report = runGate({
      target: dir,
      mode: "staged",
      all: false,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(true);
    expect(report.fixesApplied.map((fix) => fix.file)).toContain("data.json");
    expect(report.filesStaged).toContain("data.json");
    const staged = execFileSync("git", ["show", ":data.json"], { cwd: dir, encoding: "utf8" });
    expect(staged).toBe(`${JSON.stringify({ b: 2, a: 1 }, null, 2)}\n`);
    rmSync(dir, { recursive: true, force: true });
  });

  test("partial staging blocks a fixer instead of staging unrelated drift", () => {
    const dir = fixture("partial-staging");
    execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "note.txt"), "staged   \n", "utf8");
    execFileSync("git", ["add", "note.txt"], { cwd: dir, stdio: "ignore" });
    writeFileSync(join(dir, "note.txt"), "unstaged   \n", "utf8");

    const report = runGate({
      target: dir,
      mode: "staged",
      all: false,
      json: false,
      runCommands: false
    });

    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.code)).toContain("partial_staging_fix_blocked");
    const staged = execFileSync("git", ["show", ":note.txt"], { cwd: dir, encoding: "utf8" });
    expect(staged).toBe("staged   \n");
    rmSync(dir, { recursive: true, force: true });
  });

  test("audit reports findings in machine-readable form", () => {
    const dir = fixture("audit");
    writeFileSync(join(dir, "bad.json"), "{", "utf8");

    const report = runGate({
      target: dir,
      mode: "audit",
      all: true,
      json: true,
      runCommands: false
    });

    expect(report.ok).toBe(false);
    expect(report.findings.some((finding) => finding.code === "json_syntax")).toBe(true);
    expect(report.tools.length).toBeGreaterThan(0);
    rmSync(dir, { recursive: true, force: true });
  });
});
