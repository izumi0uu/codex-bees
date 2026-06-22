import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getRuntimeCatalogPaths, resolveRuntimeCatalogPath } from "./catalog.js";

const DEFAULT_PLANNER_PROFILE_ID = "bounded-local";
const ROLE_FILES = {
  explore: "agents/explore.md",
  executor: "agents/executor.md",
  reviewer: "agents/reviewer.md",
  tester: "agents/tester.md"
};

function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

function runtimeRoleFilePath(role) {
  return resolveRuntimeCatalogPath(ROLE_FILES[role]);
}

function runtimeRoleFilePaths() {
  return Object.keys(ROLE_FILES)
    .map((role) => runtimeRoleFilePath(role))
    .filter(Boolean);
}

function baseRepoPaths() {
  const catalogPaths = getRuntimeCatalogPaths();
  const paths = [];
  for (const candidate of ["src", "scripts"]) {
    if (directoryExists(candidate) || fileExists(candidate)) {
      paths.push(candidate);
    }
  }
  if (directoryExists(catalogPaths.agentDir)) {
    paths.push(catalogPaths.agentDir);
  }
  if (directoryExists(catalogPaths.skillDir)) {
    paths.push(catalogPaths.skillDir);
  }
  return paths;
}

function sourceFilePaths() {
  if (!directoryExists("src")) {
    return [];
  }
  return readdirSync("src")
    .map((name) => join("src", name))
    .filter((path) => fileExists(path));
}

function scriptFilePaths() {
  if (!directoryExists("scripts")) {
    return [];
  }
  return readdirSync("scripts")
    .map((name) => join("scripts", name))
    .filter((path) => fileExists(path));
}

