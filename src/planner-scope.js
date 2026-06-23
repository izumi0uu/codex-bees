import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getRuntimeCatalogPaths, resolveRuntimeCatalogPath } from "./catalog.js";

const ROLE_FILES = {
  explore: "agents/explore.md",
  executor: "agents/executor.md",
  reviewer: "agents/reviewer.md",
  tester: "agents/tester.md"
};

const PUBLIC_RUNTIME_PATHS = new Set([
  "src/index.js",
  "src/mcp.js",
  "src/planner.js",
  "src/state.js",
  "src/state-public.js",
  "src/api.js"
]);

export function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

export function runtimeRoleFilePath(role) {
  return resolveRuntimeCatalogPath(ROLE_FILES[role]);
}

export function runtimeRoleFilePaths() {
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

export function sourceFilePaths() {
  if (!directoryExists("src")) {
    return [];
  }
  return readdirSync("src")
    .map((name) => join("src", name))
    .filter((path) => fileExists(path));
}

export function scriptFilePaths() {
  if (!directoryExists("scripts")) {
    return [];
  }
  return readdirSync("scripts")
    .map((name) => join("scripts", name))
    .filter((path) => fileExists(path));
}

export function uniquePaths(paths) {
  return Array.from(new Set(paths.filter(Boolean)));
}

function fallbackPrimaryScope() {
  return uniquePaths([
    fileExists("README.md") ? "README.md" : null,
    directoryExists("src") ? "src" : null,
    directoryExists("scripts") ? "scripts" : null
  ]);
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function touchesPublicRuntime(paths) {
  return paths.some((path) => PUBLIC_RUNTIME_PATHS.has(path));
}

function selectSourceScope(paths) {
  return sourceFilePaths().filter((path) => paths.includes(path));
}

function isPublicStateBridgeTask(lower) {
  return (
    lower.includes("state bridge") ||
    lower.includes("public state") ||
    (lower.includes("state") && lower.includes("public") && lower.includes("bridge")) ||
    (lower.includes("state") && lower.includes("public") && lower.includes("facade")) ||
    (lower.includes("state") && lower.includes("export"))
  );
}

function isInternalStateRuntimeTask(lower) {
  return (
    lower.includes("state runtime") ||
    lower.includes("runtime state") ||
    lower.includes("runtime facade") ||
    (lower.includes("internal") && lower.includes("state") && lower.includes("facade")) ||
    (lower.includes("internal") && lower.includes("runtime") && lower.includes("state"))
  );
}

function publicStateBridgeScope() {
  return selectSourceScope([
    "src/state.js",
    "src/state-public.js",
    "src/api.js"
  ]);
}

function internalStateRuntimeScope() {
  return selectSourceScope([
    "src/state-runtime.js",
    "src/index.js",
    "src/mcp.js"
  ]);
}

function plannerKernelScope(lower) {
  const paths = ["src/planner.js", "src/index.js", "src/mcp.js"];
  if (isPublicStateBridgeTask(lower)) {
    paths.push("src/state.js", "src/state-public.js", "src/api.js");
  } else if (
    isInternalStateRuntimeTask(lower) ||
    includesAny(lower, ["state", "queue", "claim", "review", "dispatch", "handoff", "worker", "leader"])
  ) {
    paths.push("src/state-runtime.js");
  }
  return selectSourceScope(paths);
}

export function choosePrimaryScope(task) {
  const lower = task.toLowerCase();

  if (
    lower.includes("readme") ||
    lower.includes("docs") ||
    lower.includes("documentation") ||
    lower.includes("guide") ||
    lower.includes("notes") ||
    lower.includes("changelog")
  ) {
    return ["README.md"];
  }

  if (isPublicStateBridgeTask(lower)) {
    const bridgeScope = publicStateBridgeScope();
    if (bridgeScope.length > 0) {
      return bridgeScope;
    }
  }

  if (isInternalStateRuntimeTask(lower)) {
    const runtimeScope = internalStateRuntimeScope();
    if (runtimeScope.length > 0) {
      return runtimeScope;
    }
  }

  if (
    lower.includes("swarm") ||
    lower.includes("parallel") ||
    lower.includes("lane") ||
    lower.includes("planner")
  ) {
    return plannerKernelScope(lower);
  }

  if (
    lower.includes("task") ||
    lower.includes("queue") ||
    lower.includes("claim") ||
    lower.includes("review") ||
    lower.includes("state")
  ) {
    const runtimeScope = internalStateRuntimeScope();
    if (runtimeScope.length > 0) {
      return runtimeScope;
    }
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

  const fallbackScope = fallbackPrimaryScope();
  if (fallbackScope.length > 0) {
    return fallbackScope;
  }

  return baseRepoPaths();
}

export function chooseDiscoveryScope(primaryScope) {
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

export function chooseVerificationScope(task, implementationScope) {
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
      implementationScope.some((path) =>
        [
          "src/index.js",
          "src/mcp.js",
          "src/planner.js",
          "src/state.js",
          "src/state-public.js",
          "src/state-runtime.js"
        ].includes(path)
      )
    )
  ) {
    candidates.push("scripts/build.mjs");
  }

  if (candidates.length > 0) {
    return uniquePaths(candidates);
  }

  return implementationScope.slice(0, Math.min(1, implementationScope.length));
}

export function chooseDocumentationScope(implementationScope) {
  const candidates = [];
  if (fileExists("README.md")) {
    candidates.push("README.md");
  }

  return candidates.length > 0 ? candidates : implementationScope.slice(0, Math.min(1, implementationScope.length));
}

export function inferPlannerIntent(task, implementationScope = choosePrimaryScope(task)) {
  const lower = task.toLowerCase();
  const docs = includesAny(lower, ["readme", "docs", "documentation", "guide", "notes", "changelog", "example", "help"]);
  const runtime = includesAny(lower, ["runtime", "cli", "command", "mcp", "tool"]);
  const internalRuntime = isInternalStateRuntimeTask(lower);
  const publicRuntime = runtime && !internalRuntime;
  const coordination = includesAny(lower, [
    "task",
    "queue",
    "claim",
    "review",
    "state",
    "swarm",
    "planner",
    "lane",
    "parallel",
    "dispatch",
    "orchestrate"
  ]);
  const build = includesAny(lower, ["build", "smoke", "script", "test", "check", "verify", "verification", "package", "pack"]);
  const catalog = includesAny(lower, ["skill", "agent", "prompt", "catalog"]);
  const docsOnly = docs && implementationScope.length === 1 && implementationScope[0] === "README.md";
  const implementationTouchesPublicRuntime = touchesPublicRuntime(implementationScope);
  const verificationHeavy = !docsOnly && (runtime || coordination || build || implementationTouchesPublicRuntime);

  return {
    docs,
    docsOnly,
    runtime,
    publicRuntime,
    internalRuntime,
    coordination,
    build,
    catalog,
    verificationHeavy,
    additionalDocsLane: docs && !docsOnly
  };
}
