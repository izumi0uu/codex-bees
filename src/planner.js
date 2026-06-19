import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROLE_FILES = {
  explore: ".codex/agents/explore.md",
  executor: ".codex/agents/executor.md",
  reviewer: ".codex/agents/reviewer.md",
  tester: ".codex/agents/tester.md"
};

function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

function baseRepoPaths() {
  const paths = [];
  for (const candidate of ["src", "scripts", ".codex/agents", ".codex/skills"]) {
    if (directoryExists(candidate) || fileExists(candidate)) {
      paths.push(candidate);
    }
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
    return Object.values(ROLE_FILES).filter(fileExists);
  }

  if (lower.includes("skill")) {
    return [".codex/skills"].filter((path) => directoryExists(path) || fileExists(path));
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
  const primarySet = new Set(primaryScope);
  const candidates = uniquePaths([
    ...Object.values(ROLE_FILES).filter(fileExists),
    directoryExists(".codex/skills") ? ".codex/skills" : null,
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

function plannerEvidence(task) {
  return {
    task,
    repoSignals: {
      hasSrc: directoryExists("src"),
      hasScripts: directoryExists("scripts"),
      hasAgents: directoryExists(".codex/agents"),
      hasSkills: directoryExists(".codex/skills")
    },
    roleFiles: Object.entries(ROLE_FILES)
      .filter(([, path]) => fileExists(path))
      .map(([role, path]) => ({ role, path }))
  };
}

function buildPlanLanes(task) {
  const implementationScope = choosePrimaryScope(task);
  const discoveryScope = chooseDiscoveryScope(implementationScope);
  return [
    {
      lane: "lane-1",
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
    },
    {
      lane: "lane-2",
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
    }
  ];
}

function laneCountToWorkers(lanes) {
  const owners = new Set(lanes.map((lane) => lane.owner).filter(Boolean));
  return Math.max(owners.size, lanes.length > 0 ? 1 : 0);
}

export function planTask(task) {
  const lanes = buildPlanLanes(task);
  const recommendedReason = lanes.length > 1 ? "multi_lane_plan_ready" : "single_lane_plan_ready";

  return {
    kind: "task_plan",
    recommendedReason,
    objective: task,
    evidence: plannerEvidence(task),
    lanes
  };
}

export function planSwarm(task) {
  const plan = planTask(task);
  return {
    kind: "planned_swarm",
    objective: task,
    evidence: plan.evidence,
    swarm: {
      objective: task,
      topology: "bounded-local",
      maxWorkers: laneCountToWorkers(plan.lanes),
      laneSource: "planner",
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
    lanes: plan.lanes,
    created
  };
}
