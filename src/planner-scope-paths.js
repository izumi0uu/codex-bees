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

export function touchesPublicRuntime(paths) {
  return paths.some((path) => PUBLIC_RUNTIME_PATHS.has(path));
}

export function baseRepoPaths() {
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

export function fallbackPrimaryScope() {
  return uniquePaths([
    fileExists("README.md") ? "README.md" : null,
    directoryExists("src") ? "src" : null,
    directoryExists("scripts") ? "scripts" : null
  ]);
}

export function selectSourceScope(paths) {
  return sourceFilePaths().filter((path) => paths.includes(path));
}
