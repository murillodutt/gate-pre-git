import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateCheck } from "./types";

export const GITHUB_AUDIT_WORKFLOW_PATH = ".github/workflows/gate-pre-git-audit.yml";

export function shouldCheckGitHubAuditWorkflow(files: readonly string[]): boolean {
  return files.includes(GITHUB_AUDIT_WORKFLOW_PATH);
}

export function checkGitHubAuditWorkflow(target: string): GateCheck {
  const path = join(target, GITHUB_AUDIT_WORKFLOW_PATH);
  if (!existsSync(path)) {
    return {
      name: "github_audit_workflow",
      status: "failed",
      failures: [`missing required file: ${GITHUB_AUDIT_WORKFLOW_PATH}`],
      warnings: [],
      details: [GITHUB_AUDIT_WORKFLOW_PATH],
      durationMs: 0
    };
  }

  const text = readFileSync(path, "utf8");
  const required = [
    "update-tools --target .",
    "audit --target . --all --format json",
    "audit --target . --all --format sarif",
    "bun install --frozen-lockfile",
    "$RUNNER_TEMP/gate-pre-git-audit.json",
    "$RUNNER_TEMP/gate-pre-git-audit.sarif",
    "runner.temp",
    "manifestHash",
    "manifest.governance",
    "manifest.evidence",
    "manifest.impact",
    "actions/upload-artifact"
  ];
  const failures = required
    .filter((needle) => !text.includes(needle))
    .map((needle) => `GitHub audit workflow missing required audit anchor: ${needle}`);

  const unsafeWorkspaceArtifactPatterns = [
    />\s*["']?gate-pre-git-audit\.(json|sarif)["']?/,
    /Bun\.file\(\s*["']gate-pre-git-audit\.(json|sarif)["']\s*\)/,
    /^\s*gate-pre-git-audit\.(json|sarif)\s*$/m
  ];
  if (unsafeWorkspaceArtifactPatterns.some((pattern) => pattern.test(text))) {
    failures.push("GitHub audit workflow must write audit artifacts outside the audited workspace");
  }

  return {
    name: "github_audit_workflow",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [GITHUB_AUDIT_WORKFLOW_PATH],
    durationMs: 0
  };
}
