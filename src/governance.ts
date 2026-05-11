import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateCheck, GateFile, GateGovernanceExceptionEvidence, GateGovernanceRecord } from "./types";

export type GovernanceRisk = "low" | "medium" | "high" | "critical" | string;

export type GovernanceZone = {
  name: string;
  owners: string[];
  risk: GovernanceRisk;
  paths: string[];
  requiredEvidence: string[];
};

export type GovernanceException = {
  paths?: string[];
  path?: string;
  reason?: string;
  expiresOn: string;
};

export type GovernanceMap = {
  version?: number;
  zones?: GovernanceZone[];
  sensitivePaths?: string[];
  generatedPaths?: string[];
  exceptions?: GovernanceException[];
};

type GovernanceFile = string | Pick<GateFile, "path">;

export function checkGovernance(target: string, files: GovernanceFile[], currentDate = new Date()): GateCheck {
  return evaluateGovernance(target, files, currentDate).check;
}

export function evaluateGovernance(
  target: string,
  files: GovernanceFile[],
  currentDate = new Date()
): { check: GateCheck; records: GateGovernanceRecord[] } {
  const started = Date.now();
  const mapPath = join(target, ".gate-pre-git", "governance.json");

  if (!existsSync(mapPath)) {
    return {
      check: finish(started, {
        status: "skipped",
        failures: [],
        warnings: [],
        details: ["missing_map=.gate-pre-git/governance.json"]
      }),
      records: []
    };
  }

  const parsed = loadGovernanceMap(mapPath);
  if (!parsed.ok) {
    return {
      check: finish(started, {
        status: "failed",
        failures: [`invalid governance map: ${parsed.error}`],
        warnings: [],
        details: [mapPath]
      }),
      records: []
    };
  }

  const map = parsed.map;
  const paths = files.map((file) => normalizePath(typeof file === "string" ? file : file.path));
  const zones = map.zones ?? [];
  const sensitivePaths = map.sensitivePaths ?? [];
  const generatedPaths = map.generatedPaths ?? [];
  const exceptions = map.exceptions ?? [];
  const failures: string[] = [];
  const details: string[] = [`files=${paths.length}`];
  const records: GateGovernanceRecord[] = [];

  for (const file of paths) {
    const matchingExceptions = exceptions.filter((exception) =>
      patternsForException(exception).some((pattern) => matchesPath(pattern, file))
    );
    const expiredExceptions = matchingExceptions.filter((exception) => isExpired(exception.expiresOn, currentDate));
    const activeException = matchingExceptions.find((exception) => !isExpired(exception.expiresOn, currentDate));

    for (const exception of expiredExceptions) {
      failures.push(`expired governance exception for ${file}: expiresOn=${exception.expiresOn}`);
    }

    if (activeException !== undefined) {
      details.push(`exception=${file} expiresOn=${activeException.expiresOn}`);
      records.push({
        file,
        zone: null,
        owners: [],
        risk: null,
        requiredEvidence: [],
        status: "excepted",
        exception: exceptionEvidence(activeException, true, false)
      });
      continue;
    }

    const sensitivePattern = sensitivePaths.find((pattern) => matchesPath(pattern, file));
    const fileFailures: string[] = [];
    if (sensitivePattern !== undefined) {
      const failure = `sensitive path requires active governance exception: ${file} pattern=${sensitivePattern}`;
      failures.push(failure);
      fileFailures.push(failure);
    }

    const generatedPattern = generatedPaths.find((pattern) => matchesPath(pattern, file));
    if (generatedPattern !== undefined) {
      const failure = `generated path requires active governance exception: ${file} pattern=${generatedPattern}`;
      failures.push(failure);
      fileFailures.push(failure);
    }

    const zone = selectGovernanceZone(zones, file);
    if (zone === undefined) {
      const failure = `unowned governance zone for ${file}`;
      failures.push(failure);
      fileFailures.push(failure);
      records.push(
        compactRecord({
          file,
          zone: null,
          owners: [],
          risk: null,
          requiredEvidence: [],
          status: "failed",
          exception: expiredExceptions[0] === undefined ? null : exceptionEvidence(expiredExceptions[0], false, true),
          sensitivePattern,
          generatedPattern,
          failureReasons: fileFailures
        })
      );
      continue;
    }

    details.push(
      `zone=${zone.name} file=${file} owners=${zone.owners.join(",")} risk=${zone.risk} evidence=${zone.requiredEvidence.join(",")}`
    );
    records.push(
      compactRecord({
        file,
        zone: zone.name,
        owners: zone.owners,
        risk: zone.risk,
        requiredEvidence: zone.requiredEvidence,
        status: fileFailures.length === 0 && expiredExceptions.length === 0 ? "passed" : "failed",
        exception: expiredExceptions[0] === undefined ? null : exceptionEvidence(expiredExceptions[0], false, true),
        sensitivePattern,
        generatedPattern,
        failureReasons: [
          ...fileFailures,
          ...expiredExceptions.map((exception) => `expired exception: ${exception.expiresOn}`)
        ]
      })
    );
  }

  return {
    check: finish(started, {
      status: failures.length > 0 ? "failed" : "passed",
      failures,
      warnings: [],
      details
    }),
    records: records.sort((left, right) => left.file.localeCompare(right.file))
  };
}

