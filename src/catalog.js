import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import { createCollectionView, createResolvedItemView } from "./state-view-helpers.js";

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

function normalizeText(text) {
  return text.replace(/\r\n?/g, "\n");
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

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`"'()[\]{}]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function parseFrontmatterBlock(text) {
  const normalized = normalizeText(text);
  if (!normalized.startsWith("---\n")) {
    return {
      frontmatter: {},
      body: normalized
    };
  }

  const lines = normalized.split("\n");
  const data = {};
  let closingIndex = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      closingIndex = index;
      break;
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }

  return {
    frontmatter: data,
    body: closingIndex >= 0 ? lines.slice(closingIndex + 1).join("\n") : normalized
  };
}

function parseFrontmatter(text) {
  return parseFrontmatterBlock(text).frontmatter;
}

function parseCatalogDocument(text) {
  const { frontmatter, body } = parseFrontmatterBlock(text);
  const lines = body.split("\n");
  const sections = [];
  const headingPath = [];
  let title = null;
  let currentSection = null;
  let summaryLocked = false;
  const summaryLines = [];

  function flushSection() {
    if (!currentSection) {
      return;
    }

    const content = currentSection.contentLines.join("\n").trim();
    const items = currentSection.contentLines
      .map((line) => /^\s*[-*]\s+(.+?)\s*$/.exec(line)?.[1]?.trim() ?? null)
      .filter(Boolean);
    sections.push({
      title: currentSection.title,
      slug: currentSection.slug,
      depth: currentSection.depth,
      path: [...currentSection.path],
      content,
      items
    });
    currentSection = null;
  }

  for (const rawLine of lines) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(rawLine);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      const headingTitle = headingMatch[2].trim();
      if (depth === 1 && title === null) {
        flushSection();
        title = headingTitle;
        headingPath.length = 0;
        headingPath[0] = headingTitle;
        continue;
      }

      flushSection();
      summaryLocked = true;
      headingPath.length = Math.max(depth - 1, 0);
      headingPath[depth - 1] = headingTitle;
      const path = headingPath.filter(Boolean);
      currentSection = {
        title: headingTitle,
        depth,
        path,
        slug: path.map(slugifyHeading).filter(Boolean).join("--"),
        contentLines: []
      };
      continue;
    }

    if (currentSection) {
      currentSection.contentLines.push(rawLine);
      continue;
    }

    if (title && !summaryLocked) {
      summaryLines.push(rawLine);
    }
  }

  flushSection();

  const summary = summaryLines.join("\n").trim() || null;
  const itemCount = sections.reduce((total, section) => total + section.items.length, 0);
  const totalLines = lines.filter((line) => line.trim().length > 0).length;

  return {
    title,
    summary,
    frontmatter,
    counts: {
      totalLines,
      totalSections: sections.length,
      totalItems: itemCount,
      frontmatterFields: Object.keys(frontmatter).length
    },
    sections
  };
}

function resolveCatalogEntryFilePath(entryType, id) {
  if (entryType === "agent") {
    return resolveRuntimeCatalogPath(`agents/${id}.md`);
  }

  return (
    resolveRuntimeCatalogPath(`skills/${id}/SKILL.md`) ??
    resolveRuntimeCatalogPath(`skills/${id}.md`)
  );
}

function createCatalogDocumentView(entryType, id, entry) {
  let document = null;
  if (entry) {
    const resolvedPath = resolveCatalogEntryFilePath(entryType, entry.id);
    const parsed = parseCatalogDocument(readText(resolvedPath ?? ""));
    document = {
      entry,
      title: parsed.title,
      summary: parsed.summary,
      frontmatter: parsed.frontmatter,
      counts: parsed.counts,
      sections: parsed.sections
    };
  }

  return createResolvedItemView("runtime_catalog_document_view", {
    requestLabel: "id",
    requestValue: id,
    matchedLabel: "matchedId",
    matchedValue: entry?.id,
    valueLabel: "document",
    value: document,
    loadedReason: "catalog_document_loaded",
    missingReason: "catalog_document_missing",
    extra: {
      entryType
    }
  });
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

function createCatalogEntryView(entryType, id, entry) {
  return createResolvedItemView("runtime_catalog_entry_view", {
    requestLabel: "id",
    requestValue: id,
    matchedLabel: "matchedId",
    matchedValue: entry?.id,
    valueLabel: "entry",
    value: entry,
    loadedReason: "catalog_entry_loaded",
    missingReason: "catalog_entry_missing",
    extra: {
      entryType
    }
  });
}

export function getAgentCatalogEntryView(id) {
  return createCatalogEntryView("agent", id, getAgentCatalogEntry(id));
}

export function getAgentCatalogDocumentView(id) {
  return createCatalogDocumentView("agent", id, getAgentCatalogEntry(id));
}

export function getAgentCatalogListView() {
  const agents = listAgentCatalog();
  return createCollectionView("runtime_catalog_lane_view", "entries", agents, {
    loadedReason: "catalog_lane_loaded",
    emptyReason: "catalog_lane_empty",
    counts: {
      totalEntries: agents.length
    },
    extra: {
      entryType: "agent"
    }
  });
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

export function getSkillCatalogEntryView(id) {
  return createCatalogEntryView("skill", id, getSkillCatalogEntry(id));
}

export function getSkillCatalogDocumentView(id) {
  return createCatalogDocumentView("skill", id, getSkillCatalogEntry(id));
}

export function getSkillCatalogListView() {
  const skills = listSkillCatalog();
  return createCollectionView("runtime_catalog_lane_view", "entries", skills, {
    loadedReason: "catalog_lane_loaded",
    emptyReason: "catalog_lane_empty",
    counts: {
      totalEntries: skills.length
    },
    extra: {
      entryType: "skill"
    }
  });
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
