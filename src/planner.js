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
  const scope = choosePrimaryScope(task);
  return [
    {
      lane: "lane-1",
      owner: "explore",
      verifier: "reviewer",
      summary: `Map scope and verification for: ${task}`,
      scope,
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
      scope,
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

  return {
    kind: "task_plan",
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
  return {
    kind: "queued_plan",
    objective: task,
    lanes: plan.lanes,
    created
  };
}
