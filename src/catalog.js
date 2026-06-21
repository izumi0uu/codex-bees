import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUNDLED_PREFIX = "@bundled";

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function readText(path) {
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

function toDisplayPath(path, { preferBundled = false } = {}) {
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

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return {};
  }

  const lines = text.split("\n");
  const data = {};
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      break;
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }

  return data;
}

export function listAgentCatalog() {
  const paths = getRuntimeCatalogPaths();
  if (!isDirectory(paths.agentDir)) {
    return [];
  }

  return readdirSync(paths.agentDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(paths.agentDir, name);
      const frontmatter = parseFrontmatter(readText(path));
      const id = name.replace(/\.md$/, "");
      return {
        id,
        name: frontmatter.name ?? id,
        description: frontmatter.description ?? null,
        path: toDisplayPath(path),
        source: paths.source
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getAgentCatalogEntry(id) {
  if (!id) {
    return undefined;
  }

  return listAgentCatalog().find((entry) => entry.id === id);
}

export function listSkillCatalog() {
  const paths = getRuntimeCatalogPaths();
  if (!isDirectory(paths.skillDir)) {
    return [];
  }

  return readdirSync(paths.skillDir)
    .map((name) => {
      const root = join(paths.skillDir, name);
      const directFile = join(paths.skillDir, `${name}.md`);
      const skillFile = isDirectory(root) ? join(root, "SKILL.md") : directFile;
      if (!isFile(skillFile)) {
        return null;
      }

      const frontmatter = parseFrontmatter(readText(skillFile));
      return {
        id: name,
        name: frontmatter.name ?? name,
        description: frontmatter.description ?? null,
        path: toDisplayPath(skillFile),
        source: paths.source
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getSkillCatalogEntry(id) {
  if (!id) {
    return undefined;
  }

  return listSkillCatalog().find((entry) => entry.id === id);
}

export function listAgentRoleIds() {
  return listAgentCatalog().map((agent) => agent.id);
}

export function getRuntimeCatalog() {
  const paths = getRuntimeCatalogPaths();
  const preferBundled = paths.source === "bundled";
  return {
    source: paths.source,
    paths: {
      codexDir: toDisplayPath(paths.codexDir, { preferBundled }),
      agentDir: toDisplayPath(paths.agentDir, { preferBundled }),
      skillDir: toDisplayPath(paths.skillDir, { preferBundled })
    },
    agents: listAgentCatalog().map((agent) => ({
      ...agent,
      path: toDisplayPath(resolveRuntimeCatalogPath(`agents/${agent.id}.md`) ?? agent.path, { preferBundled })
    })),
    skills: listSkillCatalog().map((skill) => {
      const resolvedSkillPath =
        resolveRuntimeCatalogPath(`skills/${skill.id}/SKILL.md`) ??
        resolveRuntimeCatalogPath(`skills/${skill.id}.md`) ??
        skill.path;
      return {
        ...skill,
        path: toDisplayPath(resolvedSkillPath, { preferBundled })
      };
    })
  };
}

export function getRuntimeCatalogView() {
  const catalog = getRuntimeCatalog();
  const totalEntries = catalog.agents.length + catalog.skills.length;
  return {
    kind: "runtime_catalog_view",
    recommendedReason: totalEntries > 0 ? "catalog_entries_loaded" : "catalog_empty",
    counts: {
      agents: catalog.agents.length,
      skills: catalog.skills.length,
      totalEntries
    },
    catalog
  };
}
