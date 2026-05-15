export const GATE_PRE_GIT_VERSION = "gate-pre-git@0.1.0";

export type GateMode = "check" | "staged" | "advice" | "doctor" | "fix" | "push" | "audit" | "update-tools";
export type CheckStatus = "passed" | "failed" | "skipped";
export type FindingSeverity = "error" | "warning" | "info";
export type AdviceSignal =
  | "no_changed_files"
  | "doc_only_change_detected"
  | "source_without_test_change"
  | "surface_sensitive_change_detected"
  | "tooling_or_gate_changed";

export type CommandCheckConfig = {
  name: string;
  run: string;
  modes?: GateMode[];
};

export type ToolInstallKind = "npm" | "python" | "system" | "builtin";

export type GateToolLockEntry = {
  kind: ToolInstallKind;
  version: string;
  package?: string;
  command: string;
};

export type GateLock = {
  version: 1;
  generatedBy: typeof GATE_PRE_GIT_VERSION;
  tools: Record<string, GateToolLockEntry>;
};

export type GatePolicy = {
  strict: boolean;
  autoStageFixes: boolean;
  requireCommandParityWithCI?: boolean;
};

export type GateConfig = {
  textExtensions: string[];
  blockedBasenames: string[];
  blockedMarkers: string[];
  secretPathPatterns: string[];
  ignoreDirs: string[];
  markdown: {
    requireH1: boolean;
    maxHeadingDepth: number;
  };
  policy: GatePolicy;
  profiles: GateProfile[];
  tools: string[];
  hooks: {
    preCommit: boolean;
    prePush: boolean;
  };
  githubAudit: {
    enabled: boolean;
    workflowPath: string;
  };
  commandChecks: CommandCheckConfig[];
};

export type GateProfile = "auto" | "strict" | "node" | "nuxt" | "docs" | "python" | "go" | "rust" | "security";

export type HookKind = "native" | "husky";

export type GateFileSource = "worktree" | "index";

export type GateFile = {
  path: string;
  exists: boolean;
  source: GateFileSource;
  content?: string;
  staged: boolean;
  unstaged: boolean;
  partial: boolean;
  deleted: boolean;
  renamedFrom?: string;
};

export type GateCheck = {
  name: string;
  status: CheckStatus;
  failures: string[];
  warnings: string[];
  details: string[];
  durationMs: number;
};

export type GateFinding = {
  severity: FindingSeverity;
  code: string;
  message: string;
  file?: string;
  source: string;
};

export type GateFix = {
  tool: string;
  file: string;
  action: string;
  staged: boolean;
};

export type GateGovernanceStatus = "passed" | "failed" | "excepted";

export type GateGovernanceExceptionEvidence = {
  active: boolean;
  expired: boolean;
  expiresOn: string;
  reason?: string;
  paths: string[];
};

export type GateGovernanceRecord = {
  file: string;
  zone: string | null;
  owners: string[];
  risk: string | null;
  requiredEvidence: string[];
  status: GateGovernanceStatus;
  exception: GateGovernanceExceptionEvidence | null;
  sensitivePattern?: string;
  generatedPattern?: string;
  failureReasons?: string[];
};

export type GateToolReport = {
  name: string;
  version: string;
  status: "locked" | "installed" | "missing" | "skipped" | "failed";
  command?: string;
  path?: string;
  detail?: string;
};

export type AdapterExecutionStatus =
  | "passed"
  | "policy_failed"
  | "timeout"
  | "tool_missing"
  | "execution_failed"
  | "cache_drift";

export type GateEvidenceProvider = "builtin" | "adapter" | "command" | "mode" | "governance";
export type GateEvidenceStatus = "satisfied" | "failed" | "missing" | "skipped" | "waived";

export type GateEvidenceRecord = {
  id: string;
  provider: GateEvidenceProvider;
  status: GateEvidenceStatus;
  files: string[];
  zones: string[];
  source: string;
  durationMs?: number;
  reason?: string;
};

export type GateImpactAction = "run" | "skip";

export type GateImpactRecord = {
  evidence: string;
  action: GateImpactAction;
  reason: string;
  files: string[];
  zones: string[];
  provider: GateEvidenceProvider | "unknown";
};

export type GateReport = {
  ok: boolean;
  version: typeof GATE_PRE_GIT_VERSION;
  mode: GateMode;
  target: string;
  files: string[];
  findings: GateFinding[];
  fixesApplied: GateFix[];
  filesStaged: string[];
  governance: GateGovernanceRecord[];
  evidence: GateEvidenceRecord[];
  impact: GateImpactRecord[];
  tools: GateToolReport[];
  checks: GateCheck[];
  advice: AdviceSignal[];
  durationMs: number;
};

export type GateOptions = {
  target: string;
  mode: GateMode;
  all: boolean;
  json: boolean;
  runCommands: boolean;
  configPath?: string;
  base?: string;
};
