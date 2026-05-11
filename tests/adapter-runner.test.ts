import { describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runAdapterCommand } from "../src/adapter-runner";
import type { AdapterCommand } from "../src/adapters";

function fixture(name: string): string {
  const dir = join(
    tmpdir(),
    `gate-pre-git-adapter-runner-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

function command(path: string): AdapterCommand {
  return {
    adapter: "biome",
    capability: "check",
    command: path,
    args: [],
    shell: path,
    risk: "low"
  };
}

function writeShim(target: string, name: string, body: string): string {
  const path = join(target, name);
  writeFileSync(path, `#!/usr/bin/env sh\nset -eu\n${body}\n`, "utf8");
  chmodSync(path, 0o755);
  return path;
}

describe("adapter runner", () => {
  test("classifies successful adapter execution", () => {
    const dir = fixture("success");
    try {
      const shim = writeShim(dir, "pass.sh", "echo adapter-ok");
      const check = runAdapterCommand(dir, command(shim));

      expect(check.status).toBe("passed");
      expect(check.details.join("\n")).toContain("status=passed");
      expect(check.details.join("\n")).toContain("adapter-ok");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("classifies adapter policy failure", () => {
    const dir = fixture("policy-failed");
    try {
      const shim = writeShim(dir, "fail.sh", "echo bad-policy >&2\nexit 1");
      const check = runAdapterCommand(dir, command(shim));

      expect(check.status).toBe("failed");
      expect(check.failures.join("\n")).toContain("adapter policy failed");
      expect(check.failures.join("\n")).toContain("bad-policy");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("classifies adapter timeout", () => {
    const dir = fixture("timeout");
    try {
      const shim = writeShim(dir, "timeout.sh", "sleep 2");
      const check = runAdapterCommand(dir, command(shim), 50);

      expect(check.status).toBe("failed");
      expect(check.failures.join("\n")).toContain("adapter timed out");
      expect(check.details.join("\n")).toContain("status=timeout");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("classifies missing adapter shim", () => {
    const dir = fixture("missing");
    try {
      const check = runAdapterCommand(dir, command(join(dir, "missing.sh")));

      expect(check.status).toBe("failed");
      expect(check.failures.join("\n")).toContain("tool shim missing");
      expect(check.details.join("\n")).toContain("status=tool_missing");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
