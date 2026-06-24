import { listAgentCatalog } from "./catalog-agent-core.js";
import { getRuntimeCatalogPaths, resolveRuntimeCatalogPath, toDisplayPath } from "./catalog-paths.js";
import { listSkillCatalog } from "./catalog-skill-core.js";

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
