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

  if (lower.includes("agent") || lower.includes("prompt")) {
    return Object.values(ROLE_FILES).filter(fileExists);
  }

  if (lower.includes("mcp") || lower.includes("tool")) {
    return sourceFilePaths().filter((path) => path.endsWith("mcp.js"));
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

export function planTask(task) {
  const scope = choosePrimaryScope(task);
  const lanes = [
    {
      owner: "explore",
      verifier: "reviewer",
      scope,
      acceptance: [
        "scope paths exist in the repository",
        "the plan maps the task brief to concrete files",
        "follow-up implementation can claim files without overlap"
      ],
      verification: ["inspect scope paths", "confirm role files exist"]
    },
    {
      owner: "executor",
      verifier: "tester",
      scope,
      acceptance: [
        "the targeted files can be updated without crossing unrelated surfaces",
        "the change remains bounded to the selected scope",
        "the resulting behavior is verifiable from CLI, MCP, or file output"
      ],
      verification: ["targeted command check", "smoke check when applicable"]
    }
  ];

  return {
    kind: "task_plan",
    objective: task,
    evidence: plannerEvidence(task),
    lanes
  };
}
