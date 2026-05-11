import { execSync } from "node:child_process";
import { basename, extname } from "node:path";
import { parseDocument } from "yaml";
import { gitDiffCheck, isGitRepository } from "./git";
import type { GateCheck, GateConfig, GateFile, GateMode } from "./types";

type CheckBody = () => Omit<GateCheck, "name" | "durationMs">;

export function timedCheck(name: string, body: CheckBody): GateCheck {
  const started = Date.now();
  const result = body();
  return {
    name,
    durationMs: Date.now() - started,
    ...result
  };
}

export function checkStagedSafety(_target: string, files: GateFile[], config: GateConfig): GateCheck {
  return timedCheck("staged_safety", () => {
    const failures: string[] = [];
    const secretPatterns = config.secretPathPatterns.map((pattern) => new RegExp(pattern, "i"));

    for (const file of files) {
      if (config.blockedBasenames.includes(basename(file.path))) {
        failures.push(`blocked local file cannot be committed: ${file.path}`);
      }
      if (secretPatterns.some((pattern) => pattern.test(file.path))) {
        failures.push(`possible secret path cannot be committed: ${file.path}`);
      }
    }

    return result(failures, [], [`files=${files.length}`]);
  });
}

export function checkTextHygiene(_target: string, files: GateFile[], config: GateConfig): GateCheck {
  return timedCheck("text_hygiene", () => {
    const failures: string[] = [];
    const warnings: string[] = [];

    for (const file of files.filter((candidate) => isTextFile(candidate.path, config))) {
      const text = file.content;
      if (text === undefined) continue;

      if (text.includes("\u0000")) failures.push(`NUL byte found in text file: ${file.path}`);
      if (/^<<<<<<< .+/m.test(text) || /^>>>>>>> .+/m.test(text)) {
        failures.push(`merge conflict marker found in ${file.path}`);
      }
      for (const marker of config.blockedMarkers) {
        if (hasActiveMarker(text, marker)) failures.push(`blocked marker ${marker} found in ${file.path}`);
      }
      if (text.length > 1_000_000) warnings.push(`large text file should be reviewed deliberately: ${file.path}`);
    }

    return result(failures, warnings, [`text_files=${files.filter((file) => isTextFile(file.path, config)).length}`]);
  });
}

export function checkJsonSyntax(_target: string, files: GateFile[]): GateCheck {
  return timedCheck("json_syntax", () => {
    const failures: string[] = [];
    const jsonFiles = files.filter((file) => file.path.toLowerCase().endsWith(".json"));

    for (const file of jsonFiles) {
      if (file.content === undefined) continue;
      try {
        JSON.parse(file.content);
      } catch (error) {
        failures.push(`${file.path}: ${(error as Error).message}`);
      }
    }

    return result(failures, [], [`json_files=${jsonFiles.length}`]);
  });
}

export function checkYamlSyntax(_target: string, files: GateFile[]): GateCheck {
  return timedCheck("yaml_syntax", () => {
    const failures: string[] = [];
    const yamlFiles = files.filter((file) => /\.(ya?ml)$/i.test(file.path));

    for (const file of yamlFiles) {
      if (file.content === undefined) continue;
      const doc = parseDocument(file.content, { prettyErrors: false });
      for (const error of doc.errors) failures.push(`${file.path}: ${error.message}`);
    }

    return result(failures, [], [`yaml_files=${yamlFiles.length}`]);
  });
}

export function checkMarkdownStructure(_target: string, files: GateFile[], config: GateConfig): GateCheck {
  return timedCheck("markdown_structure", () => {
    const failures: string[] = [];
    const markdownFiles = files.filter((file) => file.path.toLowerCase().endsWith(".md"));

    for (const file of markdownFiles) {
      const text = file.content;
      if (text === undefined) continue;
      if (config.markdown.requireH1 && !/^#\s+\S/m.test(text)) {
        failures.push(`markdown missing H1: ${file.path}`);
      }
      const tooDeep = text.match(new RegExp(`^#{${config.markdown.maxHeadingDepth + 1},}\\s+\\S`, "m"));
      if (tooDeep) failures.push(`markdown heading exceeds max depth ${config.markdown.maxHeadingDepth}: ${file.path}`);
      if (hasUnbalancedFences(text)) failures.push(`markdown code fence appears unbalanced: ${file.path}`);
    }

    return result(failures, [], [`markdown_files=${markdownFiles.length}`]);
  });
}

export function checkGitDiffWhitespace(target: string, mode: GateMode): GateCheck {
  return timedCheck("git_diff_whitespace", () => {
    if (!isGitRepository(target)) {
      return { status: "skipped", failures: [], warnings: [], details: ["not_git_repository"] };
    }

    const checks: Array<[string, { ok: boolean; output: string }]> =
      mode === "staged"
        ? [["cached", gitDiffCheck(target, true)]]
        : [
            ["worktree", gitDiffCheck(target, false)],
            ["cached", gitDiffCheck(target, true)]
          ];
    const failures = checks
      .filter(([, check]) => !check.ok)
      .map(([name, check]) => `${name}: ${check.output || "git diff --check failed"}`);

    return result(
      failures,
      [],
      checks.map(([name, check]) => `${name}=${check.ok ? "passed" : "failed"}`)
    );
  });
}

export function checkConfiguredCommands(target: string, mode: GateMode, config: GateConfig): GateCheck[] {
  return config.commandChecks
    .filter((command) => command.modes === undefined || command.modes.includes(mode))
    .map((command) =>
      timedCheck(`command:${command.name}`, () => {
        try {
          const output = execSync(command.run, {
            cwd: target,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
          }).trim();
          return result([], [], output ? [trimOutput(output)] : []);
        } catch (error) {
          const candidate = error as { stdout?: Buffer | string; stderr?: Buffer | string };
          const output = `${candidate.stdout ?? ""}${candidate.stderr ?? ""}`.trim();
          return result([`${command.run}: ${trimOutput(output) || "command failed"}`], [], []);
        }
      })
    );
}

function isTextFile(file: string, config: GateConfig): boolean {
  return config.textExtensions.includes(extname(file).toLowerCase());
}

function result(failures: string[], warnings: string[], details: string[]): Omit<GateCheck, "name" | "durationMs"> {
  return {
    status: failures.length > 0 ? "failed" : "passed",
    failures,
    warnings,
    details
  };
}

function hasUnbalancedFences(text: string): boolean {
  const fences = text.match(/^```/gm);
  return fences !== null && fences.length % 2 !== 0;
}

function hasActiveMarker(text: string, marker: string): boolean {
  return text.split("\n").some((line) => line === marker || line.startsWith(`${marker} `));
}

function trimOutput(output: string): string {
  return output.length > 800 ? `${output.slice(0, 800)}...` : output;
}
