import { getRuntimeCatalogPaths } from "../../catalog.js";
import {
  baseRepoPaths,
  directoryExists,
  fallbackPrimaryScope,
  fileExists,
  runtimeRoleFilePaths,
  scriptFilePaths,
  selectSourceScope,
  sourceFilePaths,
  uniquePaths
} from "./paths.js";
import {
  includesAny,
  isInternalStateRuntimeTask,
  isPublicStateBridgeTask
} from "./task-kinds.js";

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

function runtimeCliScope() {
  return selectSourceScope([
    "src/index.js"
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
    const cliScope = runtimeCliScope();
    if (cliScope.length > 0) {
      return cliScope;
    }
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
