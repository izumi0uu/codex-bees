import { readdirSync } from "node:fs";
import { join } from "node:path";
import { createCollectionView } from "../state-view-helpers.js";
import { parseFrontmatter } from "./document-parse.js";
import { createCatalogDocumentView, createCatalogEntryView } from "./entry-views.js";
import { getRuntimeCatalogPaths, isDirectory, isFile, readText, toDisplayPath } from "./paths.js";

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