export function matchesGovernancePath(pattern: string, path: string): boolean {
  return matchesPath(pattern, path);
}

function loadGovernanceMap(mapPath: string): { ok: true; map: GovernanceMap } | { ok: false; error: string } {
  try {
    return { ok: true, map: JSON.parse(readFileSync(mapPath, "utf8")) as GovernanceMap };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

function finish(started: number, result: Omit<GateCheck, "name" | "durationMs">): GateCheck {
  return {
    name: "governance",
    durationMs: Date.now() - started,
    ...result
  };
}

function patternsForException(exception: GovernanceException): string[] {
  return [...(exception.paths ?? []), ...(exception.path === undefined ? [] : [exception.path])];
}

function exceptionEvidence(
  exception: GovernanceException,
  active: boolean,
  expired: boolean
): GateGovernanceExceptionEvidence {
  return {
    active,
    expired,
    expiresOn: exception.expiresOn,
    reason: exception.reason,
    paths: patternsForException(exception)
  };
}

function compactRecord(record: GateGovernanceRecord): GateGovernanceRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([key, value]) => {
      if (value === undefined) return false;
      if (key === "failureReasons" && Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  ) as GateGovernanceRecord;
}

function isExpired(expiresOn: string, currentDate: Date): boolean {
  const expiresAt = Date.parse(`${expiresOn}T23:59:59.999Z`);
  return Number.isNaN(expiresAt) || expiresAt < currentDate.getTime();
}

function selectGovernanceZone(zones: GovernanceZone[], path: string): GovernanceZone | undefined {
  let selected: { zone: GovernanceZone; score: number } | undefined;

  for (const zone of zones) {
    const score = bestZoneScore(zone, path);
    if (score === null) continue;
    if (selected === undefined || score > selected.score) {
      selected = { zone, score };
    }
  }

  return selected?.zone;
}

function bestZoneScore(zone: GovernanceZone, path: string): number | null {
  let best: number | null = null;
  for (const pattern of zone.paths) {
    if (!matchesPath(pattern, path)) continue;
    const score = patternSpecificity(pattern);
    if (best === null || score > best) best = score;
  }
  return best;
}

function patternSpecificity(pattern: string): number {
  const normalizedPattern = normalizePath(pattern);
  const segments = normalizedPattern.split("/").filter(Boolean);
  const leadingLiteralSegments = segments.findIndex((segment) => segment.includes("*"));
  const literalPrefixSegments = leadingLiteralSegments === -1 ? segments.length : leadingLiteralSegments;
  const wildcardCount = normalizedPattern.split("").filter((char) => char === "*").length;
  const literalLength = normalizedPattern.replace(/\*/g, "").length;
  const exactBonus = wildcardCount === 0 ? 100_000 : 0;

  return exactBonus + literalPrefixSegments * 1_000 + literalLength * 10 - wildcardCount;
}

function matchesPath(pattern: string, path: string): boolean {
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(path);
  if (!normalizedPattern.includes("*")) return normalizedPattern === normalizedPath;
  return globToRegExp(normalizedPattern).test(normalizedPath);
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    const afterNext = pattern[index + 2];

    if (char === "*" && next === "*" && afterNext === "/") {
      source += "(?:.*/)?";
      index += 2;
      continue;
    }
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    source += escapeRegExp(char);
  }
  return new RegExp(`${source}$`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
}
