import { readdirSync } from "node:fs";
import { join } from "node:path";
import { createCollectionView } from "./state-view-helpers.js";
import { parseFrontmatter } from "./catalog-document-parse.js";
import { createCatalogDocumentView, createCatalogEntryView } from "./catalog-entry-views.js";
import { getRuntimeCatalogPaths, isDirectory, readText, toDisplayPath } from "./catalog-paths.js";

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

export function listAgentRoleIds() {
  return listAgentCatalog().map((agent) => agent.id);
}
