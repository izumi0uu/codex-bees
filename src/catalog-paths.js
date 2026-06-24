import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLED_PREFIX = "@bundled";

export function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

export function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export function readText(path) {
  return isFile(path) ? readFileSync(path, "utf8") : "";
}

function workspaceCodexDir() {
  return join(cwd(), ".codex");
}

function bundledCodexDir() {
  return join(PACKAGE_ROOT, ".codex");
}

function bundledDistCodexDir() {
  return join(MODULE_DIR, ".codex");
}

function hasPathPrefix(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function toDisplayPath(path, { preferBundled = false } = {}) {
  const currentWorkingDirectory = cwd();
  const bundledPackagePath = hasPathPrefix(path, PACKAGE_ROOT)
    ? `${BUNDLED_PREFIX}/${relative(PACKAGE_ROOT, path)}`
    : null;

  if (preferBundled && bundledPackagePath) {
    return bundledPackagePath;
  }

  if (hasPathPrefix(path, currentWorkingDirectory)) {
    return path.slice(currentWorkingDirectory.length + 1);
  }

  if (bundledPackagePath) {
    return bundledPackagePath;
  }

  return path;
}

export function getBundledRuntimeCatalogPaths() {
  const bundledPath = bundledCodexDir();
  const bundledDistPath = bundledDistCodexDir();
  const source = isDirectory(bundledDistPath) || isDirectory(bundledPath) ? "bundled" : "missing";
  const codexDir = isDirectory(bundledDistPath)
    ? bundledDistPath
    : isDirectory(bundledPath)
      ? bundledPath
      : bundledDistPath;

  return {
    source,
    workingDirectory: cwd(),
    packageRoot: PACKAGE_ROOT,
    codexDir,
    agentDir: join(codexDir, "agents"),
    skillDir: join(codexDir, "skills")
  };
}

export function getRuntimeCatalogPaths() {
  const workspacePath = workspaceCodexDir();
  const bundledPath = bundledCodexDir();
  const bundledDistPath = bundledDistCodexDir();
  const source = isDirectory(workspacePath)
    ? "workspace"
    : isDirectory(bundledPath) || isDirectory(bundledDistPath)
      ? "bundled"
      : "missing";
  const codexDir =
    source === "workspace"
      ? workspacePath
      : isDirectory(bundledDistPath)
        ? bundledDistPath
        : isDirectory(bundledPath)
          ? bundledPath
          : source === "bundled"
            ? bundledDistPath
            : workspacePath;

  return {
    source,
    workingDirectory: cwd(),
    packageRoot: PACKAGE_ROOT,
    codexDir,
    agentDir: join(codexDir, "agents"),
    skillDir: join(codexDir, "skills")
  };
}

export function resolveRuntimeCatalogPath(relativePath) {
  const paths = getRuntimeCatalogPaths();
  const resolved = join(paths.codexDir, relativePath);
  return isFile(resolved) || isDirectory(resolved) ? resolved : null;
}
