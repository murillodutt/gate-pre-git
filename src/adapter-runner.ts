import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { type AdapterCommand, buildAdapterCommands } from "./adapters";
import type { AdapterExecutionStatus, GateCheck } from "./types";

export type AdapterRunOptions = {
  enabledTools?: readonly string[];
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

export function runAdapterChecks(
  target: string,
  files: readonly string[],
  options: AdapterRunOptions = {}
): GateCheck[] {
  const enabledTools = options.enabledTools === undefined ? undefined : new Set(options.enabledTools);
  const commands = buildAdapterCommands(files, "check", target).filter(
    (command) => enabledTools === undefined || enabledTools.has(command.adapter)
  );
  return commands.map((command) => runAdapterCommand(target, command, options.timeoutMs ?? DEFAULT_TIMEOUT_MS));
}

export function runAdapterCommand(target: string, command: AdapterCommand, timeoutMs = DEFAULT_TIMEOUT_MS): GateCheck {
  const started = Date.now();
  const details = [`status=running`, `command=${command.shell}`, `timeout_ms=${timeoutMs}`];

  if (!existsSync(command.command)) {
    return finish(started, command, "tool_missing", details, [
      `tool shim missing for ${command.adapter}: ${command.command}`
    ]);
  }

  const result = spawnSync(command.command, command.args, {
    cwd: target,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs
  });
  const output = trimOutput(`${result.stdout ?? ""}${result.stderr ?? ""}`.trim());

  if (result.error !== undefined) {
    const nodeError = result.error as NodeJS.ErrnoException;
    if (nodeError.code === "ETIMEDOUT") {
      return finish(
        started,
        command,
        "timeout",
        [...details, detailOutput(output)],
        [`adapter timed out: ${command.adapter}`]
      );
    }
    if (nodeError.code === "ENOENT") {
      return finish(started, command, "tool_missing", details, [
        `tool executable missing for ${command.adapter}: ${command.command}`
      ]);
    }
    return finish(
      started,
      command,
      "execution_failed",
      [...details, detailOutput(output)],
      [`adapter execution failed: ${command.adapter}: ${nodeError.message}`]
    );
  }

  if (result.status === 0) {
    return finish(started, command, "passed", [...details, detailOutput(output)], []);
  }

  if (result.status === 127) {
    return finish(
      started,
      command,
      "tool_missing",
      [...details, detailOutput(output)],
      [`adapter tool missing: ${command.adapter}: ${output || "exit 127"}`]
    );
  }

  return finish(
    started,
    command,
    "policy_failed",
    [...details, detailOutput(output)],
    [`adapter policy failed: ${command.adapter}: ${output || `exit ${result.status ?? "unknown"}`}`]
  );
}

function finish(
  started: number,
  command: AdapterCommand,
  status: AdapterExecutionStatus,
  details: string[],
  failures: string[]
): GateCheck {
  return {
    name: `adapter:${command.adapter}`,
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [`status=${status}`, ...details.filter((detail) => detail !== "status=running" && detail !== "output=")],
    durationMs: Date.now() - started
  };
}

function detailOutput(output: string): string {
  return output.length === 0 ? "output=" : `output=${output}`;
}

function trimOutput(output: string): string {
  return output.length > 800 ? `${output.slice(0, 800)}...` : output;
}