function uniquePaths(paths) {
  return Array.from(new Set(paths.filter(Boolean)));
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function choosePrimaryScope(task) {
  const lower = task.toLowerCase();

  if (lower.includes("readme") || lower.includes("docs") || lower.includes("documentation")) {
    return ["README.md"];
  }

  if (
    lower.includes("swarm") ||
    lower.includes("parallel") ||
    lower.includes("lane") ||
    lower.includes("planner") ||
    lower.includes("plan ")
  ) {
    return sourceFilePaths().filter((path) => ["src/planner.js", "src/index.js", "src/mcp.js", "src/state.js"].includes(path));
  }

  if (
    lower.includes("task") ||
    lower.includes("queue") ||
    lower.includes("claim") ||
    lower.includes("review") ||
    lower.includes("state")
  ) {
    return sourceFilePaths().filter((path) =>
      ["src/state.js", "src/index.js", "src/mcp.js"].includes(path)
    );
  }

  if (lower.includes("agent") || lower.includes("prompt")) {
    return runtimeRoleFilePaths();
  }

  if (lower.includes("skill")) {
    const skillDir = getRuntimeCatalogPaths().skillDir;
    return [skillDir].filter((path) => directoryExists(path) || fileExists(path));
  }

  if (lower.includes("mcp") || lower.includes("tool")) {
    return sourceFilePaths().filter((path) => path.endsWith("mcp.js"));
  }

  if (lower.includes("runtime") || lower.includes("cli") || lower.includes("command")) {
    return sourceFilePaths().filter((path) => path.endsWith("index.js"));
  }

  if (lower.includes("build") || lower.includes("smoke") || lower.includes("script")) {
    return scriptFilePaths();
  }

  const srcFiles = sourceFilePaths();
  if (srcFiles.length > 0) {
    return srcFiles;
  }

  return baseRepoPaths();
}

function chooseDiscoveryScope(primaryScope) {
  const catalogPaths = getRuntimeCatalogPaths();
  const primarySet = new Set(primaryScope);
  const candidates = uniquePaths([
    ...runtimeRoleFilePaths(),
    directoryExists(catalogPaths.skillDir) ? catalogPaths.skillDir : null,
    fileExists("README.md") ? "README.md" : null,
    ...scriptFilePaths(),
    ...sourceFilePaths()
  ]);

  const disjoint = candidates.filter((path) => !primarySet.has(path));
  if (disjoint.length > 0) {
    return disjoint.slice(0, Math.min(4, disjoint.length));
  }

  return primaryScope.slice(0, Math.min(2, primaryScope.length));
}

function chooseVerificationScope(task, implementationScope) {
  const lower = task.toLowerCase();
  const candidates = [];

  if (fileExists("scripts/smoke.mjs")) {
    candidates.push("scripts/smoke.mjs");
  }

  if (
    fileExists("scripts/build.mjs") &&
    (
      lower.includes("build") ||
      lower.includes("package") ||
      implementationScope.some((path) => ["src/index.js", "src/mcp.js", "src/planner.js"].includes(path))
    )
  ) {
    candidates.push("scripts/build.mjs");
  }

  if (candidates.length > 0) {
    return uniquePaths(candidates);
  }

  return implementationScope.slice(0, Math.min(1, implementationScope.length));
}

function chooseDocumentationScope(implementationScope) {
  const candidates = [];
  if (fileExists("README.md")) {
    candidates.push("README.md");
  }

  return candidates.length > 0 ? candidates : implementationScope.slice(0, Math.min(1, implementationScope.length));
}

function inferPlannerIntent(task, implementationScope = choosePrimaryScope(task)) {
  const lower = task.toLowerCase();
  const docs = includesAny(lower, ["readme", "docs", "documentation", "guide", "example", "help"]);
  const runtime = includesAny(lower, ["runtime", "cli", "command", "mcp", "tool"]);
  const coordination = includesAny(lower, ["task", "queue", "claim", "review", "state", "swarm", "planner", "plan ", "lane", "parallel"]);
  const build = includesAny(lower, ["build", "smoke", "script", "test", "check", "verify", "verification", "package", "pack"]);
  const catalog = includesAny(lower, ["skill", "agent", "prompt", "catalog"]);
  const docsOnly = docs && implementationScope.length === 1 && implementationScope[0] === "README.md";
  const implementationTouchesPublicRuntime = implementationScope.some((path) =>
    ["src/index.js", "src/mcp.js", "src/planner.js", "src/state.js"].includes(path)
  );
  const verificationHeavy = !docsOnly && (runtime || coordination || build || implementationTouchesPublicRuntime);

  return {
    docs,
    docsOnly,
    runtime,
    coordination,
    build,
    catalog,
    verificationHeavy,
    additionalDocsLane: docs && !docsOnly
  };
}

function plannerEvidence(task) {
  const catalogPaths = getRuntimeCatalogPaths();
  const implementationScope = choosePrimaryScope(task);
  const intent = inferPlannerIntent(task, implementationScope);
  const documentationScope = intent.docs || intent.docsOnly ? chooseDocumentationScope(implementationScope) : [];
  const verificationScope = intent.verificationHeavy ? chooseVerificationScope(task, implementationScope) : [];

  return {
    task,
    intent,
    repoSignals: {
      hasSrc: directoryExists("src"),
      hasScripts: directoryExists("scripts"),
      hasAgents: directoryExists(catalogPaths.agentDir),
      hasSkills: directoryExists(catalogPaths.skillDir)
    },
    scopeHints: {
      primary: implementationScope,
      discovery: intent.docsOnly ? [] : chooseDiscoveryScope(implementationScope),
      verification: verificationScope,
      documentation: documentationScope
    },
    roleFiles: Object.entries(ROLE_FILES)
      .map(([role]) => ({ role, path: runtimeRoleFilePath(role) }))
      .filter((entry) => entry.path)
  };
}

function buildDiscoveryLane(task, discoveryScope) {
  return {
    owner: "explore",
    verifier: "reviewer",
    summary: `Map scope and verification for: ${task}`,
    scope: discoveryScope,
    acceptance: [
      "scope paths exist in the repository",
      "the plan maps the task brief to concrete files",
      "follow-up implementation can claim files without overlap"
    ],
    verification: ["inspect scope paths", "confirm role files exist"]
  };
}

function buildExecutionLane(task, implementationScope) {
  return {
    owner: "executor",
    verifier: "tester",
    summary: `Implement the bounded repo change for: ${task}`,
    scope: implementationScope,
    acceptance: [
      "the targeted files can be updated without crossing unrelated surfaces",
      "the change remains bounded to the selected scope",
      "the resulting behavior is verifiable from CLI, MCP, or file output"
    ],
    verification: ["targeted command check", "smoke check when applicable"]
  };
}

function buildVerificationLane(task, verificationScope, dependsOn = []) {
  return {
    owner: "tester",
    verifier: "reviewer",
    summary: `Verify the bounded contract for: ${task}`,
    scope: verificationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "the planned scope has fresh verification evidence",
      "the bounded change is exercised from shipped command or script surfaces",
      "follow-up reviewers can inspect one verification-focused lane without reopening implementation ownership"
    ],
    verification: ["run targeted command checks", "run build or smoke verification when applicable"]
  };
}

function buildDocumentationLane(task, documentationScope, dependsOn = []) {
  return {
    owner: "reviewer",
    verifier: "tester",
    summary: `Document the operator-facing contract for: ${task}`,
    scope: documentationScope,
    ...(dependsOn.length > 0 ? { dependsOn } : {}),
    acceptance: [
      "public-facing docs or examples match the bounded change",
      "the documented scope stays limited to shipped product surfaces",
      "operators can discover the change without tracker-only residue"
    ],
    verification: ["inspect README or shipped examples", "run documentation-linked example when applicable"]
  };
}

function assignLaneIds(lanes) {
  return lanes.map((lane, index) => ({
    ...lane,
    lane: `lane-${index + 1}`
  }));
}

