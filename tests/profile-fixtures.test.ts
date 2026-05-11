import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDoctor } from "../src/doctor";
import { runGate } from "../src/gate";
import { initProject } from "../src/installer";
import type { GateConfig } from "../src/types";

function fixture(name: string): string {
  const dir = join(tmpdir(), `gate-pre-git-profile-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  return dir;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readConfig(target: string): GateConfig {
  return JSON.parse(readFileSync(join(target, ".gate-pre-git", "config.json"), "utf8")) as GateConfig;
}

describe("auto profile fixture pack", () => {
  test("detects Nuxt, docs, GitHub Actions, and security surfaces during init", () => {
    const dir = fixture("nuxt-auto");
    try {
      mkdirSync(join(dir, "app"), { recursive: true });
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      writeJson(join(dir, "package.json"), {
        name: "nuxt-target",
        version: "0.0.0",
        dependencies: { nuxt: "latest" },
        scripts: {
          typecheck: 'bun -e "process.exit(0)"',
          test: 'bun -e "process.exit(0)"',
          build: 'bun -e "process.exit(0)"'
        }
      });
      writeFileSync(join(dir, "nuxt.config.ts"), "export default defineNuxtConfig({});\n", "utf8");
      writeFileSync(join(dir, "app", "app.vue"), "<template><main>OK</main></template>\n", "utf8");
      writeFileSync(join(dir, "README.md"), "# Nuxt Target\n", "utf8");
      writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "name: ci\non: [push]\njobs: {}\n", "utf8");

      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });

      const config = readConfig(dir);
      const commandNames = config.commandChecks.map((command) => command.name);
      expect(config.profiles).toEqual(["nuxt", "docs", "security"]);
      expect(config.tools).toEqual(["biome", "markdownlint", "actionlint", "gitleaks"]);
      expect(commandNames).toEqual(["typecheck", "test", "build"]);
      expect(runDoctor(dir).ok).toBe(true);

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });
      expect(report.ok).toBe(true);
      expect(new Set(report.governance.map((record) => record.zone))).toEqual(
        new Set(["source_js", "vendored_gate", "github_workflow", "docs", "package_tooling"])
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("owns Python, Go, Rust, docs, workflow, and shell fixture files", () => {
    const dir = fixture("polyglot-auto");
    try {
      mkdirSync(join(dir, "pkg"), { recursive: true });
      mkdirSync(join(dir, "cmd", "app"), { recursive: true });
      mkdirSync(join(dir, "src"), { recursive: true });
      mkdirSync(join(dir, "docs"), { recursive: true });
      mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
      mkdirSync(join(dir, "scripts"), { recursive: true });
      writeFileSync(join(dir, "pyproject.toml"), '[project]\nname = "py-target"\n', "utf8");
      writeFileSync(join(dir, "pkg", "app.py"), "value = 1\n", "utf8");
      writeFileSync(join(dir, "go.mod"), "module example.com/gate\n\ngo 1.22\n", "utf8");
      writeFileSync(join(dir, "cmd", "app", "main.go"), "package main\n\nfunc main() {}\n", "utf8");
      writeFileSync(
        join(dir, "Cargo.toml"),
        '[package]\nname = "rust_target"\nversion = "0.1.0"\nedition = "2021"\n',
        "utf8"
      );
      writeFileSync(join(dir, "src", "main.rs"), "fn main() {}\n", "utf8");
      writeFileSync(join(dir, "docs", "guide.md"), "# Guide\n", "utf8");
      writeFileSync(join(dir, ".github", "workflows", "ci.yml"), "name: ci\non: [push]\njobs: {}\n", "utf8");
      writeFileSync(join(dir, "scripts", "release.sh"), "#!/usr/bin/env sh\nset -eu\n", "utf8");

      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });

      const config = readConfig(dir);
      expect(config.profiles).toEqual(["python", "go", "rust", "docs", "security"]);
      expect(config.tools).toEqual(["markdownlint", "actionlint", "shellcheck", "gitleaks", "ruff"]);
      expect(config.commandChecks.map((command) => command.name)).toEqual(["ruff", "go-test", "cargo-check"]);

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });
      expect(report.ok).toBe(true);
      expect(new Set(report.governance.map((record) => record.zone))).toEqual(
        new Set([
          "source_python",
          "source_go",
          "source_rust",
          "vendored_gate",
          "github_workflow",
          "docs",
          "package_tooling",
          "shell_scripts"
        ])
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("runs a full Node fixture with real adapters and command evidence", () => {
    const dir = fixture("node-full");
    try {
      mkdirSync(join(dir, "src"), { recursive: true });
      mkdirSync(join(dir, "tests"), { recursive: true });
      writeJson(join(dir, "package.json"), {
        name: "node-target",
        version: "0.0.0",
        scripts: {
          typecheck: 'bun -e "process.exit(0)"',
          test: "bun test"
        }
      });
      writeFileSync(join(dir, "src", "index.ts"), "export const value = 1;\n", "utf8");
      writeFileSync(
        join(dir, "tests", "index.test.ts"),
        'import { expect, test } from "bun:test";\n\ntest("value", () => expect(1).toBe(1));\n',
        "utf8"
      );

      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: true });
      expect(report.ok).toBe(true);
      expect(report.evidence.find((record) => record.id === "biome")?.status).toBe("satisfied");
      expect(report.evidence.find((record) => record.id === "gitleaks")?.status).toBe("satisfied");
      expect(report.evidence.find((record) => record.id === "typecheck")?.status).toBe("satisfied");
      expect(report.evidence.find((record) => record.id === "test")?.status).toBe("satisfied");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("does not invent Node command checks for package-only targets", () => {
    const dir = fixture("node-package-only");
    try {
      writeJson(join(dir, "package.json"), {
        name: "package-only-target",
        version: "0.0.0",
        scripts: {}
      });
      writeFileSync(join(dir, "README.md"), "# Package Only Target\n", "utf8");

      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });

      const config = readConfig(dir);
      expect(config.profiles).toEqual(["node", "docs", "security"]);
      expect(config.commandChecks).toEqual([]);

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: true });
      expect(report.ok).toBe(true);
      expect(report.findings.map((finding) => finding.code)).not.toContain("command:typecheck");
      expect(report.findings.map((finding) => finding.code)).not.toContain("command:test");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("blocks secret fixture paths after vendored auto init", () => {
    const dir = fixture("security-negative");
    try {
      writeFileSync(join(dir, "README.md"), "# Security Target\n", "utf8");
      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });
      writeFileSync(join(dir, ".env"), "TOKEN=abc\n", "utf8");

      const report = runGate({ target: dir, mode: "check", all: true, json: false, runCommands: false });
      expect(report.ok).toBe(false);
      expect(report.findings.map((finding) => finding.code)).toContain("staged_safety");
      expect(report.findings.map((finding) => finding.code)).toContain("governance");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("ignores replay fixture workspaces when detecting the host repository profile", () => {
    const dir = fixture("fixtures-do-not-define-host");
    try {
      mkdirSync(join(dir, "src"), { recursive: true });
      mkdirSync(join(dir, "fixtures", "workspaces", "go-sample", "baseline"), { recursive: true });
      writeJson(join(dir, "package.json"), {
        name: "host-target",
        version: "0.0.0",
        scripts: {
          typecheck: 'bun -e "process.exit(0)"',
          test: 'bun -e "process.exit(0)"'
        }
      });
      writeFileSync(join(dir, "src", "index.ts"), "export const value = 1;\n", "utf8");
      writeFileSync(join(dir, "fixtures", "workspaces", "go-sample", "baseline", "go.mod"), "module sample\n", "utf8");

      initProject({ target: dir, yes: true, force: false, profile: "auto", hook: "native", command: "gate-pre-git" });

      const config = readConfig(dir);
      expect(config.profiles).toEqual(["node", "security"]);
      expect(config.commandChecks.map((command) => command.name)).toEqual(["typecheck", "test"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