function buildBoundedLocalPlanLanes(task) {
  const implementationScope = choosePrimaryScope(task);
  const intent = inferPlannerIntent(task, implementationScope);

  if (intent.docsOnly) {
    return assignLaneIds([
      buildDocumentationLane(task, implementationScope)
    ]);
  }

  const discoveryScope = chooseDiscoveryScope(implementationScope);
  const lanes = [
    buildDiscoveryLane(task, discoveryScope),
    {
      ...buildExecutionLane(task, implementationScope),
      dependsOn: ["lane-1"]
    }
  ];

  if (intent.verificationHeavy) {
    lanes.push(buildVerificationLane(task, chooseVerificationScope(task, implementationScope), ["lane-2"]));
  }

  if (intent.additionalDocsLane) {
    lanes.push(buildDocumentationLane(task, chooseDocumentationScope(implementationScope), ["lane-2"]));
  }

  return assignLaneIds(lanes);
}

const PLANNER_PROFILES = {
  [DEFAULT_PLANNER_PROFILE_ID]: {
    id: DEFAULT_PLANNER_PROFILE_ID,
    description: "Adaptive local bounded planner for Codex-only execution.",
    topology: "bounded-local",
    laneSource: "planner",
    adaptive: true,
    laneModel: "adaptive-bounded-lanes",
    roles: ["explore", "reviewer", "executor", "tester"],
    constraints: [
      "codex-only runtime boundary",
      "disjoint lane ownership",
      "local state-backed task queue"
    ],
    buildLanes: buildBoundedLocalPlanLanes
  }
};

function toPlannerProfile(profile) {
  return {
    id: profile.id,
    description: profile.description,
    topology: profile.topology,
    laneSource: profile.laneSource,
    adaptive: profile.adaptive,
    laneModel: profile.laneModel,
    roles: [...profile.roles],
    constraints: [...profile.constraints]
  };
}

function getPlannerProfileRecord(id = DEFAULT_PLANNER_PROFILE_ID) {
  const profile = PLANNER_PROFILES[id];
  return profile ?? PLANNER_PROFILES[DEFAULT_PLANNER_PROFILE_ID];
}

export function getPlannerProfiles() {
  return Object.values(PLANNER_PROFILES).map(toPlannerProfile);
}

export function getPlannerProfile(id = DEFAULT_PLANNER_PROFILE_ID) {
  const profile = PLANNER_PROFILES[id];
  return profile ? toPlannerProfile(profile) : undefined;
}

export function getPlannerProfileView(id = DEFAULT_PLANNER_PROFILE_ID) {
  const profile = getPlannerProfile(id);
  return {
    kind: "planner_profile_view",
    recommendedReason: profile ? "planner_profile_loaded" : "planner_profile_missing",
    id: id ?? null,
    matchedProfile: profile?.id ?? null,
    profile: profile ?? null
  };
}

function laneCountToWorkers(lanes) {
  const owners = new Set(lanes.map((lane) => lane.owner).filter(Boolean));
  return Math.max(owners.size, lanes.length > 0 ? 1 : 0);
}

export function planTask(task) {
  const profile = getPlannerProfileRecord();
  const planner = toPlannerProfile(profile);
  const lanes = profile.buildLanes(task);
  const recommendedReason = lanes.length > 1 ? "multi_lane_plan_ready" : "single_lane_plan_ready";

  return {
    kind: "task_plan",
    recommendedReason,
    objective: task,
    planner,
    evidence: plannerEvidence(task),
    lanes
  };
}

export function planSwarm(task) {
  const plan = planTask(task);
  const recommendedReason = plan.lanes.length > 1 ? "multi_lane_swarm_ready" : "single_lane_swarm_ready";
  return {
    kind: "planned_swarm",
    recommendedReason,
    objective: task,
    planner: plan.planner,
    evidence: plan.evidence,
    swarm: {
      objective: task,
      topology: plan.planner.topology,
      maxWorkers: laneCountToWorkers(plan.lanes),
      laneSource: plan.planner.laneSource,
      lanes: plan.lanes,
      notes: `Generated from plan for: ${task}`
    }
  };
}

export function queueTasksFromPlan(task, addTasks) {
  const plan = planTask(task);
  const tasks = plan.lanes.map((lane) => ({
    title: lane.summary,
    status: "todo",
    queueStatus: "queued",
    owner: lane.owner,
    verifier: lane.verifier,
    objective: task,
    lane: lane.lane,
    scope: lane.scope,
    dependsOn: lane.dependsOn ?? null,
    acceptance: lane.acceptance,
    verification: lane.verification,
    notes: `Generated from plan for: ${task}`
  }));

  const created = addTasks(tasks);
  const recommendedReason = created.length > 1 ? "multiple_plan_tasks_queued" : "single_plan_task_queued";
  return {
    kind: "queued_plan",
    recommendedReason,
    objective: task,
    planner: plan.planner,
    lanes: plan.lanes,
    created
  };
}
